import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/logo.jpg";

const Logo: React.FC = () => {
  return (
    <Link to="/">
      <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <img
          src={logoImage}
          alt="Mining Monitor Logo"
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
};

export default Logo;
