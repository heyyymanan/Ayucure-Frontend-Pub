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
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useCart } from "@/app/context/CartContext";
import OTPOnClick from "@/lib/utils/MSG91";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search } from "lucide-react";

const navItems = ['Home', 'Shop All', 'About Us', 'Contact Us'];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const userMenuRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserOpen(false);
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
      localStorage.removeItem("isOnboarded")

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
            Welcome! Get 10% OFF On All Your Purchase. | Shop Now
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
        <div className="flex items-center gap-3 md:px-2 p-4">
          <button onClick={()=>{router.replace('/shop-all')}}>

            <Search />
          </button>
          {/* Cart */}
          <Link href="/cart">
            <div className="relative">
              <HugeiconsIcon icon={Trolley01FreeIcons} size={isMobile ? 20 : 25} color="currentColor" strokeWidth={1} />
              <span className="absolute -top-1 left-4 bg-white text-black border border-black rounded-full w-[17px] h-[17px] text-[11px] flex items-center justify-center font-bold">
                {cart.length}
              </span>
            </div>
          </Link>
          {/*
        <div className="relative ml-2" ref={userMenuRef}>
          {isLoggedIn ? (
            <HugeiconsIcon
              onClick={() => setIsUserOpen(!isUserOpen)}
              icon={User03Icon}
              size={isMobile ? 20 : 25}
              color="currentColor"
              strokeWidth={2}
              className="cursor-pointer"
            />
          ) : (
            isMobile ? <></> : <OTPOnClick />
          )}
        */}

          {/* Dropdown */}
          {isUserOpen && (
            <div className="absolute right-0 top-10 bg-white text-black rounded shadow-md z-50 w-48 py-2">
              <div className="px-4 py-2 font-semibold border-b">Hi!</div>
              <Link href="/user/my-orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          )}

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

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden flex flex-col bg-[#1d1f24] px-6 py-4 space-y-4 text-lg font-serif transition-all duration-300">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`/${item.replace(/ /g, "-").toLowerCase()}`}
              className="hover:text-gray-300 text-center border py-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-300 text-center border py-1">
              🛒 My Cart
            </Link>
          ) : null}
        </div>
      )}

      <hr className="border-t border-gray-700" />

      {/* ✅ Fullscreen Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
