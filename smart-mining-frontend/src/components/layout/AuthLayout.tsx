import React from "react";
import Logo from "../ui/Logo";
import bgImage from "../../assets/bg.jpg";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="absolute top-8 left-8 z-10">
        <Logo />
      </div>

      <div className="w-full max-w-md p-8 mx-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
