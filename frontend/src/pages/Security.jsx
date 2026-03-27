import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Shield, Key, Eye, EyeOff, Lock, AlertCircle, CheckCircle, Smartphone, ShieldCheck, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const C = {
  primary: '#00f2ff',
  success: '#00ff9d',
  accent: '#ff0055',
  warning: '#ffcc00',
  text: '#a0aec0',
  bg: '#020204',
  panel: 'rgba(10,10,15,0.75)',
};

const hud = {
  fontFamily: '"JetBrains Mono",monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const Security = () => {
  const { user, updateUser } = useAuth();
  const [showPasscode, setShowPasscode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(null);

  const generateAlphanumericPasscode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.slice(0, 4) + '-' + result.slice(4);
  };

  const handleToggle2FA = async () => {
    setIsUpdating(true);
    try {
      const newStatus = !user?.is2FAEnabled;
      const response = await fetch('/api/auth/update-security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ is2FAEnabled: newStatus }),
      });

      if (response.ok) {
        updateUser({ is2FAEnabled: newStatus });
        setStatus({ type: 'success', message: `2FA PROTOCOL ${newStatus ? 'ENABLED' : 'DISABLED'}` });
      } else {
        const err = await response.json();
        setStatus({ type: 'error', message: err.message || 'FAILED TO UPDATE 2FA' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'CONNECTION ERROR' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleGeneratePasscode = async () => {
    setIsUpdating(true);
    const newPasscode = generateAlphanumericPasscode();
    try {
      const response = await fetch('/api/auth/update-security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ secretPasscode: newPasscode }),
      });

      if (response.ok) {
        updateUser({ secretPasscode: newPasscode });
        setStatus({ type: 'success', message: 'NEW RECOVERY PASSCODE GENERATED & SECURED' });
      } else {
        const err = await response.json();
        setStatus({ type: 'error', message: err.message || 'FAILED TO GEN PASSCODE' });
      }
    } catch (error) {
       setStatus({ type: 'error', message: 'CONNECTION ERROR' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const Card = ({ children, title, icon: Icon, color = C.primary }) => (
    <div style={{
      background: C.panel, backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 4, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Icon size={18} color={color} />
        <h3 style={{ ...hud, fontSize: 13, color: 'white', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.text, overflow: 'hidden' }}>
      <Sidebar activePage="/security" />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={16} color={C.primary} />
            <h1 style={{ ...hud, fontSize: 13, fontWeight: 900, color: 'white', margin: 0 }}>SECURITY_CONSOLE</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...hud, fontSize: 9, color: C.success }}>PROTOCOL.ACTIVE_AES_256</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {status && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                marginBottom: 20, padding: '12px 16px', borderRadius: 4, background: status.type === 'success' ? 'rgba(0,255,157,0.1)' : 'rgba(255,0,85,0.1)', border: `1px solid ${status.type === 'success' ? C.success : C.accent}`,
                color: status.type === 'success' ? C.success : C.accent, display: 'flex', alignItems: 'center', gap: 10, ...hud, fontSize: 10, fontWeight: 700
              }}>
                {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {status.message}
              </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24 }}>
              <Card title="ACCOUNT_RECOVERY_PROTOCOL" icon={Key} color={C.primary}>
                <p style={{ fontSize: 12, lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Your recovery key allows you to restore access even if 2FA or Google Auth is unavailable.</p>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...hud, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 8, display: 'block' }}>Hashed Recovery Passcode</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPasscode ? 'text' : 'password'}
                      value={user?.secretPasscode || 'XXXX-XXXX'} 
                      readOnly 
                      style={{ 
                        width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, padding: '12px 16px', color: 'white', letterSpacing: showPasscode ? '2px' : '4px',
                        ...hud, fontSize: 16, outline: 'none'
                      }} 
                    />
                    <button onClick={() => setShowPasscode(!showPasscode)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.primary, cursor: 'pointer' }}>
                      {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button onClick={handleGeneratePasscode} disabled={isUpdating} style={{ 
                  width: '100%', padding: '12px', background: 'rgba(0,242,255,0.08)', border: '1px solid rgba(0,242,255,0.3)', color: C.primary, ...hud, fontSize: 10, fontWeight: 900, cursor: isUpdating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}>
                  {isUpdating ? <RefreshCcw className="animate-spin" size={14} /> : 'GENERATE_NEW_RECOVERY_TOKEN'}
                </button>
              </Card>

              <Card title="RELIANCE.ADVANCED_HARDWARE" icon={Smartphone} color={C.success}>
                <p style={{ fontSize: 12, lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Add an extra layer of protection using biometric data or SMS-based verification.</p>
                
                <div style={{ padding: 16, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                   <div>
                      <div style={{ ...hud, fontSize: 10, color: 'white' }}>Multi-Factor Authentication</div>
                      <div style={{ ...hud, fontSize: 8, color: user?.is2FAEnabled ? C.success : 'rgba(255,255,255,0.2)' }}>{user?.is2FAEnabled ? 'STATUS: NOMINAL' : 'STATUS: INACTIVE'}</div>
                   </div>
                   <div 
                      onClick={handleToggle2FA}
                      style={{ width: 40, height: 20, background: user?.is2FAEnabled ? C.success : 'rgba(255,255,255,0.1)', borderRadius: 10, position: 'relative', cursor: isUpdating ? 'not-allowed' : 'pointer', transition: '0.3s' }}
                    >
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', left: user?.is2FAEnabled ? 23 : 3, top: 3, transition: '0.3s' }} />
                   </div>
                </div>

                <div style={{ padding: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 20 }}>
                   <div style={{ ...hud, fontSize: 7, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>SMS_GATEWAY_LINK</div>
                   <div style={{ display: 'flex', gap: 10 }}>
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000" 
                        style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 2, color: 'white', ...hud, fontSize: 10 }} 
                      />
                      <button style={{ background: C.success, color: 'black', border: 'none', padding: '0 12px', borderRadius: 2, ...hud, fontSize: 8, fontWeight: 900, cursor: 'pointer' }}>LINK_CELL</button>
                   </div>
                </div>

                {user?.is2FAEnabled && (
                  <div style={{ padding: 16, background: 'rgba(0,0,242,0.05)', borderRadius: 2, border: '1px solid rgba(0,242,255,0.15)', marginBottom: 20 }}>
                     <div style={{ ...hud, fontSize: 7, color: C.primary, marginBottom: 8 }}>V-SHIELD_AUTHENTICATOR_SEED</div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <code style={{ fontSize: 14, color: 'white', letterSpacing: 2 }}>{user?.id?.slice(-8).toUpperCase()}-VSEC-99</code>
                        <button style={{ background: 'none', border: 'none', color: C.primary, cursor: 'pointer', ...hud, fontSize: 8 }}>COPY_KEY</button>
                     </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)', ...hud, fontSize: 8, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={12} /> SESSION_24H
                  </div>
                  <div style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)', ...hud, fontSize: 8, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={12} /> GEO_LOCK: ON
                  </div>
                </div>
              </Card>

              <Card title="SECURITY_AUDIT_LOGS" icon={AlertCircle} color={C.warning}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { event: 'SECURITY_PROTOCOL_SYNC', detail: 'Update success', time: 'Just now', severity: C.success },
                      { event: 'NEW_RECOVERY_KEY_GEN', detail: 'ID: ****-XXXX', time: '12 min ago', severity: C.primary },
                      { event: 'SESSION_INITIALIZED', detail: 'IP: 192.168.1.1', time: '1 hour ago', severity: C.success },
                    ].map((log, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: i === 2 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                         <div>
                            <div style={{ ...hud, fontSize: 9, color: log.severity }}>{log.event}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{log.detail}</div>
                         </div>
                         <div style={{ ...hud, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>{log.time}</div>
                      </div>
                    ))}
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;
