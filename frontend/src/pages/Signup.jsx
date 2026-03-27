import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Mail, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', secretPasscode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signup(form.name, form.email, form.password, form.secretPasscode);
    if (result.success) {
      navigate('/');
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
      <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(112,0,255,0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 24, left: 24, width: 40, height: 40, borderTop: '1px solid rgba(112,0,255,0.3)', borderLeft: '1px solid rgba(112,0,255,0.3)' }} />
      <div style={{ position: 'absolute', bottom: 24, right: 24, width: 40, height: 40, borderBottom: '1px solid rgba(112,0,255,0.3)', borderRight: '1px solid rgba(112,0,255,0.3)' }} />

      <motion.div initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }} style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(112,0,255,0.1)', border: '1px solid rgba(112,0,255,0.4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(112,0,255,0.2)' }}>
            <Shield size={20} color="#7000ff" />
          </div>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Kernel_Enroll</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>Terminal.V2_Account_Creation</div>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 14px', background: 'rgba(255,0,85,0.08)', border: '1px solid rgba(255,0,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 8, color: '#ff6b8a', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <AlertCircle size={12} />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: User, ph: 'OPERATOR_NAME', key: 'name', type: 'text' },
            { icon: Mail, ph: 'ENROLLMENT_EMAIL', key: 'email', type: 'email' },
            { icon: Lock, ph: 'SECURE_PASSPHRASE', key: 'password', type: 'password' },
            { icon: Lock, ph: 'RECOVERY_PASSCODE (4+ DIGITS)', key: 'secretPasscode', type: 'text' },
          ].map(({ icon: Icon, ph, key, type }) => (
            <div key={key} style={{ position: 'relative' }}>
              <Icon size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required className="hud-input" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-hud" style={{ marginTop: 8, padding: 14, fontSize: 11, letterSpacing: '0.2em', opacity: loading ? 0.6 : 1, background: 'rgba(112,0,255,0.1)', borderColor: 'rgba(112,0,255,0.4)', color: '#b070ff' }}>
            {loading ? 'ENROLLING...' : '⬡ REGISTER_OPERATOR'}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <Link to="/login" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
            Already registered? → Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
