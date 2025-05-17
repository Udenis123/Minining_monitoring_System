import React, { useState } from "react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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

  const handleSendOTP = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      setLoading(true);
      setMessage("");

      try {
        const response = await axios.post(`${API_URL}/forgot-password`, {
          email,
        });

        if (response.status === 200) {
          setOtpSent(true);
          setMessage("Verification code sent to your email");
        }
      } catch (error: any) {
        setMessage(
          error.response?.data?.message || "Failed to send verification code"
        );
        console.error("Error sending OTP:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCode()) {
      setLoading(true);
      setMessage("");

      try {
        const response = await axios.post(`${API_URL}/verify-reset-code`, {
          email,
          code: verificationCode,
        });

        if (response.status === 200) {
          // Navigate to reset password page with email and code as parameters
          window.location.href = `/reset-password?email=${encodeURIComponent(
            email
          )}&code=${encodeURIComponent(verificationCode)}`;
        }
      } catch (error: any) {
        setMessage(error.response?.data?.message || "Failed to verify code");
        console.error("Error verifying code:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      {message && (
        <div
          className={`p-3 mb-4 text-sm rounded-md ${
            message.includes("Failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

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
            <Button
              type="button"
              onClick={handleSendOTP}
              variant="primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Code"}
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

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
