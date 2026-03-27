import React from 'react';
import Sidebar from '../components/Sidebar';
import { Users, Mail, UserPlus, Share2, Shield, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const C = {
  primary: '#00f2ff',
  secondary: '#7000ff',
  success: '#00ff9d',
  bg950: '#020204',
};

const Team = () => {
  const members = [
    { name: 'John Doe', role: 'Lead Researcher', email: 'john@example.com', status: 'Online', initials: 'JD' },
    { name: 'Alice Miller', role: 'Security Analyst', email: 'alice@example.com', status: 'In Mission', initials: 'AM' },
    { name: 'S. Kalia', role: 'System Admin', email: 'sk@example.com', status: 'Away', initials: 'SK' },
    { name: 'R. Patel', role: 'Field Operator', email: 'rp@example.com', status: 'Online', initials: 'RP' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg950, color: '#a0aec0', overflow: 'hidden' }}>
      <Sidebar activePage="/team" />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={18} color={C.primary} />
            <h2 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Collaboration_Team</h2>
          </div>
          <button style={{ background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.25)', borderRadius: 4, padding: '7px 12px', color: C.primary, fontSize: 9, fontWeight: 900, fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <UserPlus size={14} /> INVITE_OPERATOR
          </button>
        </header>

        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {members.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={m.email} 
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, padding: 20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: i % 2 === 0 ? C.secondary : C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 900, border: '2px solid rgba(255,255,255,0.1)' }}>
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: 'white', fontWeight: 900, marginBottom: 2 }}>{m.name}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{m.role}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10 }}>
                      <Mail size={12} color="rgba(255,255,255,0.3)" /> {m.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10 }}>
                      <Activity size={12} color="rgba(255,255,255,0.3)" /> 
                      <span style={{ color: m.status === 'Online' ? C.success : C.warning }}>⬤ {m.status}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '8px', color: 'white', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Share2 size={12} /> PROJECTS
                    </button>
                    <button style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '8px', color: 'white', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Shield size={12} /> PERMISSIONS
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ background: 'rgba(0,242,255,0.02)', border: '1px solid rgba(0,242,255,0.1)', borderRadius: 4, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 50, height: 50, background: 'rgba(0,242,255,0.06)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={24} color={C.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: 'white', fontWeight: 900, marginBottom: 4, textTransform: 'uppercase' }}>Next_Sync_Briefing</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Weekly mission status update with the global team</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: 'white', fontWeight: 900 }}>24 MAR 2026</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>14:30 ZULU TIME</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Team;
