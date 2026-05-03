import React from "react";

const OTPInput = ({ otp, setOtp }) => {
  return (
    <input
      type="text"
      maxLength="6"
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
      placeholder="Enter 6-digit OTP"
      className="w-full px-4 py-3 border rounded-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default OTPInput;