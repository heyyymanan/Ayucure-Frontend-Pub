import React, { useState, useEffect } from "react";

export default function CheckoutForm({
  cart,
  formData,
  handleInputChange,
  handleCheckboxChange,
  handlePaymentChange,
  states,
  OnlineAvailable,
}) {
  // Error state
  const [errors, setErrors] = useState({});

  // Validation function for each field
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

  // Validate all fields at once (can be used on form submission)
  const validateAll = () => {
    let newErrors = {};

    // Validate contact email
    const emailError = validateField("contact", "email", formData.contact.email);
    if (emailError) newErrors.contactEmail = emailError;

    // Delivery validations
    ["firstName", "lastName", "fullAddress", "pincode", "city", "state", "phone"].forEach((field) => {
      const val = formData.delivery[field];
      const err = validateField("delivery", field, val);
      if (err) newErrors[`delivery_${field}`] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // valid if no errors
  };

  // Handle input change and validate that specific field immediately
  const handleChangeAndValidate = (section, field) => (e) => {
    handleInputChange(section, field)(e); // update parent state

    // Validate this field right after change
    const error = validateField(section, field, e.target.value);
    setErrors((prev) => ({
      ...prev,
      [`${section === "contact" ? "contactEmail" : `delivery_${field}`}`]: error,
    }));
  };

  if (cart.length === 0) {
    return (
      <div
        className="
          flex items-center justify-center
          min-h-[100px]
          bg-white/70 backdrop-blur-md
          text-gray-700 font-semibold
          text-2xl
          mx-auto max-w-3xl
          p-6
          select-none
        "
      >
        No Item In Your Cart
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-3xl mx-auto font-sans">
      {/* Contact */}
      <div>
        <h2 className="font-semibold text-sm mb-2 flex gap-2 items-center text-red-600">Note For Exsisting Users : If You've Logged-in Earlier & Dont See Your Prefilled Address, Please Logout and Login Again!</h2>
        <h2 className="font-semibold text-lg mb-2 flex gap-2 items-center">Email Address :<p className="text-grey text-base">(optional)</p></h2>
        <input
          type="email"
          placeholder="Email"
          value={formData.contact.email}
          onChange={handleChangeAndValidate("contact", "email")}
          className={`w-full border p-2 rounded ${errors.contactEmail ? "border-red-500" : ""}`}
          required
        />
        {errors.contactEmail && <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>}
      </div>

      {/* Delivery */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg mb-2">
          Delivery Address{" "}
          <span className="text-sm font-normal">(Currently Only Shipping PAN-INDIA)</span>
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First name"
              value={formData.delivery.firstName}
              onChange={handleChangeAndValidate("delivery", "firstName")}
              className={`border p-2 rounded w-full ${errors.delivery_firstName ? "border-red-500" : ""}`}
              required
              minLength={2}
            />
            {errors.delivery_firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.delivery_firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={formData.delivery.lastName}
              onChange={handleChangeAndValidate("delivery", "lastName")}
              className={`border p-2 rounded w-full ${errors.delivery_lastName ? "border-red-500" : ""}`}
              required
              minLength={2}
            />
            {errors.delivery_lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.delivery_lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="fullAddress" className="block text-sm font-medium">
            Full Address
          </label>
          <input
            id="fullAddress"
            type="text"
            placeholder="House No, Street, Area"
            value={formData.delivery.fullAddress}
            onChange={handleChangeAndValidate("delivery", "fullAddress")}
            className={`w-full border p-2 rounded ${errors.delivery_fullAddress ? "border-red-500" : ""}`}
            required
            minLength={10}
          />
          {errors.delivery_fullAddress && (
            <p className="text-red-600 text-sm mt-1">{errors.delivery_fullAddress}</p>
          )}
        </div>

        <div>
          <label htmlFor="landmark" className="block text-sm font-medium">
            Landmark (Optional)
          </label>
          <input
            id="landmark"
            type="text"
            placeholder="Near Park, Temple etc."
            value={formData.delivery.landmark}
            onChange={handleInputChange("delivery", "landmark")}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium">
              Pincode
            </label>
            <input
              id="pincode"
              type="number"
              placeholder="6-digit PIN"
              value={formData.delivery.pincode}
              onChange={handleChangeAndValidate("delivery", "pincode")}
              className={`border p-2 rounded w-full ${errors.delivery_pincode ? "border-red-500" : ""}`}
              required
              maxLength={6}
            />
            {errors.delivery_pincode && (
              <p className="text-red-600 text-sm mt-1">{errors.delivery_pincode}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium">
              City
            </label>
            <input
              disabled
              id="city"
              type="text"
              placeholder="City"
              value={formData.delivery.city}
              onChange={handleChangeAndValidate("delivery", "city")}
              className={`border p-2 rounded w-full ${errors.delivery_city ? "border-red-500" : ""}`}
              required
            />
            {errors.delivery_city && (
              <p className="text-red-600 text-sm mt-1">{errors.delivery_city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium">
              State
            </label>
            <input
              disabled
              id="state"
              type="text"
              placeholder="State"
              value={formData.delivery.state}
              onChange={handleChangeAndValidate("delivery", "state")}
              className={`border p-2 rounded w-full ${errors.delivery_city ? "border-red-500" : ""}`}
              required
            />
            {errors.delivery_state && (
              <p className="text-red-600 text-sm mt-1">{errors.delivery_state}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium">
              Country
            </label>
            <input
              disabled
              id="country"
              type="text"
              placeholder="Country"
              value={formData.delivery.country}
              onChange={handleChangeAndValidate("delivery", "country")}
              className={`border p-2 rounded w-full ${errors.delivery_country ? "border-red-500" : ""}`}
              required
            />
            {errors.delivery_country && (
              <p className="text-red-600 text-sm mt-1">{errors.delivery_country}</p>
            )}
          </div>
        </div>




        <div>
          <label htmlFor="phone" className=" flex text-sm font-medium">
            Phone Number <p className="text-red-500  ">*</p>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="10-digit number"
            value={formData.delivery.phone}
            onChange={handleChangeAndValidate("delivery", "phone")}
            className={`w-full border p-2 rounded ${errors.delivery_phone ? "border-red-500" : ""}`}
            required
            maxLength={10}
          />
          {errors.delivery_phone && (
            <p className="text-red-600 text-sm mt-1">{errors.delivery_phone}</p>
          )}
        </div>

        
      </div>

    </div>

  );
}