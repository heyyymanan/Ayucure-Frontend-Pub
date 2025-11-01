"use client";

import { LucideArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

function CheckoutComponent({ token }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [shprktToken, setShprktToken] = useState("");

  useEffect(() => {
    // ✅ Initialize Shiprocket token from props
    if (token) setShprktToken(token);

    // ✅ Load Shiprocket checkout CSS
    const cssLink = document.createElement("link");
    cssLink.href =
      "https://checkout-ui.shiprocket.com/assets/styles/shopify.css";
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);

    // ✅ Load Shiprocket checkout script
    const script = document.createElement("script");
    script.src =
      "https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js";
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Shiprocket checkout script.");
    };

    document.body.appendChild(script);

    return () => {
      document.head.removeChild(cssLink);
      document.body.removeChild(script);
    };
  }, [token]);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!shprktToken) {
      console.error("Shiprocket token not available.");
      return;
    }

    if (window.HeadlessCheckout) {
      window.HeadlessCheckout.addToCart(e, shprktToken, {
        fallbackUrl: "https://bynatablet.in/checkout-fallback",
      });
    } else {
      console.error(
        "Checkout script not loaded or HeadlessCheckout is undefined."
      );
    }
  };

  return (
    <>
      <button
        id="buyNow"
        onClick={handleCheckout}
        disabled={!scriptLoaded || !shprktToken}
        className="flex w-full items-center justify-center rounded-lg bg-lime-500 p-2 text-lg font-semibold hover:bg-lime-600 transition"
      >
        <p className="mr-3">
          {scriptLoaded ? "Quick Checkout" : "Loading..."}
        </p>
        <LucideArrowRight />
      </button>

      {/* Required hidden input for Shiprocket */}
      <input type="hidden" value="www.bynatablet.in" id="sellerDomain" />
    </>
  );
}

export default CheckoutComponent;
