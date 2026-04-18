import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  TicketIcon,
  CheckCircleIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const backgroundImages = [
    'https://t3.ftcdn.net/jpg/08/23/48/92/360_F_823489262_onPGneSlusimWkc7yWWUZIBb271JyVs7.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZtwodKRUhMrPaslgUM3qPM0_rB7RZJsR2Zw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_7YT7LjMUXHOxKTo85Q2YPErXtiedWdMqeQ&s'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Facility Management',
      description: 'Browse and book campus facilities including rooms, labs, and equipment with real-time availability.',
      color: 'bg-blue-500',
    },
    {
      icon: CalendarIcon,
      title: 'Smart Booking System',
      description: 'Efficient booking workflow with approval system and conflict prevention.',
      color: 'bg-green-500',
    },
    {
      icon: TicketIcon,
      title: 'Maintenance Tickets',
      description: 'Report and track maintenance issues with photo attachments and real-time updates.',
      color: 'bg-yellow-500',
    },
    {
      icon: CheckCircleIcon,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications for bookings and ticket status changes.',
      color: 'bg-purple-500',
    },
  ];

  const stats = [
    {
      value: '1,200+',
      label: 'Active Users',
      icon: UsersIcon,
    },
    {
      value: '50+',
      label: 'Campus Facilities',
      icon: BuildingOfficeIcon,
    },
    {
      value: '5,000+',
      label: 'Monthly Bookings',
      icon: CalendarIcon,
    },
    {
      value: '99.9%',
      label: 'Uptime',
      icon: ChartBarIcon,
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Department Head - Computer Science',
      content: 'Smart Campus Hub has revolutionized how we manage our lab bookings. The approval workflow ensures fair usage.',
      avatar: 'SJ',
    },
    {
      name: 'Mike Chen',
      role: 'Student Representative',
      content: 'Finally, a single platform for all campus facility needs. The mobile-friendly design makes it easy to use anywhere.',
      avatar: 'MC',
    },
    {
      name: 'Lisa Anderson',
      role: 'Facility Manager',
      content: 'The analytics dashboard gives us valuable insights into facility utilization and helps with planning.',
      avatar: 'LA',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-navy-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
              </div>
              <span className="ml-3 text-xl font-semibold text-navy-900">SmartEdu Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-navy-600 hover:text-navy-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-navy-700 to-navy-900 py-24 px-4 sm:px-6 lg:px-8">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-opacity duration-1000"
          style={{
            backgroundImage: `url("${backgroundImages[currentImageIndex]}")`
          }}
        ></div>
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              SmartEdu
              <span className="block text-navy-200">Portal</span>
            </h1>
            <p className="mt-6 text-xl text-navy-200 max-w-3xl mx-auto">
              Modernize your campus operations with our comprehensive facility and asset management platform. 
              Streamline bookings, track maintenance, and enhance campus experience.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="inline-flex min-w-[232px] items-center justify-center rounded-lg bg-white px-8 py-3 text-lg font-medium text-navy-700 shadow-navy transition-colors duration-200 hover:bg-navy-50"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-flex min-w-[144px] items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-3 text-lg font-medium text-white transition-colors duration-200 hover:bg-white hover:text-navy-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-navy-50 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1519389950473-34ba1297f231?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-navy-100 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-navy-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-navy-900">{stat.value}</p>
                  <p className="text-sm text-navy-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-900">
              Everything You Need for Campus Operations
            </h2>
            <p className="mt-4 text-lg text-navy-600 max-w-2xl mx-auto">
              Comprehensive features designed to streamline facility management and enhance user experience.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <div className={`${feature.color} h-16 w-16 rounded-lg flex items-center justify-center`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-navy-900">{feature.title}</h3>
                <p className="mt-2 text-navy-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-navy-50 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-900">
              Trusted by Campus Communities
            </h2>
            <p className="mt-4 text-lg text-navy-600">
              See what our users have to say about Smart Campus Hub
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-navy-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-navy-700">{testimonial.avatar}</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-navy-900">{testimonial.name}</p>
                    <p className="text-sm text-navy-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-navy-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-900 py-16 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1519389950473-34ba1297f231?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
          }}
        ></div>
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Transform Your Campus Operations?
          </h2>
          <p className="mt-4 text-lg text-navy-200">
            Join thousands of users already using Smart Campus Hub for efficient facility management.
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center btn-primary bg-white text-navy-700 hover:bg-navy-50 px-8 py-3 text-lg"
            >
              Get Started Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-navy-900 font-bold text-sm">SC</span>
                </div>
                <span className="ml-3 text-xl font-semibold text-white">SmartEdu Portal</span>
              </div>
              <p className="mt-4 text-navy-400">
                Modernizing campus operations through innovative technology solutions.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="#" className="text-navy-400 hover:text-white">Facility Booking</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Maintenance Tickets</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Real-time Notifications</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Analytics Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="#" className="text-navy-400 hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Documentation</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Contact Us</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Status Page</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="#" className="text-navy-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Terms of Service</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Cookie Policy</Link></li>
                <li><Link to="#" className="text-navy-400 hover:text-white">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-navy-800">
            <p className="text-center text-navy-400">
              © 2026 SmartEdu Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
