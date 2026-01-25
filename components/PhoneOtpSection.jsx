import React, { useEffect, useState } from "react";
import { CircleCheckBig } from "lucide-react";

export default function PhoneOtpSection({
  formData,
  setFormData,
  checkCustomerByPhone,
  phoneLoading,
  inputClass,
  labelClass,
}) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validatePhone = (value) => {
    if (!value) return "Phone number is required";
    const cleaned = value.toString().replace(/\D/g, "");
    if (cleaned.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
  };

  const getPhoneWithCountry = () => {
    const phone = formData?.delivery?.phone?.toString().replace(/\D/g, "");
    if (!phone || phone.length !== 10) return null;
    return `91${phone}`;
  };

  const verifyOtpTokenOnBackend = async (token) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/general/verify-phone-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    const data = await res.json();
    if (!res.ok || !data?.verified) {
      throw new Error(data?.message || "Backend verification failed");
    }
    return data;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value?.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        phone: value,
        isPhoneVerified: false,
        verifiedPhone: "",
      },
    }));

    const err = validatePhone(value);
    setPhoneError(err);

    // reset otp states
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage("");
    setResendTimer(0);
  };

  const sendOtpHandler = async () => {
  setOtpLoading(true);
  setOtpMessage("");

  const phoneErrorCheck = validatePhone(formData?.delivery?.phone);
  setPhoneError(phoneErrorCheck);

  if (phoneErrorCheck) {
    setOtpMessage("⚠️ Enter a valid 10 digit phone number first.");
    setOtpLoading(false);
    return;
  }

  const phone = getPhoneWithCountry();
  if (!phone) {
    setOtpMessage("⚠️ Enter a valid 10 digit phone number first.");
    setOtpLoading(false);
    return;
  }

  if (!window?.sendOtp) {
    setOtpMessage("❌ OTP script not loaded. Refresh the page once.");
    setOtpLoading(false);
    return;
  }

  window.sendOtp(
    phone,
    () => {
      setOtpSent(true);
      setOtpMessage("✅ OTP sent successfully!");
      setResendTimer(60);
      setOtpLoading(false); // ✅ stop loader here
    },
    () => {
      setOtpMessage("❌ Failed to send OTP. Try again.");
      setOtpLoading(false); // ✅ stop loader here
    }
  );
};


  const verifyOtpHandler = async () => {
    try {
      setOtpLoading(true);
      setOtpMessage("");

      const phone = getPhoneWithCountry();
      if (!phone) {
        setOtpMessage("⚠️ Enter valid phone number first.");
        return;
      }

      if (!otp || otp.length !== 4) {
        setOtpMessage("⚠️ Enter the 4 digit OTP.");
        return;
      }

      if (!window?.verifyOtp) {
        setOtpMessage("❌ OTP script not loaded. Refresh the page once.");
        return;
      }

      setOtpMessage("Checking OTP...");

      window.verifyOtp(
        otp,
        async (msg91Res) => {
          const token = msg91Res?.message;
          if (!token) {
            setOtpVerified(false);
            setOtpMessage("❌ Token not found in MSG91 response.");
            setOtpLoading(false);
            return;
          }

          try {
            setOtpMessage("Verifying with server...");
            const backendRes = await verifyOtpTokenOnBackend(token);

            setOtpVerified(true);
            setOtpMessage("Phone verified successfully!");

            setFormData((prev) => ({
              ...prev,
              delivery: {
                ...prev.delivery,
                isPhoneVerified: true,
                verifiedPhone: backendRes?.mobile || prev.delivery.phone,
              },
            }));

            // ✅ ✅ only after OTP verified
            const rawPhone = formData?.delivery?.phone
              ?.toString()
              .replace(/\D/g, "");

            if (rawPhone && rawPhone.length === 10) {
              await checkCustomerByPhone(rawPhone);
            }
          } catch (err) {
            console.error("Backend verification failed ❌", err);
            setOtpVerified(false);
            setOtpMessage("❌ Server verification failed. Try again.");
          } finally {
            setOtpLoading(false);
          }
        },
        () => {
          setOtpVerified(false);
          setOtpMessage("❌ Invalid OTP. Try again.");
          setOtpLoading(false);
        }
      );
    } catch (err) {
      console.error("OTP flow error ❌", err);
      setOtpVerified(false);
      setOtpMessage("❌ Something went wrong. Try again.");
      setOtpLoading(false);
    }
  };

  const resendOtpHandler = async () => {
    try {
      if (resendTimer > 0) return;

      setOtpLoading(true);
      setOtpMessage("");

      if (!window?.retryOtp) {
        setOtpMessage("❌ OTP script not loaded. Refresh the page once.");
        return;
      }

      setOtpMessage("Resending OTP...");

      window.retryOtp(
        '11',
        (data) => {
          setOtpMessage("✅ OTP resent successfully!");
          setResendTimer(60);
        },
        (error) => {
          setOtpMessage("❌ Failed to resend OTP.");
        }
      );
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className={`relative w-full mb-4 ${otpVerified?'bg-gradient-to-t select-none cursor-not-allowed':''} from-green-200 to-lime-300  p-2 rounded-xl`}>
      <label className={labelClass}>Phone</label>

      <div className="flex flex-col gap-3">
        <div className="relative flex items-center gap-3">
          <div className={`relative flex-1 `}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              +91
            </span>
            <input
              type="tel"
              placeholder="10-Digits"
              value={formData.delivery.phone}
              onChange={handlePhoneChange}
              className={`${inputClass(phoneError)} pl-10 ${otpVerified?'cursor-not-allowed':''}`}
              maxLength={10}
              disabled={otpVerified}
            />
          </div>

          {!otpVerified ? (
            <button
              type="button"
              onClick={sendOtpHandler}
              disabled={
                otpLoading ||
                otpSent ||
                !!phoneError ||
                formData.delivery.phone?.toString().length !== 10
              }
              className="px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-b from-lime-500 to-lime-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? "Sending.." : otpSent ? "OTP Sent !" : "Send OTP"}
            </button>
          ) : (
            <div className="p-2 flex gap-2 rounded-xl items-center justify-center font-semibold text-white bg-green-600 select-none">
              <CircleCheckBig size={17}/> Verified
            </div>
          )}
        </div>

        {otpSent && !otpVerified && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value?.slice(0, 4))}
                className={`${inputClass(null)} flex-1`}
              />

              <button
                type="button"
                onClick={verifyOtpHandler}
                disabled={otpLoading || otp.length !== 4}
                className="px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-b from-blue-500 to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? "..." : "Verify OTP"}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={resendOtpHandler}
                disabled={otpLoading || resendTimer > 0}
                className={`font-semibold underline transition ${
                  resendTimer > 0 || otpLoading
                    ? "text-gray-400 cursor-not-allowed no-underline"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                Resend OTP
              </button>

              {resendTimer > 0 ? (
                <span className="text-gray-500">
                  Resend in <b>{resendTimer}s</b>
                </span>
              ) : (
                <div className="text-green-600 flex font-semibold gap-2 mt-2">
                  You can resend now <CircleCheckBig size={18} />
                </div>
              )}
            </div>
          </div>
        )}

        {phoneLoading && (
          <p className="text-blue-600 text-xs ml-1">Checking customer…</p>
        )}

        {phoneError && (
          <p className="text-red-500 text-xs ml-1">{phoneError}</p>
        )}

        {otpMessage ? (
          <div className="flex justify-center items-center mt-3 gap-2 text-green-700">
            {otpVerified ? <CircleCheckBig color="green" /> : ""}
            <p className="text-sm ml-1">{otpMessage}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
