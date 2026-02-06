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
const isValidPincode = (pin) => /^\d{6}$/.test((pin || "").toString().trim());
const isValidPhone = (phone) => /^\d{10}$/.test((phone || "").toString().trim());

const validateForm = (formData, cart, deliverySetSuccess) => {
  if (!formData || !Array.isArray(cart) || cart.length === 0) return false;

  const d = formData.delivery;
  const p = formData.preferences;
  if (!d || !p) return false;

  return (
    d.isPhoneVerified === true &&
    d.firstName?.trim() &&
    d.lastName?.trim() &&
    d.fullAddress?.trim().length >= 10 &&
    d.city?.trim() &&
    d.state?.trim() &&
    isValidPincode(d.pincode) &&
    isValidPhone(d.phone) &&
    ["Online", "COD"].includes(p.paymentMethod) &&
    deliverySetSuccess === true
  );
};

/* ------------------- Debounce ------------------- */
const useDebounce = (value, delay = 600) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

/* ------------------- Courier Helpers ------------------- */
const normalizeCouriers = (data) => {
  let raw = [];
  if (Array.isArray(data)) raw = data.flatMap((c) => c.data || []);
  else if (data && typeof data === "object")
    raw = Object.values(data).flatMap((c) => c?.data || []);

  return [
    ...new Map(
      raw
        .filter((c) => typeof c.totalPrice === "number")
        .map((c) => [`${c.carrierId}-${c.serviceId}`, c])
    ).values(),
  ].sort((a, b) => a.totalPrice - b.totalPrice);
};

const getBestCourier = (couriers) => {
  const fast = couriers.filter(
    (c) => (c.deliveryDate?.dateDifference ?? 999) <= 4
  );
  if (!fast.length) return null;
  return fast.sort((a, b) => a.totalPrice - b.totalPrice)[0];
};

