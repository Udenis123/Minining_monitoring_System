import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = "py-2 px-6 font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none";
  
  const variantClasses = {
    primary: "bg-gray-900 hover:bg-gray-800 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 