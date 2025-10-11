import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Stats from '../components/landing/Stats';
import Footer from '../components/landing/Footer';
import ThreeDBackground from '../components/landing/ThreeDBackground';

const LandingPageNew: React.FC = () => {
  return (
    <div className="min-h-screen transition-colors duration-300 relative">
      {/* 3D Animated Background */}
      <ThreeDBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <Stats />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPageNew;
