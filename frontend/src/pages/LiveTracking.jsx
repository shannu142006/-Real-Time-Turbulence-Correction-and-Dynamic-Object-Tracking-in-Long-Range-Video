import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { 
  Target, Radio, Cpu, Settings as SettingsIcon, Users, Globe, 
  Activity, Filter, Video, VideoOff, Camera, Smartphone, 
  Wifi, XCircle, Power, Zap
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

const LiveTracking = () => {
  const [entities, setEntities] = useState([]);
  const [systemStats, setSystemStats] = useState({ cpu: '0', memory: '0', gpu: '0' });
  const [connected, setConnected] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [streamSource, setStreamSource] = useState('none'); // 'none', 'webcam', 'phone', 'rtsp'
  const [phoneUrl, setPhoneUrl] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [streamKey, setStreamKey] = useState(0); // Force re-render of img
  const imgRef = useRef(null);
  const { user } = useAuth();

  const PYTHON_URL = 'http://localhost:8000';

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => setConnected(true));
    socket.on('liveTracking', (data) => {
      setEntities(data.entities);
      setSystemStats(data.systemStatus);
    });
    socket.on('disconnect', () => setConnected(false));

    return () => socket.disconnect();
  }, []);

  // Build stream URL based on source
  const getStreamUrl = () => {
    switch (streamSource) {
      case 'webcam':
        return `${PYTHON_URL}/video_feed?source=0`;
      case 'phone':
        return `${PYTHON_URL}/video_feed?source=${encodeURIComponent(phoneUrl)}`;
      case 'rtsp':
        return `${PYTHON_URL}/video_feed?source=${encodeURIComponent(rtspUrl)}`;
      default:
        return null;
    }
  };

  const startStream = (source) => {
    setStreamSource(source);
    setStreamActive(true);
    setStreamKey(prev => prev + 1); // Force img reload
  };

  const killStream = () => {
    setStreamActive(false);
    setStreamSource('none');
    // Clear the img src to release webcam
    if (imgRef.current) {
      imgRef.current.src = '';
    }
  };

  const streamUrl = getStreamUrl();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#020204', color: '#a0aec0', overflow: 'hidden' }}>
      <Sidebar activePage="/tracking" />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Target size={16} color={C.primary} />
            <h1 style={{ ...HUD_STYLE, fontSize: 13, fontWeight: 900, color: 'white', margin: 0 }}>LIVE_CCTV_TRACKER</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16 }}>
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: streamActive ? C.success : C.accent, boxShadow: streamActive ? `0 0 10px ${C.success}` : 'none' }} />
               <span style={{ ...HUD_STYLE, fontSize: 8, color: streamActive ? C.success : C.accent }}>
                 {streamActive ? 'LIVE_FEED_ACTIVE' : 'FEED_OFFLINE'}
               </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Cpu size={12} color={C.primary} />
                <span style={{ ...HUD_STYLE, fontSize: 9 }}>GPU: {systemStats.gpu}%</span>
             </div>

             {/* ── KILL FEED BUTTON ── */}
             {streamActive && (
               <button 
                 onClick={killStream}
                 style={{ 
                   background: C.accent, color: 'white', border: 'none', padding: '6px 18px', 
                   borderRadius: 4, ...HUD_STYLE, fontSize: 10, fontWeight: 900, cursor: 'pointer', 
                   display: 'flex', alignItems: 'center', gap: 6,
                   boxShadow: `0 0 15px ${C.accent}55`, animation: 'pulse 2s infinite'
                 }}>
                 <XCircle size={14} /> KILL_FEED
               </button>
             )}
          </div>
        </header>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
             
             {/* ── LIVE VIDEO FEED ── */}
             <div style={{ flex: 1, background: '#000', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, position: 'relative', overflow: 'hidden', minHeight: 420 }}>
                
                {streamActive && streamUrl ? (
                  <img 
                    ref={imgRef}
                    key={streamKey}
                    src={streamUrl} 
                    alt="LIVE_FEED"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={(e) => {
                       e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  /* ── SOURCE SELECTOR SCREEN ── */
                  <div style={{ 
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: 40,
                    backgroundImage: 'radial-gradient(circle at center, rgba(0,242,255,0.02) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', 
                    backgroundSize: '100% 100%, 40px 40px, 40px 40px'
                  }}>
                     <div style={{ textAlign: 'center', marginBottom: 10 }}>
                        <Camera size={48} color={C.primary} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <div style={{ ...HUD_STYLE, fontSize: 12, color: 'white', fontWeight: 900 }}>SELECT_INPUT_SOURCE</div>
                        <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>CHOOSE A CAMERA TO BEGIN LIVE TRACKING</div>
                     </div>

                     {/* Source Cards */}
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%', maxWidth: 600 }}>
                        
                        {/* Webcam */}
                        <button 
                          onClick={() => startStream('webcam')}
                          style={{ 
                            background: 'rgba(0,242,255,0.05)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: 8, padding: '28px 16px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: '0.3s', color: 'white'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,242,255,0.12)'; e.currentTarget.style.borderColor = C.primary; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,242,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,242,255,0.2)'; }}
                        >
                           <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,242,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Video size={24} color={C.primary} />
                           </div>
                           <div style={{ ...HUD_STYLE, fontSize: 10, fontWeight: 900 }}>WEBCAM</div>
                           <div style={{ ...HUD_STYLE, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>LOCAL_CAMERA</div>
                        </button>

                        {/* Phone Camera */}
                        <button 
                          onClick={() => setStreamSource('phone')}
                          style={{ 
                            background: streamSource === 'phone' ? 'rgba(0,255,157,0.08)' : 'rgba(0,255,157,0.03)', 
                            border: `1px solid ${streamSource === 'phone' ? C.success : 'rgba(0,255,157,0.15)'}`, borderRadius: 8, padding: '28px 16px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: '0.3s', color: 'white'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,255,157,0.1)'; e.currentTarget.style.borderColor = C.success; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = streamSource === 'phone' ? 'rgba(0,255,157,0.08)' : 'rgba(0,255,157,0.03)'; e.currentTarget.style.borderColor = streamSource === 'phone' ? C.success : 'rgba(0,255,157,0.15)'; }}
                        >
                           <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,255,157,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Smartphone size={24} color={C.success} />
                           </div>
                           <div style={{ ...HUD_STYLE, fontSize: 10, fontWeight: 900 }}>PHONE_CAM</div>
                           <div style={{ ...HUD_STYLE, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>VIA_WIFI/BT</div>
                        </button>

                        {/* IP/RTSP Camera */}
                        <button 
                          onClick={() => setStreamSource('rtsp')}
                          style={{ 
                            background: streamSource === 'rtsp' ? 'rgba(255,204,0,0.08)' : 'rgba(255,204,0,0.03)', 
                            border: `1px solid ${streamSource === 'rtsp' ? C.warning : 'rgba(255,204,0,0.15)'}`, borderRadius: 8, padding: '28px 16px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: '0.3s', color: 'white'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,204,0,0.1)'; e.currentTarget.style.borderColor = C.warning; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = streamSource === 'rtsp' ? 'rgba(255,204,0,0.08)' : 'rgba(255,204,0,0.03)'; e.currentTarget.style.borderColor = streamSource === 'rtsp' ? C.warning : 'rgba(255,204,0,0.15)'; }}
                        >
                           <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,204,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Wifi size={24} color={C.warning} />
                           </div>
                           <div style={{ ...HUD_STYLE, fontSize: 10, fontWeight: 900 }}>IP_CAMERA</div>
                           <div style={{ ...HUD_STYLE, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>RTSP/CCTV</div>
                        </button>
                     </div>

                     {/* Phone Camera URL Input */}
                     {streamSource === 'phone' && (
                       <div style={{ width: '100%', maxWidth: 500, padding: 20, background: 'rgba(0,255,157,0.03)', border: '1px solid rgba(0,255,157,0.15)', borderRadius: 8 }}>
                          <div style={{ ...HUD_STYLE, fontSize: 9, color: C.success, marginBottom: 12 }}>PHONE_CAMERA_SETUP</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 12, lineHeight: 1.6 }}>
                            Install <span style={{ color: C.success, fontWeight: 700 }}>IP Webcam</span> or <span style={{ color: C.success, fontWeight: 700 }}>DroidCam</span> on your phone. 
                            Connect to same WiFi. Enter the stream URL below.
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input 
                              type="text"
                              placeholder="http://192.168.1.X:8080/video" 
                              value={phoneUrl}
                              onChange={(e) => setPhoneUrl(e.target.value)}
                              style={{ flex: 1, padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'white', ...HUD_STYLE, fontSize: 9, outline: 'none' }}
                            />
                            <button 
                              onClick={() => { if (phoneUrl) startStream('phone'); }}
                              disabled={!phoneUrl}
                              style={{ padding: '10px 20px', background: phoneUrl ? C.success : 'rgba(255,255,255,0.1)', color: 'black', border: 'none', borderRadius: 4, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: phoneUrl ? 'pointer' : 'not-allowed' }}>
                              <Zap size={12} style={{ marginRight: 4, display: 'inline' }} /> CONNECT
                            </button>
                          </div>
                          <div style={{ marginTop: 10, fontSize: 8, color: 'rgba(255,255,255,0.3)', ...HUD_STYLE }}>
                            EXAMPLE: http://192.168.1.5:8080/video | http://192.168.1.5:4747/video
                          </div>
                       </div>
                     )}

                     {/* RTSP URL Input */}
                     {streamSource === 'rtsp' && (
                       <div style={{ width: '100%', maxWidth: 500, padding: 20, background: 'rgba(255,204,0,0.03)', border: '1px solid rgba(255,204,0,0.15)', borderRadius: 8 }}>
                          <div style={{ ...HUD_STYLE, fontSize: 9, color: C.warning, marginBottom: 12 }}>IP_CAMERA_SETUP</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input 
                              type="text"
                              placeholder="rtsp://admin:pass@192.168.1.X:554/stream" 
                              value={rtspUrl}
                              onChange={(e) => setRtspUrl(e.target.value)}
                              style={{ flex: 1, padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'white', ...HUD_STYLE, fontSize: 9, outline: 'none' }}
                            />
                            <button 
                              onClick={() => { if (rtspUrl) startStream('rtsp'); }}
                              disabled={!rtspUrl}
                              style={{ padding: '10px 20px', background: rtspUrl ? C.warning : 'rgba(255,255,255,0.1)', color: 'black', border: 'none', borderRadius: 4, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: rtspUrl ? 'pointer' : 'not-allowed' }}>
                              <Zap size={12} style={{ marginRight: 4, display: 'inline' }}  /> CONNECT
                            </button>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {/* HUD Overlays when streaming */}
                {streamActive && (
                  <>
                    <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.75)', padding: '8px 12px', borderRadius: 2, borderLeft: `3px solid ${C.accent}`, zIndex: 10 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.accent, animation: 'pulse 1.5s infinite' }} />
                          <span style={{ ...HUD_STYLE, fontSize: 9, color: 'white', fontWeight: 900 }}>REC</span>
                       </div>
                    </div>
                    <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.75)', padding: '8px 12px', borderRadius: 2, zIndex: 10 }}>
                       <div style={{ ...HUD_STYLE, fontSize: 8, color: C.primary }}>YOLOv8 + BYTETRACK</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.75)', padding: '8px 12px', borderRadius: 2, zIndex: 10 }}>
                       <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                         SRC: {streamSource === 'phone' ? 'PHONE_CAM' : streamSource === 'rtsp' ? 'RTSP_CAMERA' : 'LOCAL_WEBCAM'} | TURBO_320P
                       </div>
                    </div>
                    {/* Big Kill Button overlay */}
                    <button 
                      onClick={killStream}
                      style={{ 
                        position: 'absolute', bottom: 16, right: 16, zIndex: 10,
                        background: 'rgba(255,0,85,0.9)', color: 'white', border: 'none', padding: '8px 16px', 
                        borderRadius: 4, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 20px rgba(255,0,85,0.4)'
                      }}>
                      <Power size={14} /> STOP_FEED
                    </button>
                  </>
                )}
             </div>

             {/* Entity Status Badges */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {entities.map(e => (
                   <div key={e.id} style={{ padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
                      <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>SIGNAL_IDENT: {e.id}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{e.label}</span>
                         <span style={{ color: C.success, ...HUD_STYLE, fontSize: 8 }}>TRACKING</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.primary, marginTop: 4, fontWeight: 700 }}>CONF: {Math.round(e.confidence * 100)}%</div>
                   </div>
                ))}
             </div>

             {/* Analytics */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                 <div style={{ padding: 24, background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <h3 style={{ ...HUD_STYLE, fontSize: 11, color: 'white', margin: '0 0 24px 0' }}>Detection Confidence</h3>
                    <div style={{ height: 180, border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.4)', borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 10px' }}>
                       {[60, 85, 45, 95, 70, 80, 55, 90].map((h, i) => (
                          <div key={i} style={{ width: 12, height: `${h}%`, background: `linear-gradient(to top, ${C.primary}, transparent)`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                             <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 7, color: C.primary, ...HUD_STYLE }}>{h}%</div>
                          </div>
                       ))}
                    </div>
                 </div>
                 <div style={{ padding: 24, background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <h3 style={{ ...HUD_STYLE, fontSize: 11, color: 'white', margin: '0 0 24px 0' }}>Target Categorization</h3>
                    <div style={{ height: 180, background: 'rgba(0,0,0,0.4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                       <div style={{ width: 100, height: 100, borderRadius: '50%', border: '8px solid rgba(0,242,255,0.1)', borderTopColor: C.primary, borderRightColor: C.success, animation: 'spin 10s linear infinite' }} />
                       <div style={{ position: 'absolute', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>LIVE</div>
                          <div style={{ ...HUD_STYLE, fontSize: 8, color: C.primary }}>SCANNING</div>
                       </div>
                    </div>
                 </div>
             </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', padding: 24, background: 'rgba(10,10,15,0.7)', overflowY: 'auto' }}>
             <h3 style={{ ...HUD_STYLE, fontSize: 12, color: 'white', marginBottom: 20 }}>FEED_CONTROLLER</h3>
             
             {/* Quick Source Buttons */}
             <div style={{ padding: 16, background: 'rgba(0,242,255,0.03)', borderRadius: 4, border: '1px solid rgba(0,242,255,0.1)', marginBottom: 16 }}>
                <div style={{ ...HUD_STYLE, fontSize: 9, color: C.primary, marginBottom: 12 }}>QUICK_CONNECT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <button 
                     onClick={() => startStream('webcam')}
                     style={{ width: '100%', padding: '10px 12px', background: streamSource === 'webcam' && streamActive ? C.primary : 'rgba(255,255,255,0.03)', color: streamSource === 'webcam' && streamActive ? 'black' : 'white', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                     <Video size={14} /> WEBCAM_LOCAL
                   </button>
                   <button 
                     onClick={() => { setStreamSource('phone'); setStreamActive(false); }}
                     style={{ width: '100%', padding: '10px 12px', background: streamSource === 'phone' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.03)', color: streamSource === 'phone' ? C.success : 'white', border: `1px solid ${streamSource === 'phone' ? 'rgba(0,255,157,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 4, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                     <Smartphone size={14} /> PHONE_CAMERA
                   </button>
                   <button 
                     onClick={() => { setStreamSource('rtsp'); setStreamActive(false); }}
                     style={{ width: '100%', padding: '10px 12px', background: streamSource === 'rtsp' ? 'rgba(255,204,0,0.1)' : 'rgba(255,255,255,0.03)', color: streamSource === 'rtsp' ? C.warning : 'white', border: `1px solid ${streamSource === 'rtsp' ? 'rgba(255,204,0,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 4, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                     <Wifi size={14} /> IP/RTSP_CAMERA
                   </button>
                </div>
             </div>

             {/* Kill Button - Always Visible */}
             <button 
               onClick={killStream}
               disabled={!streamActive}
               style={{ 
                 width: '100%', padding: '12px', marginBottom: 16,
                 background: streamActive ? C.accent : 'rgba(255,255,255,0.03)', 
                 color: streamActive ? 'white' : 'rgba(255,255,255,0.2)', 
                 border: `1px solid ${streamActive ? C.accent : 'rgba(255,255,255,0.05)'}`, 
                 borderRadius: 4, ...HUD_STYLE, fontSize: 10, fontWeight: 900, 
                 cursor: streamActive ? 'pointer' : 'not-allowed',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
               }}>
               <XCircle size={14} /> KILL_ALL_FEEDS
             </button>

             {/* System Stats */}
             <div style={{ padding: 16, background: 'rgba(0,242,255,0.03)', borderRadius: 4, border: '1px solid rgba(0,242,255,0.1)', marginBottom: 24 }}>
                <div style={{ ...HUD_STYLE, fontSize: 9, color: C.primary, marginBottom: 16 }}>SYSTEM_LOAD</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {[
                     { label: 'CPU_CORES', value: systemStats.cpu, color: C.success },
                     { label: 'MEMORY_VRAM', value: systemStats.memory, color: C.success },
                     { label: 'GPU_ENGINE', value: systemStats.gpu, color: systemStats.gpu > 35 ? C.warning : C.success },
                   ].map(s => (
                     <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: s.color }} />
                        <span style={{ ...HUD_STYLE, fontSize: 8, flex: 1 }}>{s.label}</span>
                        <span style={{ ...HUD_STYLE, fontSize: 9, color: s.color }}>{s.value}%</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Action Buttons */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'GLOBE_SYNC', icon: <Globe size={12} /> },
                  { label: 'TELEMETRY_FEEDS', icon: <Radio size={12} /> },
                  { label: 'UNIT_MANAGEMENT', icon: <Users size={12} /> },
                  { label: 'ADVANCED_TUNING', icon: <SettingsIcon size={12} /> },
                ].map(btn => (
                  <button key={btn.label} style={{ ...HUD_STYLE, fontSize: 9, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '12px', borderRadius: 4, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {btn.label} {btn.icon}
                  </button>
                ))}
             </div>

             {/* Phone Camera Guide */}
             <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,255,157,0.03)', borderRadius: 4, border: '1px solid rgba(0,255,157,0.1)' }}>
                <h4 style={{ ...HUD_STYLE, fontSize: 9, marginBottom: 8, color: C.success }}>PHONE_CAM_GUIDE</h4>
                <div style={{ fontSize: 10, lineHeight: 1.8, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  <div>1. Install <b style={{ color: C.success }}>IP Webcam</b> (Android) or <b style={{ color: C.success }}>DroidCam</b></div>
                  <div>2. Connect phone to same WiFi</div>
                  <div>3. Start server in app</div>
                  <div>4. Enter URL shown in app</div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Format: http://192.168.X.X:8080/video</div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveTracking;