const formatETA = (estimate) => {
  if (!estimate) return "";
  const days = parseInt(estimate.match(/\d+/)?.[0] || "0", 10);
  const d = new Date();
  d.setDate(d.getDate() + (days + 1));
  return d.toDateString();
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, removeFromCart } = useCart();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  const [formData, setFormData] = useState({
    contact: { email: "" },
    delivery: {
      firstName: "",
      lastName: "",
      fullAddress: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      phone: "",
      country: "India",
      isPhoneVerified: false,
    },
    preferences: { saveAddress: false, paymentMethod: "" },
  });

  const [isFormValid, setIsFormValid] = useState(false);

  /* ------------------- Shipping ------------------- */
  const [deliveryCharge, setDeliveryCharge] = useState(null);
  const [deliverySetSuccess, setDeliverySetSuccess] = useState(false);
  const [shippingStatus, setShippingStatus] = useState("idle");

  /* ------------------- Courier ------------------- */
  const [courierInfo, setCourierInfo] = useState(null);

  const DiscountPercent = 5;

  useEffect(() => setMounted(true), []);

  /* ------------------- Totals ------------------- */
  const itemTotal = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const savingsAmount = (itemTotal * DiscountPercent) / 100;

  const orderTotal = Math.max(
    0,
    itemTotal - savingsAmount + (shippingStatus === "ready" ? deliveryCharge : 0)
  );

  /* ------------------- Cart Weight ------------------- */
  const cartWeight = useMemo(() => {
    return cart.reduce(
      (t, i) => t + Number(i.weight || 0) * Number(i.quantity || 1),
      0
    );
  }, [cart]);

  /* ------------------- Input Handlers ------------------- */
  const handleInputChange = useCallback(
    (section, field) => (e) => {
      const val = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: val },
      }));

      if (section === "delivery" && field === "pincode") {
        setShippingStatus("idle");
        setDeliverySetSuccess(false);
        setCourierInfo(null);
        setDeliveryCharge(null);
      }
    },
    []
  );

  const handlePaymentChange = useCallback((method) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, paymentMethod: method },
    }));
    setShippingStatus("idle");
    setCourierInfo(null);
    setDeliveryCharge(null);
  }, []);

  /* ------------------- Form Validity ------------------- */
  useEffect(() => {
    setIsFormValid(validateForm(formData, cart, deliverySetSuccess));
  }, [formData, cart, deliverySetSuccess]);

  const debouncedPincode = useDebounce(formData.delivery.pincode, 700);
  const debouncedPayment = useDebounce(formData.preferences.paymentMethod, 500);

  /* =================== PINCODE → CITY / DISTRICT / STATE =================== */
  useEffect(() => {
    if (!isValidPincode(debouncedPincode)) return;

    let alive = true;

    const run = async () => {
      try {
        const res = await axios.get(
          `https://api.postalpincode.in/pincode/${debouncedPincode}`
        );

        const postOffice = res.data?.[0]?.PostOffice?.[0];
        if (!postOffice || !alive) return;

        setFormData((prev) => ({
          ...prev,
          delivery: {
            ...prev.delivery,
            city: prev.delivery.city || postOffice.District,
            district: prev.delivery.district || postOffice.District,
            state: prev.delivery.state || postOffice.State,
          },
        }));
      } catch (err) {
        console.error("Pincode lookup failed", err);
      }
    };

    run();
    return () => (alive = false);
  }, [debouncedPincode]);

  /* ------------------- Build orderInfo (For Courier API) ------------------- */
  const buildOrderInfo = useCallback(() => {
    return {
      orderId: "CHECKOUT_TMP",
      order_amount: Math.max(0, itemTotal - savingsAmount),
      orderItems: cart,
      customer_details: {
        firstname: formData.delivery.firstName,
        lastname: formData.delivery.lastName,
        customer_email: formData.contact.email || "",
        customer_phone: formData.delivery.phone,
      },
      shippingInfo: {
        address: formData.delivery.fullAddress,
        city: formData.delivery.city,
        state: formData.delivery.state,
      },
    };
  }, [cart, formData, itemTotal, savingsAmount]);

  /* ------------------- SMART COURIER LOGIC ------------------- */
  useEffect(() => {
    if (!mounted) return;

    const d = formData.delivery;

    if (
      !debouncedPayment ||
      !isValidPincode(debouncedPincode) ||
      !cart.length ||
      !d.firstName ||
      !d.lastName ||
      !d.fullAddress ||
      !d.city ||
      !d.state
    ) {
      return;
    }

    let alive = true;
    setShippingStatus("calculating");

    const run = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/general/list-available-couriers`,
          {
            pickup_postcode: "313001",
            delivery_postcode: debouncedPincode,
            cod: debouncedPayment === "COD" ? 1 : 0,
            weight: cartWeight,
            orderInfo: buildOrderInfo(),
          }
        );

        const couriers = normalizeCouriers(res.data?.data);
        if (!couriers.length) return;

        const best = getBestCourier(couriers);
        const cheapest = couriers[0];
        const finalCourier =
          best && best.totalPrice <= 100 ? best : cheapest;

        if (alive) {
          setCourierInfo(finalCourier);
          setDeliveryCharge(finalCourier.totalPrice);
          setShippingStatus("ready");
          setDeliverySetSuccess(true);
        }
      } catch (err) {
        console.error("Courier error:", err);
      }
    };

    run();
    return () => (alive = false);
  }, [
    mounted,
    debouncedPincode,
    debouncedPayment,
    cart.length,
    cartWeight,
    buildOrderInfo,
  ]);

  /* ================================================================= */
  /* ORDER PLACEMENT LOGIC                        */
  /* ================================================================= */

  /* ------------------- Transform Payload ------------------- */
  const transformToOrderDetails = useCallback(() => {
    // Logic from old page: Bill Amount is Total minus Shipping
    const billAmount = Math.max(0, Number(orderTotal) - Number(deliveryCharge || 0));

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
      shipping_price: Number(deliveryCharge || 0),
      discount: Number(savingsAmount || 0),
      bill_amount: billAmount.toFixed(2),
      // Optional: You can pass the selected courier info if your backend supports it
      courier_data: courierInfo || null, 
    };
  }, [formData, cart, orderTotal, cartWeight, deliveryCharge, savingsAmount, courierInfo]);

  /* ------------------- Place Order API Call ------------------- */
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
        alert(
          "Failed to place order: " +
            (error?.response?.data?.message || error?.message)
        );
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /* ------------------- Checkout Handler ------------------- */
  const CreateOrder = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isFormValid || loading || shippingStatus !== "ready") return;

      if (mounted) {
        localStorage.setItem("initUser", JSON.stringify({ ...formData }));
      }

      await placeOrder(transformToOrderDetails());
    },
    [isFormValid, loading, shippingStatus, mounted, formData, placeOrder, transformToOrderDetails]
  );


  if (!mounted) return null;

  /* ------------------- UI ------------------- */
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT */}
          <div className="flex-1">
            <CheckoutForm
              cart={cart}
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              handlePaymentChange={handlePaymentChange}
              OnlineAvailable
            />
          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-lime-500 sticky top-8">

              {/* PRODUCTS */}
              <div className="space-y-6 mb-8 min-h-fit pr-2">
                {cart.map((item) => (
                  <div key={item.variantSku} className="flex gap-4">
                    <Image
                      src={item.image}
                      width={80}
                      height={80}
                      alt={item.name}
                      className="rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.size} × {item.quantity}
                      </p>
                      <p className="font-bold">₹{item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.variantSku)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* CALC */}
              <div className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Items total</span>
                  <span>₹{Math.round(itemTotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−₹{Math.round(savingsAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingStatus === "idle" && "Select payment"}
                    {shippingStatus === "calculating" && "Calculating…"}
                    {shippingStatus === "ready" && `₹${deliveryCharge}`}
                  </span>
                </div>
              </div>

              {/* COURIER INFO */}
              {courierInfo && shippingStatus === "ready" && (
                <div className="mt-3 w-full flex justify-center items-center">
                  <span className=" text-xs text-black bg-green-200 w-fit p-1 px-2 rounded-full ">
                      Delivery Estimated • {" "}
                    {formatETA(courierInfo.deliveryEstimate)}
                  </span>
                </div>
              )}

              {/* TOTAL */}
              <div className="flex justify-between items-center mt-4 rounded-lg">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold">
                  ₹{Math.round(orderTotal)}
                </span>
              </div>

              {/* CHECKOUT BUTTON */}
              <Button
                disabled={!isFormValid || shippingStatus !== "ready" || loading}
                onClick={CreateOrder}
                className={`
                  w-full mt-6 py-6 rounded-2xl text-base font-semibold transition-all
                  ${(!isFormValid || shippingStatus !== "ready" || loading)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-lime-600 hover:bg-lime-700 text-white shadow-lg shadow-lime-200"}
                `}
              >
                {loading ? "Processing..." : "Checkout →"}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading Overlay (Optional, consistent with old page) */}
        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-lime-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-semibold text-lime-900">Processing Order...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}