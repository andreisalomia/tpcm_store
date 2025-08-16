import React, { useState } from 'react';
import authUtils from '../utils/authUtils';

function LoginForm({ onLogin }) {
  const [msisdn, setMsisdn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('login');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!msisdn || !password) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      const result = await authUtils.login(msisdn, password);
      onLogin(result.userData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (!msisdn || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await authUtils.register(msisdn, password, email);
      onLogin(result.userData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authUtils.resetPassword(email, password);
      setSuccess('Password reset successfully! You can now login.');
      setMode('login');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <div className="mb-3">
        <label className="form-label text-light">
          <i className="bi bi-phone me-2"></i>Phone Number
        </label>
        <input
          type="text"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="+40712345678"
          value={msisdn}
          onChange={(e) => setMsisdn(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="form-label text-light">
          <i className="bi bi-lock me-2"></i>Password
        </label>
        <input
          type="password"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
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
            <span className="spinner-border spinner-border-sm me-2"></span>
            Logging in...
          </>
        ) : (
          <>
            <i className="bi bi-box-arrow-in-right me-2"></i>Login
          </>
        )}
      </button>

      <button
        type="button"
        className="btn btn-outline-light btn-lg w-100 mb-3"
        onClick={() => setMode('register')}
        disabled={loading}
      >
        <i className="bi bi-person-plus me-2"></i>Create Account
      </button>

      <div className="text-center">
        <button
          type="button"
          className="btn btn-link text-secondary"
          onClick={() => setMode('reset')}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>Reset Password
        </button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister}>
      <div className="mb-3">
        <label className="form-label text-light">
          <i className="bi bi-phone me-2"></i>Phone Number
        </label>
        <input
          type="text"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="+40712345678"
          value={msisdn}
          onChange={(e) => setMsisdn(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label className="form-label text-light">
          <i className="bi bi-envelope me-2"></i>Email
        </label>
        <input
          type="email"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label className="form-label text-light">
          <i className="bi bi-lock me-2"></i>Password
        </label>
        <input
          type="password"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="Create password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="form-label text-light">
          <i className="bi bi-lock-fill me-2"></i>Confirm Password
        </label>
        <input
          type="password"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
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
            <span className="spinner-border spinner-border-sm me-2"></span>
            Creating...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i>Create Account
          </>
        )}
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary w-100"
        onClick={() => setMode('login')}
        disabled={loading}
      >
        <i className="bi bi-arrow-left me-2"></i>Back to Login
      </button>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleReset}>
      <div className="mb-3">
        <label className="form-label text-light">
          <i className="bi bi-envelope me-2"></i>Email Address
        </label>
        <input
          type="email"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="form-label text-light">
          <i className="bi bi-lock me-2"></i>New Password
        </label>
        <input
          type="password"
          className="form-control form-control-lg bg-dark text-light border-secondary"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
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
            <span className="spinner-border spinner-border-sm me-2"></span>
            Resetting...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i>Reset Password
          </>
        )}
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary w-100"
        onClick={() => setMode('login')}
        disabled={loading}
      >
        <i className="bi bi-arrow-left me-2"></i>Back to Login
      </button>
    </form>
  );

  const getTitle = () => {
    switch (mode) {
      case 'register': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'TPCM Store';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'register': return 'Register with your phone number';
      case 'reset': return 'Enter your email and new password';
      default: return 'Use your phone number to connect';
    }
  };

  const renderCurrentForm = () => {
    switch (mode) {
      case 'register': return renderRegisterForm();
      case 'reset': return renderResetForm();
      default: return renderLoginForm();
    }
  };

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
                  {getTitle()}
                </h2>
                <p className="text-secondary">{getSubtitle()}</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {renderCurrentForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;