import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, secretPasscode } = req.body;

  // Enforce password mix of numbers and alphabets
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long and include both letters and numbers.' 
    });
  }

  // Enforce alphanumeric passcode
  const passcodeRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d-]{4,}$/;
  if (secretPasscode && !passcodeRegex.test(secretPasscode)) {
    return res.status(400).json({
      message: 'Secret Passcode must be a mix of numbers and letters.'
    });
  }

  try {
    // Mock for demo if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      console.log('DB not connected, returning mock user for demo');
      return res.status(201).json({
        _id: 'mock_id_123',
        name: name,
        email: email,
        role: 'user',
        token: 'mock_token_abc'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const recoveryPasscodeHash = await bcrypt.hash(secretPasscode, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      recoveryPasscodeHash
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Master login for dev/demo simplicity
    if ((email === 'admin@vshield.io' || email === '2303031460256@PARULUNIVERSITY.AC.IN') && password === 'admin123') {
       const demoId = '650f1f9b066b4d41973a0a0a'; // Valid 24-character hex string
       return res.json({
        _id: demoId,
        name: 'Master Admin',
        email: email,
        role: 'admin',
        token: generateToken(demoId, 'admin')
      });
    }

    // Fallback for demo if DB is not connected
    if (mongoose.connection.readyState !== 1) {
       return res.json({
        _id: 'mock_id_123',
        name: 'Demo User',
        email: email,
        role: 'admin',
        token: 'mock_token_abc'
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check for 2FA
      if (user.is2FAEnabled) {
        return res.json({
          requires2FA: true,
          email: user.email,
          message: 'Two-factor authentication required'
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recover Account
export const recoverAccount = async (req, res) => {
  const { email, secretPasscode } = req.body;

  try {
    // Mock for demo if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      console.log('DB not connected, returning mock user for demo recovery');
      if (email === 'mock@example.com' && secretPasscode === 'MOCK-CODE') {
        return res.json({
          _id: 'mock_id_123',
          name: 'Mock User',
          email: email,
          role: 'user',
          token: 'mock_token_abc',
          message: 'Account recovered successfully (mock)'
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or secret passcode (mock)' });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No registration records found for this unit' });
    }

    const isValid = await bcrypt.compare(secretPasscode.trim(), user.recoveryPasscodeHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Recovery passcode mismatch. Protocol denied.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    res.status(500).json({ message: 'System failure during recovery', error: error.message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    // Mock for demo if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      console.log('DB not connected, returning mock user for demo google login');
      const mockEmail = 'google_mock@example.com';
      const rawPasscode = Math.random().toString(36).slice(-8).toUpperCase();
      const recoveryPasscode = rawPasscode.slice(0, 4) + "-" + rawPasscode.slice(4);
      return res.status(200).json({
        _id: 'mock_google_id_123',
        name: 'Mock Google User',
        email: mockEmail,
        role: 'user',
        picture: 'https://example.com/mock_pic.jpg',
        recoveryPasscode, // Only returned if newly created
        token: 'mock_token_abc',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    let newPasscode = null;

    if (user) {
      if (!user.googleId || !user.picture) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      // Create new user with recovery passcode
      const rawPasscode = Math.random().toString(36).slice(-8).toUpperCase();
      newPasscode = rawPasscode.slice(0, 4) + "-" + rawPasscode.slice(4);
      const recoveryPasscodeHash = await bcrypt.hash(newPasscode, 12);

      user = await User.create({
        name,
        email,
        googleId,
        picture,
        password: Math.random().toString(36).slice(-10), // Random password for Google users
        recoveryPasscodeHash,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      recoveryPasscode: newPasscode, // Only returned if newly created
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ message: 'Google Authentication Failed', error: error.message });
  }
};

// 2FA Verification
export const verify2FA = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Mock for demo if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      console.log('DB not connected, returning mock user for demo 2FA');
      if (email === 'mock@example.com' && code === '123456') {
        return res.json({
          _id: 'mock_id_123',
          name: 'Mock User',
          email: email,
          role: 'user',
          token: 'mock_token_abc',
        });
      } else {
        return res.status(401).json({ message: 'Invalid 2FA code (mock)' });
      }
    }

    const user = await User.findOne({ email });

    if (user && code === '123456') { // Mock verification code
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid 2FA code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update User Security Settings
export const updateSecuritySettings = async (req, res) => {
  const { is2FAEnabled, secretPasscode } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (is2FAEnabled !== undefined) {
      user.is2FAEnabled = is2FAEnabled;
    }

    if (secretPasscode) {
      user.recoveryPasscodeHash = await bcrypt.hash(secretPasscode, 12);
    }

    await user.save();
    res.json({ 
      message: 'Security protocols updated successfully',
      is2FAEnabled: user.is2FAEnabled
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update protocols', error: error.message });
  }
};

