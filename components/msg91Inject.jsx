"use client";

import Script from "next/script";

export default function Msg91OtpScript() {
  const configuration = {
    widgetId: "35686471434f343736393031",
    tokenAuth: process.env.NEXT_PUBLIC_MSG91_AUTH,
    identifier: "",
    exposeMethods: true,
    captchaRenderId: "",
    success: (data) => {
    },
    failure: (error) => {
    },
  };

  return (
    <Script
      src="https://verify.msg91.com/otp-provider.js"
      strategy="afterInteractive"
      onLoad={() => {
        // ✅ Script loaded -> init
        window.initSendOTP?.(configuration);
      }}
    />
  );
}
