import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Key, AlertCircle, CheckCircle } from 'lucide-react';

const Recover = () => {
  const [email, setEmail] = useState('');
  const [secretPasscode, setSecretPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { recover } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await recover(email, secretPasscode);
    if (result.success) {
      setSuccess('Access granted! Redirecting to terminal...');
      setTimeout(() => navigate('/'), 2000);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const card = {
    width: '100%', maxWidth: 420,
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
    padding: '40px', boxShadow: '0 0 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,242,255,0.04)',
    position: 'relative', zIndex: 10,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #020204 0%, #0a0a1a 50%, #020204 100%)',
      padding: '1rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,255,157,0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }} style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(0,255,157,0.1)', border: '1px solid rgba(0,255,157,0.4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(0,255,157,0.2)' }}>
            <Shield size={20} color="#00ff9d" />
          </div>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Access_Restore</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>Recovery.Terminal_Authenticated</div>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 14px', background: 'rgba(255,0,85,0.08)', border: '1px solid rgba(255,0,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 8, color: '#ff6b8a', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <AlertCircle size={12} />{error}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: 20, padding: '12px 14px', background: 'rgba(0,255,157,0.08)', border: '1px solid rgba(0,255,157,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 8, color: '#00ff9d', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <CheckCircle size={12} />{success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <Mail size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="email" placeholder="ENROLLMENT_EMAIL" value={email} onChange={e => setEmail(e.target.value)} required className="hud-input" />
          </div>
          <div style={{ position: 'relative' }}>
            <Key size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="RECOVERY_PASSCODE" value={secretPasscode} onChange={e => setSecretPasscode(e.target.value)} required className="hud-input" />
          </div>
          <button type="submit" disabled={loading} className="btn-hud" style={{ marginTop: 8, padding: 14, fontSize: 11, letterSpacing: '0.2em', opacity: loading ? 0.6 : 1, background: 'rgba(0,255,157,0.1)', borderColor: 'rgba(0,255,157,0.4)', color: '#00ff9d' }}>
            {loading ? 'VERIFYING...' : '⬡ RESTORE_ACCESS'}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <Link to="/login" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
            Back to terminal → Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Recover;
