"use client";

import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add product with specific variant SKU
  const addToCart = (product, variantSku) => {
    const variant = product.variants.find((v) => v.sku === variantSku);
    
    if (!variant) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variantSku === variantSku);
      if (existingItem) {
        
        return prevCart.map((item) =>
          item.variantSku === variantSku ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            collection_id: product.collection_id,
            shprkt_id: variant.shiprocket_variant_id,
            productId: product._id,
            variantSku: variant.sku,
            name: product.name,
            company: product.company,
            image: product.images[0], // you can include multiple if needed
            size: variant.size,
            price: variant.price,
            weight: variant.weight,
            quantity: 1,
          },
        ];
      }
    });
  };

  // Increment quantity
  const incrementQuantity = (variantSku) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.variantSku === variantSku ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement quantity
  const decrementQuantity = (variantSku) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.variantSku === variantSku ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeFromCart = (variantSku) => {
    setCart((prevCart) => prevCart.filter((item) => item.variantSku !== variantSku));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // Total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart
export const useCart = () => useContext(CartContext);
