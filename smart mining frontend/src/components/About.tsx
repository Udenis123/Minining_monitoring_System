import React from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Shield, Users, Target, Award, ChevronRight } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Mountain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MineGuard Pro</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link to="/about" className="text-gray-900 hover:text-blue-600">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              About MineGuard Pro
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Leading the way in mining safety and operational excellence through advanced technology and innovation.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Mission</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              To revolutionize mining operations through cutting-edge technology, ensuring safety, efficiency, and sustainability.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Safety First</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Prioritizing the well-being of mining personnel through advanced monitoring and early warning systems.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Innovation</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Continuously developing and implementing cutting-edge solutions for mining operations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Excellence</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Maintaining the highest standards in mining operation monitoring and management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Leadership Team</h2>
            <p className="mt-4 text-xl text-gray-600">
              Experienced professionals dedicated to transforming mining operations.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-4">
              <img
                className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                alt="CEO"
              />
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900">John Smith</h3>
                <p className="text-gray-600">CEO & Founder</p>
              </div>
            </div>

            <div className="space-y-4">
              <img
                className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                alt="CTO"
              />
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900">Sarah Johnson</h3>
                <p className="text-gray-600">Chief Technology Officer</p>
              </div>
            </div>

            <div className="space-y-4">
              <img
                className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                alt="COO"
              />
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900">Michael Chen</h3>
                <p className="text-gray-600">Chief Operations Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Join us in revolutionizing mining operations.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
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