"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

/* ---------------- AXIOS CONFIG ---------------- */

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

/* ---------------- TRACK SENDER ---------------- */

const sendTrack = async (body) => {
  try {
    await API.post("/general/track", body);
  } catch (e) {
    // silent — tracking must never break checkout
  }
};

/* ---------------- SESSION ---------------- */

const getSessionId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("guest_session_id");
};

/* ================= COMPONENT ================= */

export default function CheckoutTracker({
  cart,
  itemTotal,
  orderTotal,
  paymentMethod,
}) {
  const mountedRef = useRef(false);
  const sessionId = getSessionId();

  /* ---------- PAGE VIEW ---------- */

  useEffect(() => {
    if (!sessionId || mountedRef.current) return;
    mountedRef.current = true;

    sendTrack({
      type: "checkout_view",
      sessionId,
      payload: {
        cartCount: cart.length,
        total: itemTotal,
      },
      ts: Date.now(),
    });
  }, [sessionId]);

  /* ---------- CART SNAPSHOT ---------- */

  useEffect(() => {
    if (!sessionId || !cart?.length) return;

    sendTrack({
      type: "checkout_cart_snapshot",
      sessionId,
      payload: {
        items: cart.map((i) => ({
          sku: i.variantSku,
          qty: i.quantity,
          price: i.price,
        })),
        total: itemTotal,
      },
      ts: Date.now(),
    });
  }, [cart, itemTotal, sessionId]);

  /* ---------- ABANDON BEACON ---------- */

  useEffect(() => {
    if (!sessionId) return;

    const handler = () => {
      const data = {
        type: "checkout_abandon",
        sessionId,
        payload: {
          cartCount: cart.length,
          total: orderTotal,
          paymentMethod,
        },
        ts: Date.now(),
      };

      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/general/track`,
        JSON.stringify(data)
      );
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sessionId, cart.length, orderTotal, paymentMethod]);

  return null;
}

/* ================= MANUAL TRACK ================= */

export const trackCheckoutEvent = async (type, payload = {}) => {
  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("guest_session_id")
      : null;

  if (!sessionId) return;

  await sendTrack({
    type,
    sessionId,
    payload,
    ts: Date.now(),
  });
};
