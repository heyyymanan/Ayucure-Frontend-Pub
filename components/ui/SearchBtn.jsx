"use client";
import { Search } from "lucide-react";
import React, { useRef, useEffect } from "react";

const SearchBtn = ({ isVisible, setIsVisible }) => {
  const inputRef = useRef(null);

  const handleBtnClick = () => {
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  return (
    <div className="flex items-center gap-2">
      {/* 
      <div
        className={`transition-all duration-700 ease-in-out ${
          isVisible ? "w-0" : "w-44"
        }`}
      /> */}

      {/* Input */}
      <input
        ref={inputRef}
        placeholder="Brahmi Oil..."
        type="text"
        className={`transition-all duration-700 ease-in-out border border-black rounded-xl
        ${isVisible ? "opacity-100 w-44 p-2" : "opacity-0 w-0 p-0"}
        `}
      />

      {/* Button */}
      <button onClick={handleBtnClick}>
        <Search size={28} />
      </button>
    </div>
  );
};

export default SearchBtn;
