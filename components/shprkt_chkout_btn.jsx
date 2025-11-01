"use client"
import { LucideArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";



function CheckoutComponent({ token }) { 


    
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const cssLink = document.createElement('link');
    cssLink.href = 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css';
    cssLink.rel = 'stylesheet';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Shiprocket checkout script.');
    };

    document.body.appendChild(script);

    return () => {
      document.head.removeChild(cssLink);
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async (e) => {
    if (window.HeadlessCheckout) {
      // 2. The hardcoded token is removed.
      // It now uses the 'token' prop passed into the component.
      window.HeadlessCheckout.addToCart(e, token, { fallbackUrl: "https://bynatablet.in/checkout-fallback" });
    } else {
      console.error('Checkout script is not loaded or HeadlessCheckout is not defined.');
    }
  };

  return (
    <>
      <button 
      className="flex w-full items-center justify-center rounded-lg bg-lime-500 p-2 text-lg font-semibold"
        id="buyNow" 
        onClick={handleCheckout} 
        disabled={!scriptLoaded || !token} // Also disable if no token is provided
      >
        <p className="mr-3">
        {scriptLoaded ? `Quick Checkout` : 'Loading...'}
        </p>
        <LucideArrowRight/>
        
      </button>

      <input type="hidden" value="www.bynatablet.in" id="sellerDomain" />
    </>
  );
}

export default CheckoutComponent;