import React, { useState, useEffect } from "react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import axios from "axios";

const API_URL ="http://localhost:8000/api";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    // Get email and code from URL parameters
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const codeParam = params.get("code");

    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);

    // Redirect to forgot password page if email or code is missing
    if (!emailParam || !codeParam) {
      setMessage(
        "Missing verification information. Redirecting to forgot password page..."
      );
      setTimeout(() => {
        window.location.href = "/forgot-password";
      }, 3000);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    let isValid = true;

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setMessage("");

      try {
        const response = await axios.post(`${API_URL}/reset-password`, {
          email,
          code,
          password: newPassword,
          password_confirmation: confirmPassword,
        });

        if (response.status === 200) {
          setMessage("Password reset successfully. Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } catch (error: any) {
        setMessage(error.response?.data?.message || "Failed to reset password");
        console.error("Error resetting password:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout title="Reset Password">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Processing..." : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
