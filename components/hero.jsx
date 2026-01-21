"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Hero = () => {
  const textRef = useRef(null);
  const pngRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      pngRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power2.out" }
    ).fromTo(
      textRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 2, ease: "power2.out" },
      "-=0.5"
    );

    return () => tl.kill();
  }, []);

  return (
    <div className="hero flex justify-around flex-col-reverse p-3 md:flex-row md:p-5 lg:p-10 lg:pt-10 md:gap-y-10 2xl:p-10 2xl:mx-5 items-center ">
      <div
        ref={textRef}
        className="hero-left md:text-center flex flex-col  md:items-center md:justify-center"
      >
        <div className="herotext text-center ">
          <h1 className="lg:text-4xl xl:text-6xl md:text-3xl md:font-semibold md:text-center font-serif text-white  font-bold">
            Meet Our Heros !
          </h1>

          <h3 className="text-white text-base md:text-2xl md:mt-5  ">
            & Say Goodbye To Joint & Muscle Pains.
          </h3>
        </div>

        <button className="bg-lime-400 xl:text-4xl lg:text-5xl md:text-2xl hidden md:flex md:px-5 text-xl p-2 2xl:text-5xl font-serif rounded-3xl lg:mt-16 md:mt-8 transition-transform duration-200 hover:scale-105 hover:bg-lime-300">
          Shop Now
        </button>
      </div>

      <div className="heri-img-byna-medicine">
        <Image
          src="/Heros-white.png"
          alt="byna medicine"
          width={1029}
          height={492}
          className="hero-img mx-2 md:h-[240px] md:w-[500px] lg:w-[800px] lg:h-[380px] xl:w-[950px] xl:h-[390px] 2xl:w-[970px] 2xl:h-[460px]"
          ref={pngRef}
          priority
        />
      </div>
    </div>
  );
};

export default Hero;
