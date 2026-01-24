"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { Button } from "@/components/ui/button";
import CheckoutForm from "@/components/deliveryForm";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ------------------- Utils ------------------- */
const isValidPincode = (pin) => /^\d{6}$/.test(pin || "");
const isValidPhone = (phone) => /^\d{10,13}$/.test(phone || "");

const validateForm = (formData, cart, deliverySetSuccess) => {
    if (!formData || !Array.isArray(cart) || cart.length === 0) return false;

    const d = formData.delivery;
    const p = formData.preferences;

    if (!d) return false;

    return (
        d.firstName?.trim().length > 0 &&
        d.lastName?.trim().length > 0 &&
        d.fullAddress?.trim().length >= 10 &&
        d.city?.trim().length > 0 &&
        d.state?.trim().length > 0 &&
        isValidPincode(d.pincode) &&
        isValidPhone(d.phone) &&
        ["Online", "COD"].includes(p.paymentMethod) &&
        deliverySetSuccess === true
    );
};

// ✅ simple debounce hook (no extra libs)
const useDebounce = (value, delay = 500) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getTotalPrice, removeFromCart } = useCart();

    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        contact: { email: "" },
        delivery: {
            firstName: "",
            lastName: "",
            fullAddress: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
            phone: "",
            country: "India",
        },
        preferences: { saveAddress: false, paymentMethod: "" },
    });

    const [isFormValid, setIsFormValid] = useState(false);

    // shipping
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [loadingDelivery, setLoadingDelivery] = useState(false);
    const [deliverySetSuccess, setDeliverySetSuccess] = useState(false);

    // order placing
    const [loading, setLoading] = useState(false);

    // user profile
    const [userData, setUserData] = useState({ addresses: [] });
    const [showAddAddressUI, setShowAddAddressUI] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

    const DiscountPercent = 10;

    /* ------------------- Mount Guard ------------------- */
    useEffect(() => {
        setMounted(true);
    }, []);

    /* ------------------- Sync Cart to localStorage (optional) ------------------- */
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("cart", JSON.stringify(cart || []));
    }, [cart, mounted]);

    /* ------------------- Totals ------------------- */
    const itemTotal = useMemo(() => getTotalPrice(), [getTotalPrice, cart]);

    const savingsAmount = useMemo(() => {
        if (!cart?.length) return 0;
        return (itemTotal * DiscountPercent) / 100;
    }, [itemTotal, cart?.length]);

    const orderTotal = useMemo(() => {
        return Math.max(0, itemTotal - savingsAmount + (deliveryCharge || 0));
    }, [itemTotal, savingsAmount, deliveryCharge]);

    /* ------------------- Cart weight ------------------- */
    const cartWeight = useMemo(() => {
        if (!Array.isArray(cart)) return 0;
        return cart.reduce((total, item) => {
            const w = parseFloat(item.weight || 0); // KG per unit
            const qty = Number(item.quantity || 1);
            return total + w * qty;
        }, 0);
    }, [cart]);

    /* ------------------- Fetch User Profile If Logged In ------------------- */
    useEffect(() => {
        if (!mounted) return;

        const isOnboarded = localStorage.getItem("isOnboarded");
        const isLoggedin = localStorage.getItem("isLoggedin");
        if (!(isLoggedin || isOnboarded)) return;

        const fetchUserInfo = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/general/get-exsisting-customoer`,
                    { withCredentials: true }
                );

                const uData = res.data || {};

                setUserData({ ...uData, addresses: uData.addresses || [] });

                setFormData((prev) => ({
                    ...prev,
                    contact: { email: uData.email || "" },
                    delivery: {
                        ...prev.delivery,
                        firstName: uData.first_name || "",
                        lastName: uData.last_name || "",
                        phone: uData.phone_number?.startsWith("91")
                            ? uData.phone_number.slice(2)
                            : uData.phone_number || "",
                    },
                }));
            } catch (err) {
                console.error("Profile load error:", err?.message || err);
            }
        };

        fetchUserInfo();
    }, [mounted]);

    /* ------------------- Save Address (optional) ------------------- */
    useEffect(() => {
        if (!mounted) return;
        if (!formData.preferences.saveAddress) return;

        const dataToStore = {
            ...formData,
            preferences: { ...formData.preferences, paymentMethod: "" },
        };
        localStorage.setItem("userAddr", JSON.stringify(dataToStore));
    }, [formData, mounted]);

    /* ------------------- Form Validity ------------------- */
    useEffect(() => {
        setIsFormValid(validateForm(formData, cart, deliverySetSuccess));
    }, [formData, cart, deliverySetSuccess]);

    /* ------------------- Debounced Pincode ------------------- */
    const debouncedPincode = useDebounce(formData.delivery.pincode, 500);

    /* ------------------- Shipping Charge From Backend ------------------- */
    useEffect(() => {
        if (!mounted) return;

        const pincode = debouncedPincode;
        if (!isValidPincode(pincode)) {
            setDeliveryCharge(0);
            setDeliverySetSuccess(false);
            return;
        }

        if (!cart?.length) return;

        let alive = true;

        const run = async () => {
            try {
                setLoadingDelivery(true);

                // ✅ auto-fill city/state via Postal API
                const resPin = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

                if (resPin.data?.[0]?.Status === "Success") {
                    const office = resPin.data[0]?.PostOffice?.[0];
                    if (alive && office) {
                        setFormData((prev) => ({
                            ...prev,
                            delivery: {
                                ...prev.delivery,
                                city: prev.delivery.city || office?.District || "",
                                state: prev.delivery.state || office?.State || "",
                            },
                        }));
                        setDeliverySetSuccess(true);
                    }
                } else {
                    if (alive) {
                        setDeliverySetSuccess(false);
                        setDeliveryCharge(0);
                    }
                    return;
                }

                const cod = formData.preferences.paymentMethod === "COD" ? 1 : 0;

                const shipRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/general/get-shipping-charge`,
                    {
                        params: {
                            pincode,
                            cod,
                            weight: cartWeight,
                            orderValue: itemTotal,
                        },
                    }
                );

                if (alive && shipRes.data?.success) {
                    setDeliveryCharge(Number(shipRes.data.charge || 0));
                } else if (alive) {
                    setDeliveryCharge(0);
                }
            } catch (err) {
                console.error("Shipping charge error:", err?.message || err);
                if (alive) {
                    setDeliveryCharge(0);
                    setDeliverySetSuccess(false);
                }
            } finally {
                if (alive) setLoadingDelivery(false);
            }
        };

        run();

        return () => {
            alive = false;
        };
    }, [
        mounted,
        debouncedPincode,
        formData.preferences.paymentMethod,
        cart?.length,
        cartWeight,
        itemTotal,
    ]);

    /* ------------------- Input Handlers ------------------- */
    const handleInputChange = useCallback(
        (section, field) => (e) => {
            const val = e.target.value;
            setFormData((prev) => ({
                ...prev,
                [section]: { ...prev[section], [field]: val },
            }));

            // if pincode changed, reset delivery success until validated
            if (section === "delivery" && field === "pincode") {
                setDeliverySetSuccess(false);
                setDeliveryCharge(0);
            }
        },
        []
    );

    const handlePaymentChange = useCallback((method) => {
        setFormData((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, paymentMethod: method },
        }));
    }, []);

    /* ------------------- Address Select ------------------- */
    const handleAddressSelect = useCallback((address, index) => {
        setSelectedAddressIndex(index);
        setShowAddAddressUI(false);

        setFormData((prev) => ({
            ...prev,
            contact: { ...prev.contact, email: address.email || prev.contact.email || "" },
            delivery: {
                ...prev.delivery,
                ...address,
                phone: address.phone?.startsWith("91") ? address.phone.slice(2) : address.phone || "",
                country: address.country || "India",
            },
        }));

        // ✅ user selected a valid stored address
        setDeliverySetSuccess(true);
    }, []);

    /* ------------------- Transform Payload ------------------- */
    const transformToOrderDetails = useCallback(() => {
        return {
            customer_details: {
                customer_email: formData.contact.email,
                customer_phone: formData.delivery.phone,
                firstname: formData.delivery.firstName,
                lastname: formData.delivery.lastName,
            },
            shippingInfo: { ...formData.delivery, email: formData.contact.email },
            orderItems: cart,
            paymentMethod: formData.preferences.paymentMethod,
            order_amount: Number(orderTotal).toFixed(2),
            order_weight: cartWeight.toFixed(4),
            shipping_price: deliveryCharge,
            discount:savingsAmount,
            bill_amount: (Number(orderTotal).toFixed(2)-deliveryCharge)
        };
    }, [formData, cart, orderTotal, cartWeight, deliveryCharge]);

    /* ------------------- Place Order ------------------- */
    const placeOrder = useCallback(
        async (orderObj) => {
            setLoading(true);
            try {
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/general/create-order-guest`,
                    { order_details: JSON.stringify(orderObj) },
                    { withCredentials: true }
                );

                if (!data?.success) {
                    alert(data?.message || "Order creation failed.");
                    return;
                }

                if (data?.order?.paymentMethod === "Online") {
                    router.push(data.phonepe_checkout_url);
                } else {
                    router.push(`/order-success?orderId=${data?.order?.orderId}`);
                }
            } catch (error) {
                alert("Failed to place order: " + (error?.response?.data?.message || error?.message));
            } finally {
                setLoading(false);
            }
        },
        [router]
    );

    /* ------------------- Checkout Handler ------------------- */
    const CreateOrder = async (e) => {
        e.preventDefault();

        if (!isFormValid) return;

        if (mounted) {
            localStorage.setItem("initUser", JSON.stringify({ ...formData }));
        }

        await placeOrder(transformToOrderDetails());
    };

    /* ------------------- Guard ------------------- */
    if (!mounted) return null;

    if (!cart || cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 font-sans">
                <img src="/icons/empty-cart.png" alt="Empty Cart" className="w-40 h-40 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <Link href="/">
                    <Button className="bg-green-600 text-white px-6 py-2 rounded">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <button onClick={() => router.replace("/cart")} className="text-gray-900">
                        ←
                    </button>
                    Checkout
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT */}
                    <div className="flex-1 space-y-8">
                        {userData.addresses?.length > 0 && !showAddAddressUI ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-base font-semibold mb-4">Select Delivery Address</h2>

                                <div className="space-y-3">
                                    {userData.addresses.map((address, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleAddressSelect(address, idx)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressIndex === idx
                                                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedAddressIndex === idx ? "border-blue-600" : "border-gray-300"
                                                    }`}
                                            >
                                                {selectedAddressIndex === idx && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                                )}
                                            </div>

                                            <div className="flex-1 text-sm">
                                                <p className="font-semibold text-gray-900">
                                                    {address.firstName} {address.lastName}
                                                </p>
                                                <p className="text-gray-500 mt-1">{address.fullAddress}</p>
                                                <p className="text-gray-500">
                                                    {address.city}, {address.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => setShowAddAddressUI(true)}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm pl-0 bg-transparent hover:bg-transparent"
                                >
                                    + Add New Address
                                </Button>
                            </div>
                        ) : (
                            <CheckoutForm
                                cart={cart}
                                formData={formData}
                                setFormData={setFormData}
                                handleInputChange={handleInputChange}
                                handlePaymentChange={handlePaymentChange}
                                OnlineAvailable={true}
                            />
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-lime-500 sticky top-8">
                            {/* Products */}
                            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item) => (
                                    <div key={item.productId + item.variantSku} className="flex gap-4 relative group">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative">
                                            <Image
                                                src={item.image}
                                                width={80}
                                                height={80}
                                                alt={item.name || "Product"}
                                                className="object-cover w-full h-full"
                                            />
                                            {item.quantity > 1 && (
                                                <span className="absolute top-1 right-1 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                    {item.quantity}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-1">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {item.size} • {item.color || "Standard"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">₹{item.price}</span>
                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{(item.price * 1.2).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.variantSku)}
                                            className="absolute top-0 right-0 text-gray-900 hover:text-red-500 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Calculations */}
                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{Math.round(itemTotal)}</span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Discount</span>
                                    <span className="font-medium text-gray-900">
                                        {DiscountPercent}% (−₹{Math.round(savingsAmount)})
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Shipping</span>
                                    {loadingDelivery ? (
                                        <span className="text-xs animate-pulse">Calculating...</span>
                                    ) : deliverySetSuccess ? (
                                        <span className="font-medium text-gray-900">
                                            {deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-orange-500">Enter Zip</span>
                                    )}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between h-fit items-center rounded-lg bg-green-100 p-3 px-4 mt-6 mb-3">
                                <div className="kk">

                                    <span className="text-md font-bold text-gray-900 uppercase tracking-wider">
                                        Total
                                    </span>
                                </div>
                                <div className="amnt my-auto">

                                    <span className="text-3xl font-bold text-gray-900">
                                        ₹{Math.round(orderTotal)}
                                    </span>
                                    {savingsAmount > 0 && (
                                        <p className="text-sm text-center text-green-700">
                                            You saved ₹ {Math.round(savingsAmount)} !
                                        </p>
                                    )}
                                </div>
                            </div>



                            {/* Checkout Button */}
                            <Button
                                disabled={!isFormValid || loading}
                                onClick={CreateOrder}
                                className={`
                  w-full py-6 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200 transition-all
                  ${isFormValid
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }
                `}
                            >
                                {loading ? "Processing..." : "Checkout →"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-semibold text-blue-900">Processing Order...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
