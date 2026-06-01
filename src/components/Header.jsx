import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ apiHealth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [slotCount, setSlotCount] = useState(0);
  const [animatingSlots, setAnimatingSlots] = useState(new Set());

  // Animate slot increments
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setSlotCount(prev => {
        const next = prev + Math.floor(Math.random() * 3) + 1;
        if (next <= 5) {
          setAnimatingSlots(s => new Set([...s, next]));
          setTimeout(() => {
            setAnimatingSlots(s => {
              const newSet = new Set(s);
              newSet.delete(next);
              return newSet;
            });
          }, 400);
        }
        return next > 5 ? prev : next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo">
            <span className="logo-text">FXSpotlight</span>
            <span className="logo-badge">AI Auditor</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop" aria-label="Main navigation">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#audit" className="nav-link">Audit Trade</a>
          <a href="#about" className="nav-link">About</a>
        </nav>

        {/* Right Section with API Status and Mobile Menu Button */}
        <div className="header-right">
          {/* API Status Indicator */}
          <div className={`api-status ${apiHealth?.status || 'checking'}`} 
               aria-label={`API Status: ${apiHealth?.status || 'checking'}`}
               title={apiHealth?.message || 'Checking API health...'}>
            <span className="status-dot"></span>
            <span className="status-text">
              {apiHealth?.status === 'healthy' ? 'Online' : 
               apiHealth?.status === 'error' ? 'Offline' : 'Checking...'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`menu-btn ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <nav className="nav-mobile" id="mobile-menu" role="navigation">
          <div className="nav-content">
            <a href="#features" className="nav-link-mobile" onClick={() => setIsOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="nav-link-mobile" onClick={() => setIsOpen(false)}>
              How It Works
            </a>
            <a href="#audit" className="nav-link-mobile" onClick={() => setIsOpen(false)}>
              Audit Trade
            </a>
            <a href="#about" className="nav-link-mobile" onClick={() => setIsOpen(false)}>
              About
            </a>
            
            {/* Slot Counter in Mobile Menu */}
            <div className="slot-counter-mobile">
              <div className="counter-label">Available Processing Slots</div>
              <div className="slot-display">
                {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                  <div
                    key={num}
                    className={`slot ${slotCount >= num ? 'filled' : ''} ${
                      animatingSlots.has(num) ? 'animating' : ''
                    }`}
                    aria-label={`Slot ${num}: ${slotCount >= num ? 'filled' : 'empty'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
