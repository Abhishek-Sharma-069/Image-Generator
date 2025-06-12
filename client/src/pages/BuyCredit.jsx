import React, { useContext, useState, useEffect } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const BuyCredit = () => {
  const { user, backendUrl, loadCreditsData, token, setShowLogin } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Get Razorpay key from environment variables
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID
  
  useEffect(() => {
    // Debug: Check if key is available
    if (!RAZORPAY_KEY) {
      console.error('Razorpay key not found in environment variables');
    }
  }, []);

  const paymentRazorpay = async (planName) => {
    try {
      if (!RAZORPAY_KEY) {
        toast.error('Payment configuration is missing');
        return;
      }

      if (!user || !token) {
        setShowLogin(true)
        return
      }

      setLoading(true)
      const planId = typeof planName === 'string' ? 
        { 'Basic': 1, 'Advanced': 2, 'Premier': 3 }[planName] : 
        planName;

      console.log('Initiating payment for plan:', { planName, planId });

      if (!planId) {
        throw new Error('Invalid plan selected');
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-razor`,
        { planId },
        { headers: { token } }
      )

      if (data.success) {
        console.log('Payment order created:', data.order);
        initpay(data)
      } else {
        console.error('Payment initiation failed:', data.message);
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Payment initiation error:', error.response?.data || error);
      toast.error(error.response?.data?.message || error.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  const initpay = async (order) => {
    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        return;
      }

      if (!RAZORPAY_KEY) {
        toast.error('Payment configuration is missing');
        return;
      }

      console.log('Initializing Razorpay payment:', {
        key: RAZORPAY_KEY,
        order: order
      });

      const options = {
        key: RAZORPAY_KEY,
        amount: order.order.amount,
        currency: order.order.currency || 'INR',
        name: 'ImageG Credits',
        description: `Buy ${order.planDetails.credits} Credits`,
        order_id: order.order.id,
        handler: async (response) => {
          try {
            console.log('Payment successful, verifying...', response);
            const { data } = await axios.post(
              `${backendUrl}/api/user/verify-razor`,
              response,
              { headers: { token } }
            )
            if (data.success) {
              await loadCreditsData()
              toast.success('Credits added successfully!')
              navigate('/')
            }
          } catch (error) {
            console.error('Payment verification error:', error.response?.data || error)
            toast.error(error.response?.data?.message || 'Payment verification failed')
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#000000'
        }
      }

      console.log('Razorpay options:', options);
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open()
    } catch (error) {
      console.error('Error in initpay:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  }

  return (
    <motion.div
    initial={{opacity:0.2, y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}}
    className='min-h-[80vh] text-center pt-14 mb-10'>
     <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our Subscription</button> 
     <h1 className='text-center text-3xl font-bold mb-6 sm:mb-10'>Choose the Subscription</h1>

     <div className='flex flex-wrap justify-center gap-6 text-left'>
      {plans.map((item, index)=>(
        <div key={index}
        className={`bg-pink-50 drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <img src={assets.logo_icon} alt='' width={40} />
          <p className='mt-3 mb-1 font-semibold'>{item.id}</p>
          <p className='text-sm'>{item.desc}</p>
          <p className='mt-6'>
            <span className='text-3xl font-medium'>₹{item.price}</span> / {item.credits} credits
          </p>
          <button 
            onClick={() => paymentRazorpay(item.id)} 
            disabled={loading || !RAZORPAY_KEY}
            className='w-full bg-blue-600 text-white mt-8 text-sm rounded-full py-2.5 min-w-52 disabled:opacity-50'
          >
            {loading ? 'Processing...' : user ? 'Purchase' : 'Get Started'}
          </button>
          {!RAZORPAY_KEY && <p className='text-red-500 text-xs mt-2'>Payment system is currently unavailable</p>}
        </div>
      ))}
     </div>
    </motion.div>
  )
}

export default BuyCredit