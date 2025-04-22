import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield, Activity, BarChart as ChartBar, Users, Mountain } from 'lucide-react';

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Mountain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MineGuard Pro</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-900 hover:text-blue-600">Home</Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-md"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                Contact
              </Link>
              <Link
                to="/login"
                className="block px-3 py-2 bg-blue-600 text-white rounded-md"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1579547944212-c4f4961a8dd8?auto=format&fit=crop&q=80"
            alt="Mining Operation"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Advanced Mining Operations Monitoring
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Real-time monitoring, predictive analytics, and comprehensive safety management for modern mining operations.
          </p>
          <div className="mt-10">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Mining Solutions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to monitor and manage your mining operations effectively.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">Safety First</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Advanced safety monitoring and real-time alerts ensure your mining operations stay secure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <Activity className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">Real-time Monitoring</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Monitor all aspects of your mining operations in real-time with advanced sensor technology.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <ChartBar className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">Predictive Analytics</h3>
                    <p className="mt-5 text-base text-gray-500">
                      AI-powered predictions help you prevent issues before they occur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted by Mining Operations Worldwide
            </h2>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Active Mines
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">100+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Sensors Deployed
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">5000+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Safety Incidents Prevented
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">200+</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Mountain className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">MineGuard Pro</span>
              </div>
              <p className="mt-4 text-gray-400">
                Advanced mining operations monitoring and management system.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">About</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@mineguard.pro</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Mining Ave, Underground City</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2025 MineGuard Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}