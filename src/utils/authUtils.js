const authUtils = {
  hashPassword(password, msisdn) {
    const salt = msisdn.slice(-4);
    return btoa(password + salt);
  },

  storePassword(msisdn, password) {
    const passwords = JSON.parse(localStorage.getItem('tpcm_passwords') || '{}');
    passwords[msisdn] = this.hashPassword(password, msisdn);
    localStorage.setItem('tpcm_passwords', JSON.stringify(passwords));
  },

  hasPassword(msisdn) {
    const passwords = JSON.parse(localStorage.getItem('tpcm_passwords') || '{}');
    return passwords.hasOwnProperty(msisdn);
  },

  verifyPassword(msisdn, password) {
    const passwords = JSON.parse(localStorage.getItem('tpcm_passwords') || '{}');
    const storedHash = passwords[msisdn];
    const inputHash = this.hashPassword(password, msisdn);
    return storedHash === inputHash;
  },

  resetPassword(msisdn) {
    const passwords = JSON.parse(localStorage.getItem('tpcm_passwords') || '{}');
    if (passwords[msisdn]) {
      delete passwords[msisdn];
      localStorage.setItem('tpcm_passwords', JSON.stringify(passwords));
      return true;
    }
    return false;
  },

  isAuthenticated() {
    const user = localStorage.getItem('tpcm_user');
    return user && JSON.parse(user).authenticated;
  },

  getCurrentUser() {
    const userData = localStorage.getItem('tpcm_user');
    return userData ? JSON.parse(userData) : null;
  },

  async login(msisdn, password, subscriberValidationFn) {
    const subscriber = await subscriberValidationFn(msisdn);
    
    if (!this.hasPassword(msisdn)) {
      return { needsPasswordSetup: true, subscriber };
    }

    if (!this.verifyPassword(msisdn, password)) {
      throw new Error('Invalid password');
    }

    const userData = {
      msisdn: subscriber.msisdn,
      subscriberID: subscriber.subscriberID,
      customerID: subscriber.customer?.customerID,
      customerName: subscriber.customer?.name,
      status: subscriber.status,
      subscriptionType: subscriber.subscriptionType,
      loginTime: new Date().toISOString(),
      authenticated: true
    };

    localStorage.setItem('tpcm_user', JSON.stringify(userData));
    return { success: true, userData };
  },

  async setupPassword(msisdn, password, subscriberValidationFn) {
    const subscriber = await subscriberValidationFn(msisdn);
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    this.storePassword(msisdn, password);
    const userData = {
      msisdn: subscriber.msisdn,
      subscriberID: subscriber.subscriberID,
      customerID: subscriber.customer?.customerID,
      customerName: subscriber.customer?.name,
      status: subscriber.status,
      subscriptionType: subscriber.subscriptionType,
      loginTime: new Date().toISOString(),
      authenticated: true
    };

    localStorage.setItem('tpcm_user', JSON.stringify(userData));
    return { success: true, userData };
  },

  logout() {
    localStorage.removeItem('tpcm_user');
  }
};

export default authUtils;