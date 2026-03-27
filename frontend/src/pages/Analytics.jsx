import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, LineChart, PieChart, Activity, 
  TrendingUp as TrendingUpIcon, Download, Share2, Filter, 
  Calendar, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  TrendingDown
} from 'lucide-react';

const C = { 
  primary: '#00f2ff', 
  success: '#00ff9d', 
  accent: '#ff0055',
  warning: '#ffcc00'
};

const HUD_STYLE = {
  fontFamily: '"JetBrains Mono",monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.12em'
};

const Analytics = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#020204', color: '#a0aec0', overflow: 'hidden' }}>
      <Sidebar activePage="/analytics" />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart size={16} color={C.primary} />
            <h1 style={{ ...HUD_STYLE, fontSize: 13, fontWeight: 900, color: 'white', margin: 0 }}>PERFORMANCE_BI</h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: 4, ...HUD_STYLE, fontSize: 9, cursor: 'pointer' }}>TIME_FRAME</button>
             <button style={{ background: C.primary, color: 'black', border: 'none', padding: '6px 16px', borderRadius: 4, ...HUD_STYLE, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>DL_REPORT</button>
          </div>
        </header>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
             {/* Stats Hub */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Avg PSNR Gain', value: '+12.5 dB', trend: '+4.2%', icon: Activity, color: C.primary, positive: true },
                  { label: 'Object Recall', value: '94.8%', trend: '+1.5%', icon: TrendingUpIcon, color: C.success, positive: true },
                  { label: 'Mean Latency', value: '8.4 ms', trend: '-12%', icon: TrendingDown, color: C.accent, positive: true },
                  { label: 'Storage Unit', value: '1.2 TB', trend: '+240 GB', icon: BarChart, color: C.warning, positive: false },
                ].map((m, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                       <m.icon size={16} color={m.color} />
                       <div style={{ color: m.positive ? C.success : C.accent, fontSize: 9, fontWeight: 900, ...HUD_STYLE }}>{m.trend}</div>
                    </div>
                    <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{m.value}</div>
                  </div>
                ))}
             </div>

             {/* Chart Boxes */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ padding: 24, background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                      <h3 style={{ ...HUD_STYLE, fontSize: 11, color: 'white', margin: 0 }}>Processing Efficiency</h3>
                      <MoreHorizontal size={14} color="rgba(255,255,255,0.2)" />
                   </div>
                    <div style={{ height: 200, padding: '20px 0', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.4)', borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                       {[60, 85, 45, 95, 70, 80, 55, 90].map((h, i) => (
                          <div key={i} style={{ width: 12, height: `${h}%`, background: `linear-gradient(to top, ${C.primary}, transparent)`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                             <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: C.primary, ...HUD_STYLE }}>{h}%</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div style={{ padding: 24, background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                       <h3 style={{ ...HUD_STYLE, fontSize: 11, color: 'white', margin: 0 }}>Target Categorization</h3>
                       <Filter size={14} color="rgba(255,255,255,0.2)" />
                    </div>
                    <div style={{ height: 200, background: 'rgba(0,0,0,0.4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                       <div style={{ width: 120, height: 120, borderRadius: '50%', border: `8px solid rgba(0,242,255,0.1)`, borderTopColor: C.primary, borderRightColor: C.success }} />
                       <div style={{ position: 'absolute', textAlign: 'center' }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>8.2K</div>
                          <div style={{ ...HUD_STYLE, fontSize: 8, color: C.primary }}>OBJECTS</div>
                       </div>
                    </div>
                 </div>
             </div>

             {/* Intelligence Feed */}
             <div style={{ padding: 24, background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                <h3 style={{ ...HUD_STYLE, fontSize: 11, color: 'white', marginBottom: 20 }}>INTELLIGENCE_FEED</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {[
                     { msg: 'Low-light optimization triggered for SEC-04 stream', time: '12 min ago', type: 'INFO' },
                     { msg: 'PSNR gains exceeded 40dB for static footage processing', time: '1 hour ago', type: 'SUCCESS' },
                     { msg: 'Interpolation engine recalibrated (Variance > 12%)', time: '3 hours ago', type: 'WARNING' },
                     { msg: 'Multi-GPU inference distributed across Cluster-B', time: '5 hours ago', type: 'INFO' },
                   ].map((log, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: i === 3 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ ...HUD_STYLE, fontSize: 8, color: log.type === 'WARNING' ? C.warning : log.type === 'SUCCESS' ? C.success : C.primary, width: 60 }}>{log.type}</div>
                        <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{log.msg}</div>
                        <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>{log.time}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
