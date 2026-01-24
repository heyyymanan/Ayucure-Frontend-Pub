import React, { useState } from "react";

export default function CheckoutForm({
  cart,
  formData,
  handleInputChange,
  handlePaymentChange,
  OnlineAvailable,
  setFormData, // ✅ ADD THIS PROP FROM PARENT
}) {
  const [errors, setErrors] = useState({});
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // ✅ Validate field function
  const validateField = (section, field, value) => {
    let errorMsg = "";

    if (section === "contact" && field === "email") {
      if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(value)) errorMsg = "Invalid email address";
    }

    if (section === "delivery") {
      switch (field) {
        case "firstName":
        case "lastName":
          if (!value) errorMsg = `${field === "firstName" ? "First" : "Last"} name is required`;
          else if (value.length < 2) errorMsg = `${field === "firstName" ? "First" : "Last"} name must be at least 2 characters`;
          break;

        case "fullAddress":
          if (!value) errorMsg = "Full address is required";
          else if (value.length < 10) errorMsg = "Address must be at least 10 characters";
          break;

        case "pincode":
          if (!value) errorMsg = "Pincode is required";
          else if (!/^\d{6}$/.test(value.toString())) errorMsg = "Pincode must be exactly 6 digits";
          break;

        case "city":
          if (!value) errorMsg = "City is required";
          break;

        case "state":
          if (!value) errorMsg = "State is required";
          break;

        case "phone":
          if (!value) errorMsg = "Phone number is required";
          else if (!/^\d{10}$/.test(value.toString())) errorMsg = "Phone number must be exactly 10 digits";
          break;

        default:
          break;
      }
    }

    return errorMsg;
  };

  // ✅ Fill form from existing customer
  const autofillCustomerDetails = (customer) => {
    if (!customer) return;

    setFormData((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        phone: customer.phone || prev.delivery.phone,
        firstName: customer.firstName || prev.delivery.firstName,
        lastName: customer.lastName || prev.delivery.lastName,
        fullAddress: customer.fullAddress || prev.delivery.fullAddress,
        landmark: customer.landmark || prev.delivery.landmark,
        pincode: customer.pincode || prev.delivery.pincode,
        city: customer.city || prev.delivery.city,
        state: customer.state || prev.delivery.state,
        country: customer.country || prev.delivery.country,
      },
      contact: {
        ...prev.contact,
        email: customer.email || prev.contact.email,
      },
    }));
  };

  // ✅ API call: check phone in DB
  const checkCustomerByPhone = async (phone) => {
    try {
      setPhoneLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/general/get-exsisting-customoer?phone=${phone}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();
      console.log("LOOKUP RESPONSE ✅", data);

      if (!res.ok) return;

      // ✅ Fix: your API returns user.address not customer
      if (data?.found && data?.user?.address) {
        const mergedCustomer = {
          ...data.user,
          ...data.user.address,
        };

        setExistingCustomer(mergedCustomer);
        setShowAddressPopup(true);
      }
    } catch (err) {
      console.error("Phone lookup failed:", err);
    } finally {
      setPhoneLoading(false);
    }
  };


  // ✅ Handle input change + validate + trigger lookup
  const handleChangeAndValidate = (section, field) => async (e) => {
    handleInputChange(section, field)(e);

    const error = validateField(section, field, e.target.value);
    setErrors((prev) => ({
      ...prev,
      [`${section === "contact" ? "contactEmail" : `delivery_${field}`}`]: error,
    }));

    // ✅ trigger phone lookup when 10 digits entered
    if (section === "delivery" && field === "phone") {
      const phone = e.target.value?.toString().replace(/\D/g, "");
      if (phone.length === 10) {
        await checkCustomerByPhone(phone);
      }
    }
  };

  const inputClass = (error) => `
    w-full bg-gray-50 border ${error ? "border-red-500" : "border-gray-200"} 
    rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400
    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
    transition-colors
  `;

  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

  if (cart.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[100px] bg-white/70 backdrop-blur-md text-gray-700 font-semibold text-2xl mx-auto max-w-3xl p-6 select-none">
        No Item In Your Cart
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 font-sans border p-5 rounded-3xl border-lime-500 shadow-xl relative">

      {/* ✅ Popup Modal */}
      {showAddressPopup && existingCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Are You a Returning Customer ?</h3>

            <div className="text-sm text-gray-700 space-y-1 border rounded-xl p-4 bg-gray-50">
              <p><b>Name:</b> {existingCustomer.firstName} {existingCustomer.lastName}</p>
              <p><b>Phone:</b> {existingCustomer.phone}</p>
              <p><b>Email:</b> {existingCustomer.email || "—"}</p>
              <p><b>Address:</b> {existingCustomer.fullAddress}</p>
              <p><b>Landmark:</b> {existingCustomer.landmark || "—"}</p>
              <p><b>Pincode:</b> {existingCustomer.pincode}</p>
              <p><b>City:</b> {existingCustomer.city}</p>
              <p><b>State:</b> {existingCustomer.state}</p>
              <p><b>Country:</b> {existingCustomer.country}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  autofillCustomerDetails(existingCustomer);
                  setShowAddressPopup(false);
                }}
                className="flex-1 bg-gradient-to-b from-lime-500 to-lime-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Yes, Autofill
              </button>

              <button
                onClick={() => setShowAddressPopup(false)}
                className="flex-1 bg-gradient-to-b from-red-500 to-red-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Contact Information */}
      <h3 className="text-base font-semibold text-gray-900 mb-4">1. Contact Information</h3>

      {/* Phone */}
      <div className="relative w-fit mb-4">
        <label className={labelClass}>Phone</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">+91</span>
          <input
            type="tel"
            placeholder="10-Digits"
            value={formData.delivery.phone}
            onChange={handleChangeAndValidate("delivery", "phone")}
            className={`${inputClass(errors.delivery_phone)} pl-10`}
            maxLength={10}
          />
        </div>

        {phoneLoading && <p className="text-blue-600 text-xs mt-1 ml-1">Checking customer…</p>}
        {errors.delivery_phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_phone}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* First Name */}
        <div>
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            placeholder="Enter Your First Name"
            value={formData.delivery.firstName}
            onChange={handleChangeAndValidate("delivery", "firstName")}
            className={inputClass(errors.delivery_firstName)}
          />
          {errors.delivery_firstName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_firstName}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            placeholder="Enter Your Last Name"
            value={formData.delivery.lastName}
            onChange={handleChangeAndValidate("delivery", "lastName")}
            className={inputClass(errors.delivery_lastName)}
          />
          {errors.delivery_lastName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_lastName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={formData.contact.email}
            onChange={handleChangeAndValidate("contact", "email")}
            className={inputClass(errors.contactEmail)}
          />
          {errors.contactEmail && <p className="text-red-500 text-xs mt-1 ml-1">{errors.contactEmail}</p>}
        </div>
      </div>

      {/* SECTION 2: Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Full Address */}
        <div className="md:col-span-2">
          <label className={labelClass}>Full Address</label>
          <input
            type="text"
            placeholder="Please Enter Your Full Address"
            value={formData.delivery.fullAddress}
            onChange={handleChangeAndValidate("delivery", "fullAddress")}
            className={inputClass(errors.delivery_fullAddress)}
          />
          {errors.delivery_fullAddress && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_fullAddress}</p>}
        </div>

        {/* Landmark */}
        <div className="md:col-span-2">
          <label className={labelClass}>Landmark (Optional)</label>
          <input
            type="text"
            placeholder="Near Park"
            value={formData.delivery.landmark}
            onChange={handleInputChange("delivery", "landmark")}
            className={inputClass(null)}
          />
        </div>

        {/* Pincode */}
        <div>
          <label className={labelClass}>Zip Code</label>
          <input
            type="number"
            placeholder="Enter Your Pincode"
            value={formData.delivery.pincode}
            onChange={handleChangeAndValidate("delivery", "pincode")}
            className={inputClass(errors.delivery_pincode)}
          />
          {errors.delivery_pincode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_pincode}</p>}
        </div>

        {/* City */}
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            placeholder="City"
            value={formData.delivery.city}
            onChange={handleChangeAndValidate("delivery", "city")}
            className={inputClass(errors.delivery_city)}
          />
          {errors.delivery_city && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_city}</p>}
        </div>

        {/* State */}
        <div>
          <label className={labelClass}>State</label>
          <input
            type="text"
            placeholder="District"
            value={formData.delivery.state}
            onChange={handleChangeAndValidate("delivery", "state")}
            className={inputClass(errors.delivery_state)}
          />
          {errors.delivery_state && <p className="text-red-500 text-xs mt-1 ml-1">{errors.delivery_state}</p>}
        </div>

        {/* Country */}
        <div>
          <label className={labelClass}>Country</label>
          <input disabled type="text" value={formData.delivery.country} className={inputClass(null)} />
        </div>
      </div>

      {/* SECTION 3: PAYMENT METHOD */}
      <div className="pt-2 flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 mb-4">2. Payment method</h3>

        <div className="flex  gap-4">
          {/* Online */}
          <div
            onClick={() => OnlineAvailable && handlePaymentChange("Online")}
            className={`
              flex-1 min-w-[140px] shadow-xl p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2
              ${formData.preferences.paymentMethod === "Online"
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "border-gray-200 bg-white hover:border-gray-300"}
              ${!OnlineAvailable ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
              <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80" />
            </div>
            <span className="font-medium text-sm">Online / UPI</span>
            {OnlineAvailable && (
              <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                No COD Charges
              </span>
            )}
          </div>

          {/* COD */}
          <div
            onClick={() => handlePaymentChange("COD")}
            className={`
              flex-1 min-w-[140px] p-4 shadow-xl rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2
              ${formData.preferences.paymentMethod === "COD"
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "border-gray-200 bg-white hover:border-gray-300"}
            `}
          >
            <div className="w-10 h-6  rounded flex items-center justify-center text-[10px] font-bold text-gray-600">
              <img src="/money.svg" alt=""/>
            </div>
            <span className="font-medium text-sm text-center hidden md:flex">Cash On Delivery</span>
            <span className="flex font-medium text-center text-sm md:hidden">COD</span>
            <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                COD Charges
              </span>
          </div>
        </div>

        {formData.preferences.paymentMethod === "Online" && (
          <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-center gap-3 text-sm text-green-800">
            <img src="/icons/safety-icon.svg" alt="secure" className="w-5 h-5" />
            <span>Transactions are secured and encrypted.</span>
          </div>
        )}
      </div>
    </div>
  );
}
