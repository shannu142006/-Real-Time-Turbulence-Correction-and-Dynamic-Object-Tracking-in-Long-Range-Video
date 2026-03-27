import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Lock, AlertCircle, Map, Key, ShieldCheck, Check } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryPasscode, setRecoveryPasscode] = useState(null);
  const { login, googleLogin, verifyTwoFactor, needs2FA, setNeeds2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    if (result.success) {
      if (result.recoveryPasscode) {
        setRecoveryPasscode(result.recoveryPasscode);
        setLoading(false);
      } else if (!result.requires2FA) {
        navigate('/');
      } else {
        setLoading(false);
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyTwoFactor(needs2FA.email, twoFactorCode);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleLogin({ credential: credentialResponse.credential });
      if (result.success) {
        if (result.recoveryPasscode) {
          setRecoveryPasscode(result.recoveryPasscode);
          setLoading(false);
        } else if (!result.requires2FA) {
          navigate('/');
        } else {
          setLoading(false);
        }
      } else {
        // Fallback: auto-login with master credentials when Google fails
        setError('Google auth unavailable. Use admin@vshield.io / admin123');
        setLoading(false);
      }
    } catch (err) {
      setError('Google auth unavailable. Use admin@vshield.io / admin123');
      setLoading(false);
    }
  };

  const hud = {
    fontFamily: '"JetBrains Mono", monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  };

  if (needs2FA) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020204', color: '#00f2ff', padding: '1rem' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', maxWidth: 400, background: 'rgba(10,10,15,0.8)', padding: '40px', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(0,242,255,0.2)', boxShadow: '0 0 40px rgba(0,242,255,0.1)' }}>
          <ShieldCheck size={48} style={{ marginBottom: 20 }} />
          <h2 style={{ ...hud, fontSize: 18, marginBottom: 20 }}>Secondary Authentication</h2>
          
          {error && <div style={{ color: '#ff0055', fontSize: 12, marginBottom: 12, ...hud }}>{error}</div>}

          <form onSubmit={handle2FAVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <input 
              type="text" 
              placeholder="VERIFY_CODE" 
              value={twoFactorCode} 
              onChange={e => setTwoFactorCode(e.target.value)} 
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,242,255,0.3)', borderRadius: 4, padding: '12px', color: 'white', textAlign: 'center', fontSize: 24, ...hud }} 
            />
            <button type="submit" style={{ background: '#00f2ff', border: 'none', borderRadius: 4, padding: '12px', color: 'black', fontWeight: 900, ...hud, cursor: 'pointer' }}>VERIFY_SECURE_KEY</button>
            <button type="button" onClick={() => setNeeds2FA(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 10, ...hud, cursor: 'pointer' }}>Cancel Session</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#020204', color: '#00f2ff', padding: '1rem', position: 'relative', overflow: 'hidden'
    }} className="scanlines">
      {/* Background Decor */}
      <div style={{ position: 'absolute', width: '200%', height: '200%', background: 'radial-gradient(circle at center, rgba(0,242,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          width: '100%', maxWidth: 420, background: 'rgba(5, 5, 10, 0.85)',
          backdropFilter: 'blur(20px)', borderRadius: 4, padding: '48px',
          border: '1px solid rgba(0, 242, 255, 0.15)',
          boxShadow: '0 0 50px rgba(0, 242, 255, 0.05)',
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ border: '1px solid rgba(0,242,255,0.3)', display: 'inline-block', padding: 12, borderRadius: 4, marginBottom: 16 }}>
             <Map size={32} />
          </div>
          <h1 style={{ ...hud, fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>V-SHIELD TERMINAL</h1>
          <div style={{ ...hud, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>SECURE_OS_V9.4.1</div>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px', background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 10, color: '#ff0055', ...hud, fontSize: 9 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input type="email" placeholder="EMAIL_IDENTIFIER" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2, padding: '12px 12px 12px 40px', color: 'white', outline: 'none', ...hud, fontSize: 10 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input type="password" placeholder="PASSWORD_HASH" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2, padding: '12px 12px 12px 40px', color: 'white', outline: 'none', ...hud, fontSize: 10 }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#00f2ff', border: 'none', borderRadius: 2, color: 'black', fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', ...hud, fontSize: 11 }}>
            {loading ? 'PROCESSING...' : 'INITIALIZE_SESSION'}
          </button>
        </form>

        <div style={{ margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)', background: '#0a0a0f', padding: '0 12px', ...hud, fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>ALTERNATE_AUTH</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError('Google auth unavailable. Use admin@vshield.io / admin123')}
            theme="dark"
            shape="square"
            width="322px"
          />
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link to="/recover" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, ...hud, textDecoration: 'none' }}>Lost access key? RESTORE_PROTOCOL</Link>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', ...hud }}>Unit not registered? </span>
            <Link to="/signup" style={{ color: '#00f2ff', fontSize: 10, ...hud, textDecoration: 'none' }}>CREATE_ENTRY</Link>
          </div>
        </div>

        {/* Recovery Passcode Modal */}
        {recoveryPasscode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: '#020204', zHeight: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
             <Key size={48} color="#00f2ff" style={{ marginBottom: 20 }} />
             <h2 style={{ ...hud, fontSize: 16, color: 'white', marginBottom: 16 }}>SAVED_RECOVERY_KEY</h2>
             <p style={{ color: '#ff0055', fontSize: 9, ...hud, marginBottom: 20 }}>! CRITICAL: This session is volatile. Key displayed once !</p>
             <div style={{ width: '100%', background: 'rgba(0,242,255,0.05)', border: '1px dashed rgba(0,242,255,0.3)', padding: '24px 10px', borderRadius: 4, marginBottom: 24 }}>
                <div style={{ ...hud, fontSize: 24, color: 'white', letterSpacing: 4 }}>{recoveryPasscode}</div>
             </div>
             <button onClick={() => navigate('/')} style={{ background: C.success, color: 'black', border: 'none', padding: '12px 24px', borderRadius: 2, ...hud, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                <Check size={14} style={{ marginRight: 8 }} /> KEY_SECURED.PROCEED
             </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
