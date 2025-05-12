import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AuthLayout from "./layout/AuthLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setErrors({ password: "Invalid credentials" });
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
          <Button type="submit">Login</Button>
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
