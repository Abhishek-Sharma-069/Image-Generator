import { useState, useEffect } from 'react';

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the popup has been shown before
    const hasSeenPopup = localStorage.getItem('hasSeenPopup');
    
    if (!hasSeenPopup) {
      // Show popup after a short delay when component mounts
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);
  const closePopup = () => {
    setIsOpen(false);
    // Set flag in localStorage so popup won't show again
    localStorage.setItem('hasSeenPopup', 'true');
  };

  if (!isOpen) return null;

  return (    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in-down">
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <img src="/cross_icon.svg" alt="Close" className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <img src="/logo.svg" alt="Logo" className="mx-auto mb-6 h-16" />
          <h2 className="text-3xl font-bold mb-4 text-gray-800 bg-gradient-to-r from-teal-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to Image Generator!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Transform your ideas into stunning images with our AI-powered image generation tool. Get started with 5 free credits!
              </p>
              <p className='text-gray-700 mb-2 mt-2 text-sm'>Note: May be image will not generate due to many hits on Clipdrop API.
                  Very soon i will add my own model for image generation.
              </p>
          
          <div className="space-y-4">
            <button
              onClick={closePopup}
              className="w-full bg-gradient-to-r from-teal-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg"
            >
              Get Started Now
            </button>
            <button
              onClick={closePopup}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
