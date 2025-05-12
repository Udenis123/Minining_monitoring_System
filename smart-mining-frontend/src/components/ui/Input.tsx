import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-800 font-medium mb-2">{label}</label>
        <input
          ref={ref}
          className={`w-full px-4 py-2 border border-gray-800 rounded-lg bg-white/80 focus:outline-none focus:ring-1 focus:ring-gray-800 ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
