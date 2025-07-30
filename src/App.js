import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';

import LoginForm from './components/LoginForm';
import AppsSection from './components/AppsSection';
import EventsSection from './components/EventsSection';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('apps');

  useEffect(() => {
    const savedUser = localStorage.getItem('tpcm_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error reading user data:', error);
        localStorage.removeItem('tpcm_user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('tpcm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tpcm_user');
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#212529' }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img
              src="/orange_logo.jpg"
              alt="Orange Logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '15px' }}
            />
            <span className="navbar-brand mb-0 h1" style={{ color: '#ff7a00', fontWeight: '600' }}>
              <i className="bi bi-phone me-2"></i>
              TPCM Store
            </span>
          </div>

          <div className="d-flex align-items-center">
            <span className="text-light me-3">
              <i className="bi bi-person-circle me-2"></i>
              {user.msisdn}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="container mt-4">
        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group" role="group" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <button
              type="button"
              className={`btn btn-lg px-4 py-3 ${activeTab === 'apps' ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === 'apps' ? '#ff7a00' : '#6c757d',
                border: 'none',
                color: activeTab === 'apps' ? '#000' : '#fff',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setActiveTab('apps')}
            >
              <i className="bi bi-controller me-2"></i>
              Apps & Games
            </button>
            <button
              type="button"
              className={`btn btn-lg px-4 py-3 ${activeTab === 'events' ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === 'events' ? '#ff7a00' : '#6c757d',
                border: 'none',
                color: activeTab === 'events' ? '#000' : '#fff',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setActiveTab('events')}
            >
              <i className="bi bi-calendar-event me-2"></i>
              Events & Tickets
            </button>
          </div>
        </div>

        {/* Content with animation */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'apps' && <AppsSection />}
          {activeTab === 'events' && <EventsSection />}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
