import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Video, Activity, BarChart3, Layers,
  Shield, Users, ScanSearch, LogOut
} from 'lucide-react';

const NAV = [
  { icon: Home,     label: 'Dashboard',    path: '/'          },
  { icon: Video,    label: 'Video Feed',   path: '/video'     },
  { icon: Activity, label: 'Live Tracking',path: '/tracking'  },
  { icon: BarChart3,label: 'Analytics',    path: '/analytics' },
  { icon: Layers,   label: 'History',      path: '/history'   },
  { icon: Shield,   label: 'Security',     path: '/security'  },
];

const C = { primary: '#00f2ff', success: '#00ff9d' };
const hud = { fontFamily:'"JetBrains Mono","Courier New",monospace', textTransform:'uppercase', letterSpacing:'0.12em' };

export default function Sidebar({ activePage }) {
  const navigate   = useNavigate();
  const location   = useLocation();

  // Handle auth context safely
  let logout = () => {};
  let user = null;
  try {
    const auth = useAuth();
    logout = auth.logout;
    user = auth.user;
  } catch (error) {
    // Auth context not available, use no-op
    console.warn('Auth context not available in Sidebar');
  }

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={{
      width: 230, flexShrink: 0,
      background: 'rgba(2,2,4,0.94)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(0,242,255,0.15), rgba(112,0,255,0.15))',
          border: '1px solid rgba(0,242,255,0.3)', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(0,242,255,0.12)',
        }}>
          <ScanSearch size={16} color={C.primary} />
        </div>
        <div>
          <div style={{ ...hud, fontSize: 13, fontWeight: 900, color: 'white', letterSpacing: '0.18em', fontStyle: 'italic' }}>V-SHIELD</div>
          <div style={{ ...hud, fontSize: 7, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>SURVEILLANCE UNIT-01</div>
        </div>
      </div>

      {/* User Profile Info */}
      <div style={{ margin: '12px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: 4, flexShrink: 0,
          background: user?.picture ? `url(${user.picture})` : `linear-gradient(135deg, ${C.primary}, #7000ff)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          boxShadow: '0 0 10px rgba(0,242,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 10
        }}>
          {!user?.picture && (user?.name?.[0] || 'A')}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ ...hud, fontSize: 8, color: 'white', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'ADMIN'}</div>
          <div style={{ ...hud, fontSize: 6, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'OFFLINE'}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV.map((n) => {
          const active = isActive(n.path);
          return (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', borderRadius: 4, width: '100%', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.18s ease',
                background: active ? 'rgba(0,242,255,0.07)' : 'transparent',
                border: active ? '1px solid rgba(0,242,255,0.24)' : '1px solid transparent',
                color: active ? C.primary : '#4a5568',
                ...hud, fontSize: 9, fontWeight: 700,
                boxShadow: active ? '0 0 10px rgba(0,242,255,0.08)' : 'none',
              }}
            >
              <n.icon size={14} color={active ? C.primary : '#4a5568'} />
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer: CV Status + Logout */}
      <div style={{ padding: '8px 10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* CV Status */}
        <div style={{
          padding: '12px 14px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
          background: 'rgba(0,242,255,0.03)', border: '1px solid rgba(0,242,255,0.1)', borderRadius: 4,
        }}>
          <div style={{ position: 'absolute', width: 60, height: 60, background: 'rgba(0,242,255,0.07)', borderRadius: '50%', filter: 'blur(18px)', right: -8, bottom: -8 }} />
          <div style={{ ...hud, fontSize: 7, color: C.primary, marginBottom: 7 }}>KERNEL STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="status-dot status-active" />
            <span style={{ ...hud, fontSize: 9, color: 'white', fontWeight: 700 }}>CV_NODE.ACTIVE</span>
          </div>
          <div style={{ ...hud, fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>YOLOv8 / DEEPSORT ONLINE</div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 4, width: '100%', textAlign: 'left', cursor: 'pointer',
            background: 'transparent', border: '1px solid transparent',
            color: '#4a5568', ...hud, fontSize: 9, fontWeight: 700,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,85,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,0,85,0.2)'; e.currentTarget.style.color = '#ff0055'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#4a5568'; }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
