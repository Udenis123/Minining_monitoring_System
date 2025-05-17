import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AuthLayout from "./layout/AuthLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";

// Add spinner component
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        const success = await login(email, password);
        if (success) {
          navigate("/dashboard");
        } else {
          setErrors({ password: "Invalid credentials" });
        }
      } catch (error) {
        setErrors({ password: "Login failed. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthLayout title="Mining Monitor Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-gray-800 hover:underline text-sm"
          >
            forgot password?
          </Link>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <Spinner />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-600 bg-white/50 p-3 rounded">
          <p className="font-medium">Demo accounts:</p>
          <ul className="list-disc list-inside mt-1">
            <li>admin@mine.com</li>
            <li>supervisor@mine.com</li>
            <li>miner@mine.com</li>
            <li className="text-xs mt-1">(password: "password" for all)</li>
          </ul>
        </div>
      </form>
    </AuthLayout>
  );
}
