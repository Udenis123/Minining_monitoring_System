import React, { useState } from "react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    verificationCode?: string;
  }>({});

  const validateEmail = () => {
    if (!email) {
      setErrors({ ...errors, email: "Email is required" });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ ...errors, email: "Email is invalid" });
      return false;
    }
    setErrors({ ...errors, email: undefined });
    return true;
  };

  const validateCode = () => {
    if (!verificationCode) {
      setErrors({
        ...errors,
        verificationCode: "Verification code is required",
      });
      return false;
    }
    setErrors({ ...errors, verificationCode: undefined });
    return true;
  };

  const handleSendOTP = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      // Simulate sending OTP
      console.log("Sending OTP to", email);
      setOtpSent(true);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCode()) {
      // Navigate to reset password
      console.log("Verifying code", verificationCode);
      window.location.href = "/reset-password";
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      <form onSubmit={handleVerify} className="space-y-6">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={otpSent}
        />

        {!otpSent && (
          <div className="flex justify-end">
            <Button type="button" onClick={handleSendOTP} variant="primary">
              Send OTP
            </Button>
          </div>
        )}

        {otpSent && (
          <>
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={errors.verificationCode}
            />

            <Button type="submit" fullWidth>
              Verify
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
