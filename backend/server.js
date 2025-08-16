import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import oracledb from 'oracledb';
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER || 'C##tpcm_db',
  password: process.env.DB_PASSWORD || 'tpcm_pass',
  connectString: process.env.DB_CONNECTION || 'localhost:1521/FREE'
};

// console.log(JSON.stringify(process.env.DB_USER));
// console.log(JSON.stringify(process.env.DB_PASSWORD));
// console.log(JSON.stringify(process.env.DB_CONNECTION));

// if (dbConfig) {
//   try {
//     const connection = await oracledb.getConnection(dbConfig);
//     console.log("Database connected!");
//     await connection.close();
//   } catch (error) {
//     console.error("Database connection failed:", error);
//   }
// }

const JWT_SECRET = process.env.JWT_SECRET || 'tpcm_store_secret';

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailCodes = new Map();

const getConnection = async () => {
  return await oracledb.getConnection(dbConfig);
};

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (to, subject, text) => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      });
      console.log(`✅ Email sent to ${to}`);
      return true;
    } else {
      console.log(`📧 Email to ${to}: ${text}`);
      return false;
    }
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

const storeCode = (email, code) => {
  emailCodes.set(email, {
    code,
    expires: Date.now() + 15 * 60 * 1000 // 15 minutes
  });
  setTimeout(() => emailCodes.delete(email), 16 * 60 * 1000);
};

const verifyCode = (email, code) => {
  const stored = emailCodes.get(email);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    emailCodes.delete(email);
    return false;
  }
  if (stored.code === code) {
    emailCodes.delete(email);
    return true;
  }
  return false;
};

const validateSubscriber = async (msisdn) => {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT s.SUBSCRIBERID, s.MSISDN, s.STATUS, s.SUBSCRIPTIONTYPE, c.CUSTOMERID, c.NAME as CUSTOMER_NAME
       FROM Subscriber s 
       JOIN Customer c ON s.CUSTOMERID = c.CUSTOMERID 
       WHERE s.MSISDN = :msisdn AND s.STATUS = 'ACTIVE'`,
      { msisdn }
    );

    if (result.rows.length === 0) {
      throw new Error('Phone number not found or not active in TPCM system');
    }

    return {
      subscriberID: result.rows[0][0],
      msisdn: result.rows[0][1],
      status: result.rows[0][2],
      subscriptionType: result.rows[0][3],
      customerID: result.rows[0][4],
      customerName: result.rows[0][5]
    };
  } finally {
    await connection.close();
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { msisdn, email, password } = req.body;

    if (!msisdn || !email || !password) {
      return res.status(400).json({ error: 'Phone number, email, and password are required' });
    }

    if (!msisdn.match(/^\+?[0-9]{10,15}$/)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    let subscriber;
    try {
      subscriber = await validateSubscriber(msisdn);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const connection = await getConnection();
    try {
      const existing = await connection.execute(
        'SELECT id FROM store_users WHERE msisdn = :msisdn OR email = :email',
        { msisdn, email }
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'User already exists with this phone or email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        'INSERT INTO store_users (msisdn, email, password_hash, email_verified) VALUES (:msisdn, :email, :password, 0)',
        { msisdn, email, password: hashedPassword }
      );
      await connection.commit();

      const code = generateCode();
      storeCode(email, code);
      
      await sendEmail(
        email,
        'TPCM Store - Verify Email',
        `Your verification code is: ${code}\n\nThis code expires in 15 minutes.`
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for verification code.',
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    if (!verifyCode(email, code)) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    const connection = await getConnection();
    try {
      const result = await connection.execute(
        'UPDATE store_users SET email_verified = 1 WHERE email = :email',
        { email }
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Email verified successfully!'
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { msisdn, password } = req.body;

    if (!msisdn || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const connection = await getConnection();
    try {
      const result = await connection.execute(
        'SELECT password_hash, email, email_verified FROM store_users WHERE msisdn = :msisdn',
        { msisdn }
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const hashedPassword = result.rows[0][0];
      const email = result.rows[0][1];
      const emailVerified = result.rows[0][2];

      const isValid = await bcrypt.compare(password, hashedPassword);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!emailVerified) {
        return res.status(403).json({ 
          error: 'Please verify your email first',
          needsVerification: true 
        });
      }

      const subscriber = await validateSubscriber(msisdn);

      const token = jwt.sign({ msisdn }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        success: true,
        token,
        user: {
          msisdn,
          email,
          emailVerified: true,
          subscriberID: subscriber.subscriberID,
          customerID: subscriber.customerID,
          customerName: subscriber.customerName,
          status: subscriber.status,
          subscriptionType: subscriber.subscriptionType
        }
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const connection = await getConnection();
    try {
      const result = await connection.execute(
        'SELECT email_verified FROM store_users WHERE email = :email',
        { email }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (result.rows[0][0] === 1) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      const code = generateCode();
      storeCode(email, code);
      
      await sendEmail(
        email,
        'TPCM Store - Verify Email',
        `Your verification code is: ${code}\n\nThis code expires in 15 minutes.`
      );

      res.json({
        success: true,
        message: 'Verification code sent!',
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const connection = await getConnection();
    try {
      const userResult = await connection.execute(
        'SELECT email, email_verified FROM store_users WHERE msisdn = :msisdn',
        { msisdn: decoded.msisdn }
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const email = userResult.rows[0][0];
      const emailVerified = userResult.rows[0][1];

      const subscriber = await validateSubscriber(decoded.msisdn);

      res.json({
        valid: true,
        user: {
          msisdn: decoded.msisdn,
          email,
          emailVerified: emailVerified === 1,
          subscriberID: subscriber.subscriberID,
          customerID: subscriber.customerID,
          customerName: subscriber.customerName,
          status: subscriber.status,
          subscriptionType: subscriber.subscriptionType
        }
      });
    } finally {
      await connection.close();
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});


app.listen(PORT, () => {
  console.log(`TPCM Backend running on port ${PORT}`);
});