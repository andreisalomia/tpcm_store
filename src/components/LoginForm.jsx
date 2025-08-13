import React, { useState } from 'react';
import authUtils from '../utils/authUtils';

function LoginForm({ onLogin }) {
  const [msisdn, setMsisdn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const API_BASE_URL = 'http://localhost:8080';

  const validateSubscriberExists = async (msisdn) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/clients/subscribers/search/by-msisdn?msisdn=${encodeURIComponent(msisdn)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin')
          },
        }
      );

      if (!response.ok) {
        throw new Error('Subscriber not found. Please check your phone number.');
      }

      const subscribers = await response.json();
      if (!subscribers || subscribers.length === 0) {
        throw new Error('No subscriber found with this phone number.');
      }

      const subscriber = subscribers[0];
      
      if (subscriber.status !== 'ACTIVE') {
        throw new Error(`Account is ${subscriber.status.toLowerCase()}. Please contact customer support.`);
      }

      return subscriber;
    } catch (error) {
      throw error;
    }
  };

  const handlePasswordSetup = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await authUtils.setupPassword(msisdn, password, validateSubscriberExists);
      onLogin(result.userData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!msisdn || !password) {
      setError('Please fill in both fields');
      return;
    }

    if (!msisdn.match(/^\+?[0-9]{10,15}$/)) {
      setError('MSISDN must be between 10-15 digits');
      return;
    }

    setLoading(true);

    try {
      const result = await authUtils.login(msisdn, password, validateSubscriberExists);
      
      if (result.needsPasswordSetup) {
        setError('No password found for this phone number. Please use "Create Account" to set up your password.');
        setLoading(false);
        return;
      }

      onLogin(result.userData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError('');

    if (!msisdn) {
      setError('Please enter your phone number first');
      return;
    }

    if (!msisdn.match(/^\+?[0-9]{10,15}$/)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      await validateSubscriberExists(msisdn);
      
      if (authUtils.hasPassword(msisdn)) {
        setError('Account already exists for this phone number. Please use Login instead.');
        setLoading(false);
        return;
      }

      setShowPasswordSetup(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (!msisdn) {
      setError('Please enter your phone number first');
      return;
    }

    if (!msisdn.match(/^\+?[0-9]{10,15}$/)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (authUtils.resetPassword(msisdn)) {
      setShowPasswordSetup(true);
      setError('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('No password found for this phone number');
    }
  };

  if (showPasswordSetup) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="row w-100">
          <div className="col-md-4 offset-md-4">
            <div className="card shadow-lg bg-black text-light border-0 position-relative">
              <img
                src="/orange_logo.jpg"
                alt="Orange Logo"
                className="position-absolute"
                style={{
                  top: '15px',
                  left: '15px',
                  width: '70px',
                  height: '70px',
                  objectFit: 'contain',
                  zIndex: 10
                }}
              />

              <div className="card-body p-5">
                <div className="text-center mb-4" style={{ paddingTop: '40px' }}>
                  <h2 className="card-title" style={{ color: '#ff7a00' }}>
                    <i className="bi bi-shield-lock me-2"></i>
                    Setup Password
                  </h2>
                  <p className="text-secondary">Create a password for {msisdn}</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  This is your first login. Please create a secure password.
                </div>

                <form onSubmit={handlePasswordSetup}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label text-light">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg bg-secondary text-white border-0"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <div className="form-text text-secondary">
                      Password must be at least 6 characters.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label text-light">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg bg-secondary text-white border-0"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 text-white fw-bold mb-3"
                    style={{ backgroundColor: '#ff7a00', border: 'none' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Setting up...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Password & Login
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowPasswordSetup(false)}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="row w-100">
        <div className="col-md-4 offset-md-4">
          <div className="card shadow-lg bg-black text-light border-0 position-relative">
            <img
              src="/orange_logo.jpg"
              alt="Orange Logo"
              className="position-absolute"
              style={{
                top: '15px',
                left: '15px',
                width: '70px',
                height: '70px',
                objectFit: 'contain',
                zIndex: 10
              }}
            />

            <div className="card-body p-5">
              <div className="text-center mb-4" style={{ paddingTop: '40px' }}>
                <h2 className="card-title" style={{ color: '#ff7a00' }}>
                  <i className="bi bi-phone me-2"></i>
                  TPCM Store
                </h2>
                <p className="text-secondary">Use your phone number to connect</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="msisdn" className="form-label text-light">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-lg bg-secondary text-white border-0"
                    id="msisdn"
                    placeholder="+40123456789"
                    value={msisdn}
                    onChange={(e) => setMsisdn(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="form-text text-secondary">
                    Enter your phone number in international format.
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label text-light">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg bg-secondary text-white border-0"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="form-text text-secondary">
                    Enter your account password.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100 text-white fw-bold mb-3"
                  style={{ backgroundColor: '#ff7a00', border: 'none' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-light btn-lg w-100 mb-3"
                  onClick={handleCreateAccount}
                  disabled={loading}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link text-secondary"
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset Password
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;