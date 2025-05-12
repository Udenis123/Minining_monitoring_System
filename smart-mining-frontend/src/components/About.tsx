import React from "react";
import { Link } from "react-router-dom";
import { Shield, Users, Target, Award, ChevronRight } from "lucide-react";
import Logo from "./ui/Logo";
import denisImage from "../assets/denis.png";
import franckImage from "../assets/franck.png";

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo />
              <span className="ml-4 text-xl font-bold text-gray-900">
                MineGuard Pro
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Contact
              </Link>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl drop-shadow-md">
              About MineGuard Pro
            </h1>
            <p className="mt-4 text-xl  max-w-3xl mx-auto">
              Leading the way in mining safety and operational excellence
              through advanced technology and innovation.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Mission Section */}
      <div className="py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full mb-3">
              Our Mission
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Revolutionizing Mining Operations
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              To transform mining operations through cutting-edge technology,
              ensuring safety, efficiency, and sustainability.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-xl shadow-md p-8 transform transition duration-500 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-bold text-gray-900">
                    Safety First
                  </h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Prioritizing the well-being of mining personnel through
                  advanced monitoring and early warning systems.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8 transform transition duration-500 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-bold text-gray-900">
                    Innovation
                  </h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Continuously developing and implementing cutting-edge
                  solutions for mining operations.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8 transform transition duration-500 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-bold text-gray-900">
                    Excellence
                  </h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Maintaining the highest standards in mining operation
                  monitoring and management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full mb-3">
              Our Team
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Meet Our Leadership
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to transforming mining
              operations through innovation and expertise.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center transform transition duration-500 hover:shadow-xl hover:-translate-y-2">
              <img
                className="h-40 w-40 rounded-full border-4 border-white shadow-md object-cover"
                src={denisImage}
                alt="CEO"
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Uwihirwe Denis
                </h3>
                <p className="text-blue-600 font-medium">CEO & Founder</p>
                <p className="mt-3 text-gray-600 text-sm">
                  Leading our company with over 10 years of experience in mining
                  operations and technology.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center transform transition duration-500 hover:shadow-xl hover:-translate-y-2">
              <img
                className="h-40 w-40 rounded-full border-4 border-white shadow-md object-cover"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                alt="CTO"
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Sarah Johnson
                </h3>
                <p className="text-blue-600 font-medium">
                  Chief Technology Officer
                </p>
                <p className="mt-3 text-gray-600 text-sm">
                  Expert in IoT solutions and predictive analytics with a focus
                  on mining safety systems.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center transform transition duration-500 hover:shadow-xl hover:-translate-y-2">
              <img
                className="h-40 w-40 rounded-full border-4 border-white shadow-md object-cover"
                src={franckImage}
                alt="COO"
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Murenzi Frank
                </h3>
                <p className="text-blue-600 font-medium">
                  Chief Operations Officer
                </p>
                <p className="mt-3 text-gray-600 text-sm">
                  Oversees daily operations with expertise in mining logistics
                  and resource management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 relative">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <pattern
              id="pattern-circles"
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              <circle
                id="pattern-circle"
                cx="25"
                cy="25"
                r="8"
                fill="none"
                stroke="white"
                strokeWidth="1"
              ></circle>
            </pattern>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pattern-circles)"
            ></rect>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">
              Join us in revolutionizing mining operations.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Contact Us
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Logo />
                <span className="ml-4 text-xl font-bold text-white">
                  MineGuard Pro
                </span>
              </div>
              <p className="mt-4 text-gray-400">
                Advanced mining operations monitoring and management system.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@mineguard.pro</li>
                <li>Phone: +250 787-880-891</li>
                <li>Address: 123 Rutongo, Underground Mining</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 MineGuard Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
