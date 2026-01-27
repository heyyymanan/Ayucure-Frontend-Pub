"use client";

import { React } from "react";
import { useCart } from "@/app/context/CartContext";
import { LucideMinusCircle, LucidePlusCircle } from "lucide-react";

const AddToCartButton = ({ product, variantSku, ref }) => {
  const {
    cart,
    addToCart,
    incrementQuantity,
    decrementQuantity,
  } = useCart();

  const cartItem = cart.find((item) => item.variantSku === variantSku);

  // console.log(product)

  // 🔔 Emit a custom 'storage' event manually
  const triggerStorageEvent = () => {
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart',
      newValue: JSON.stringify(cart),
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, variantSku, ref);
    triggerStorageEvent();
  };

  const handleIncrement = () => {
    incrementQuantity(variantSku);
    triggerStorageEvent();
  };

  const handleDecrement = () => {
    decrementQuantity(variantSku);
    triggerStorageEvent();
  };

  return (
    <>
      {cartItem ? (
        <div
          ref={ref}
          className="flex border-2 p-2 border-lime-500 rounded-lg items-center justify-evenly gap-3 sm:gap-4"
        >
          <button
            onClick={handleDecrement}
            className="text-gray-700 mx-1 hover:text-gray-900"
          >
            <LucideMinusCircle size={24} />
          </button>
          <span className="sm:text-lg text-base font-medium">
            {cartItem.quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="text-gray-700 mx-1 hover:text-gray-900"
          >
            <LucidePlusCircle size={24} />
          </button>
        </div>
      ) : (
        <div className="addToCart flex justify-center mt-1 ">
          <button
            onClick={handleAddToCart}
            className="p-2 gap-2 text-lg font-serif sm:text-xl bg-lime-500 text-white flex items-center justify-center rounded-lg hover:bg-blue-700 transition-all"
          >
            <span className=" ">Add to Cart</span>
          </button>
        </div>
      )}
    </>
  );
};

export default AddToCartButton;
