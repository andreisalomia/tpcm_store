import React, { useState } from 'react';

function LoginForm({ onLogin }) {
  const [msisdn, setMsisdn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!msisdn || !password) {
      alert('Please fill in both fields');
      return;
    }

    if (!msisdn.match(/^\+?[0-9]{10,15}$/)) {
      alert('MSISDN must be between 10-15 digits');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = {
        msisdn: msisdn,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('tpcm_user', JSON.stringify(userData));

      onLogin(userData);

    } catch (error) {
      alert('Authentication error: ' + error.message);
    } finally {
      setLoading(false);
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
                  TPCM Store
                </h2>
                <p className="text-secondary">Use your phone number to connect</p>
              </div>

              <form onSubmit={handleSubmit}>
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
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100"
                  style={{ backgroundColor: '#ff7a00', color: '#000', fontWeight: '600' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;