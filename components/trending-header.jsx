"use client";

import { useRef } from "react";
import { Fire } from "@/components/ui/fire";

export default function TrendingHeader() {
  const sectionRef = useRef(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 🔥 Title row */}
      <div className="flex items-center justify-center mt-5">
        <Fire />
        <h1
          ref={sectionRef}
          className="lg:text-5xl text-3xl mt-1 mx-3 text-white md:mt-4 md:mx-10 font-serif"
        >
          Trending Products
        </h1>
        <Fire />
      </div>


    </>
  );
}
