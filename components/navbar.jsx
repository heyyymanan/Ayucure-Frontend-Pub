"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02FreeIcons,
  Trolley01FreeIcons,
  User03Icon
} from "@hugeicons/core-free-icons/index";
import { FaBars, FaBoxOpen, FaChevronRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search } from "lucide-react";

const navItems = ['Home', 'Shop All', 'About Us', 'Contact Us'];
const navItemsPhone = ['Home', 'Shop All', 'About Us', 'Contact Us'];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ref attached to the wrapper of the icon + dropdown
  const userMenuRef = useRef(null);
  const dropDownMenuRef = useRef(null);
  const { cart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedin") === "true");
    };

    checkLogin();

    const onStorageChange = (event) => {
      if (event.key === "isLoggedin") checkLogin();
    };

    const onLoginStatusChanged = () => checkLogin();

    window.addEventListener("storage", onStorageChange);
    window.addEventListener("loginStatusChanged", onLoginStatusChanged);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("loginStatusChanged", onLoginStatusChanged);
    };
  }, []);

  // Optimized Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserOpen(false);
      }
      else if (dropDownMenuRef.current && !dropDownMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("isLoggedin");
      localStorage.removeItem("user");
      localStorage.removeItem("isOnboarded");

      setIsUserOpen(false);
      setIsLoggedIn(false);

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      alert("Logout Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-[#222831] text-white sticky top-0 z-10 w-full">
      {/* Top Bar */}
      <div className="lg:flex md:justify-between max-w-screen md:p-1">
        <div className="flex md:justify-start justify-center text-sm md:ml-5 items-center">
          <HugeiconsIcon icon={Call02FreeIcons} size={20} color="currentColor" strokeWidth={1} />
          <p>+91-9928077671</p>
        </div>
        <div className="hidden md:flex justify-center md:ml-0 md:w-fit items-center text-sm w-full">
          <Link href="/shop-all">
            Welcome! Get 5% OFF On All Your Purchase. | Shop Now
          </Link>
        </div>
        <div className={`div ${isLoggedIn ? "" : "ml-20"}`}></div>
      </div>

      <hr className="border-t border-gray-700" />

      {/* Main Nav */}
      <div className="md:p-2 h-16 flex justify-between items-center relative">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 px-2">
            <Image src="/icons/logo.png" alt="logo" width={45} height={45} priority />
            <h1 className="lg:text-2xl text-xl font-serif">Shreeji Remedies</h1>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center lg:ml-0 lg:text-xl font-serif">
          <ul className="flex items-center gap-3">
            {navItems.map((item, index) => (
              <li key={item} className="flex items-center">
                <Link
                  href={`/${item.replace(/ /g, "-").toLowerCase()}`}
                  className="relative text-white hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item}
                </Link>
                {index < navItems.length - 1 && (
                  <span className="h-6 w-[1px] bg-gray-400 mx-3.5"></span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:px-2 mx-auto md:mx-0">
          <button onClick={() => { router.replace('/shop-all') }} className="mr-0 pr-0 ">
            <Search size={isMobile ? 23 : 28} />
          </button>

          {/* Cart */}
          <Link href="/cart">
            <div className="relative">
              <HugeiconsIcon icon={Trolley01FreeIcons} size={isMobile ? 20 : 25} color="currentColor" strokeWidth={2} className="ml-1" />
              <span className="absolute -top-1 left-4 bg-white text-black border border-black rounded-full w-[17px] h-[17px] text-[11px] flex items-center justify-center font-bold">
                {cart.length}
              </span>
            </div>
          </Link>

          {/* User Dropdown Section Wrapper */}
          <div className="relative hidden md:flex  items-center" ref={userMenuRef}>
            <div className="account">
              <HugeiconsIcon
                onClick={() => setIsUserOpen(!isUserOpen)}
                icon={User03Icon}
                size={isMobile ? 20 : 25}
                color="currentColor"
                strokeWidth={2}
                className="cursor-pointer"
              />
            </div>

            {isUserOpen && (
              <div className="absolute select-none right-0 top-10 bg-gradient-to-b from-gray-500 to-gray-800 text-white rounded shadow-md z-50 w-48 py-2">

                <>
                  <div className="px-4 py-2 font-semibold border-b">Hi!</div>
                  <Link
                    href="/user/my-orders"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-black rounded-full m-1"
                    onClick={() => setIsUserOpen(false)}
                  >
                    Track Orders
                  </Link>

                </>

              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden block cursor-pointer">
            {isMobileMenuOpen ? (
              <IoClose className="text-2xl" onClick={() => setIsMobileMenuOpen(false)} />
            ) : (
              <FaBars className="text-lg" onClick={() => setIsMobileMenuOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Wrapper - Place this directly under your Navbar container */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-[#1d1f24]/95 backdrop-blur-md border-t border-gray-800 shadow-2xl transition-all duration-300 ease-in-out origin-top z-40 ${isMobileMenuOpen
          ? "opacity-100 scale-y-100 translate-y-0"
          : "opacity-0 scale-y-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <div className="flex flex-col px-6 py-6 space-y-2 font-serif"  ref={dropDownMenuRef}>
         

          {/* Navigation Links */}
          {navItemsPhone.map((item) => (
            <Link
              key={item}
              href={`/${item.replace(/ /g, "-").toLowerCase()}`}
              className="group flex items-center justify-between py-3 border-b border-gray-700/50 text-gray-200 hover:text-white hover:pl-2 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-lg tracking-wide">{item}</span>
              {/* Subtle arrow that appears on hover/active */}
              <FaChevronRight className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}

          {/* Track Orders - Styled as a Highlighted Button */}
          <div className="pt-4 mt-2">
            <Link
              href="/user/my-orders" // Updated to match your UserOrders route
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-lime-500 text-black font-bold py-3 rounded-lg shadow-lg hover:bg-lime-400 active:scale-95 transition-all duration-200"
            >
              <FaBoxOpen className="text-lg" />
              <span>Track Your Orders</span>
            </Link>
          </div>

        </div>

        {/* Optional: Bottom Footer Info (Phone number, etc.) */}
        <div className="bg-[#15171a] py-3 text-center text-xs text-white font-sans uppercase tracking-widest">
          © Shreeji Remedies
        </div>
      </div>

      <hr className="border-t border-gray-700" />

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;