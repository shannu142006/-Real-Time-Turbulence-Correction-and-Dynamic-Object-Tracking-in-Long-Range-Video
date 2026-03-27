import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { 
  Play, Pause, SkipBack, SkipForward, Maximize2, 
  Settings as SettingsIcon, Download, Share2, Layers, 
  Target, BarChart, FileVideo, Activity, Info, RefreshCw
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

const VideoAnalysis = () => {
  const [history, setHistory] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics');
  const { user } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('/api/video', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        if (data.length > 0 && !selectedVideo) {
          setSelectedVideo(data[0]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#020204', color: '#a0aec0', overflow: 'hidden' }}>
      <Sidebar activePage="/video" />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileVideo size={16} color={C.primary} />
            <h1 style={{ ...HUD_STYLE, fontSize: 13, fontWeight: 900, color: 'white', margin: 0 }}>MEDIA_ANALYSIS_INTEL</h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <button onClick={fetchHistory} style={{ background: 'none', border: 'none', color: C.primary, cursor: 'pointer', ...HUD_STYLE, fontSize: 9 }}>
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
             </button>
             <input
                id="video-upload-input"
                type="file"
                multiple
                accept="video/*,image/*"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  for (const file of files) {
                    const formData = new FormData();
                    formData.append('video', file);
                    await fetch('/api/video', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${user?.token}` },
                      body: formData,
                    });
                  }
                  fetchHistory();
                }}
                style={{ display: 'none' }}
             />
             <button 
                onClick={() => document.getElementById('video-upload-input').click()}
                style={{ background: C.primary, border: 'none', color: 'black', padding: '6px 16px', borderRadius: 4, ...HUD_STYLE, fontSize: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={14} /> ADD_NEW_FEED
             </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, overflow: 'hidden' }}>
          
          {/* Main Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflow: 'hidden' }}>
              <VideoPlayer videoData={selectedVideo} />

              {/* Bottom Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                 <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Activity size={16} color={C.primary} />
                    <div>
                      <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>LATENCY_MS</div>
                      <div style={{ ...HUD_STYLE, fontSize: 13, color: 'white', fontWeight: 900 }}>{selectedVideo?.metrics?.latency_ms || '0.0'}ms</div>
                    </div>
                 </div>
                 <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Target size={16} color={C.success} />
                    <div>
                      <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>OBJECTS_DETECTED</div>
                      <div style={{ ...HUD_STYLE, fontSize: 13, color: 'white', fontWeight: 900 }}>{selectedVideo?.metrics?.objects_detected || '0'}</div>
                    </div>
                 </div>
                 <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <BarChart size={16} color={C.warning} />
                    <div>
                      <div style={{ ...HUD_STYLE, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>FRAME_STABILITY</div>
                      <div style={{ ...HUD_STYLE, fontSize: 13, color: 'white', fontWeight: 900 }}>{selectedVideo?.metrics?.frame_stability || '98.2'}%</div>
                    </div>
                 </div>
              </div>
          </div>

          {/* Right Panel: History List */}
          <div style={{ background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['HISTORY', 'LOGS'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t.toLowerCase())}
                    style={{ 
                      flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === t.toLowerCase() ? `2px solid ${C.primary}` : 'none',
                      color: activeTab === t.toLowerCase() ? C.primary : 'rgba(255,255,255,0.3)', ...HUD_STYLE, fontSize: 9, fontWeight: 700
                    }}>
                    {t}
                  </button>
                ))}
             </div>

             <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTab === 'history' ? (
                  <>
                    <div style={{ padding: 16, background: 'rgba(0,242,255,0.05)', border: '1px dashed rgba(0,242,255,0.2)', borderRadius: 4, textAlign: 'center' }}>
                       <div style={{ ...HUD_STYLE, fontSize: 8, color: C.primary, marginBottom: 12 }}>UPLOAD_TERMINAL</div>
                       <button 
                         onClick={() => document.getElementById('video-upload-input').click()}
                         style={{ width: '100%', padding: '10px', background: C.primary, border: 'none', borderRadius: 2, ...HUD_STYLE, fontSize: 9, fontWeight: 900, cursor: 'pointer', color: 'black' }}>
                          + ADD_VIDEO_STREAM
                       </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       {history.length === 0 ? (
                         <div style={{ textAlign: 'center', padding: 40, opacity: 0.2 }}>[ NO_RECORDS ]</div>
                       ) : (
                         history.map(v => (
                           <div 
                             key={v._id} 
                             onClick={() => setSelectedVideo(v)}
                             style={{ 
                               padding: 12, background: selectedVideo?._id === v._id ? 'rgba(0,242,255,0.05)' : 'rgba(255,255,255,0.02)', 
                               border: `1px solid ${selectedVideo?._id === v._id ? C.primary : 'rgba(255,255,255,0.05)'}`, 
                               borderRadius: 4, cursor: 'pointer', transition: '0.2s'
                             }}>
                              <div style={{ ...HUD_STYLE, fontSize: 10, color: 'white', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.originalFilename}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{new Date(v.createdAt).toLocaleDateString()}</span>
                                 <span style={{ fontSize: 9, color: v.status === 'completed' ? C.success : C.warning }}>{v.status}</span>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                  </>
                ) : activeTab === 'logs' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ padding: 12, background: 'rgba(0,242,255,0.03)', borderRadius: 4, border: '1px solid rgba(0,242,255,0.1)' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}><Info size={12} color={C.primary} /><span style={{ ...HUD_STYLE, fontSize: 8, color: C.primary }}>SYSTEM_ADVISOR</span></div>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>Feed synchronized with Main Terminal. Detections normalized across GPU cluster.</p>
                     </div>
                     <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ ...HUD_STYLE, fontSize: 8, color: 'white', marginBottom: 12 }}>TRACKING_PARAMS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ fontSize: 9 }}>CONF_THRESHOLD</span>
                             <span style={{ fontSize: 9, color: C.primary }}>0.50</span>
                           </div>
                           <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                             <div style={{ position: 'absolute', top: -3, left: '50%', width: 8, height: 8, background: C.primary, borderRadius: '50%' }} />
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                             <span style={{ fontSize: 9 }}>IOU_THRESHOLD</span>
                             <span style={{ fontSize: 9, color: C.primary }}>0.45</span>
                           </div>
                           <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                             <div style={{ position: 'absolute', top: -3, left: '45%', width: 8, height: 8, background: C.primary, borderRadius: '50%' }} />
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                             <span style={{ fontSize: 9 }}>MOTION_STABILITY</span>
                             <span style={{ fontSize: 9, color: C.success }}>HIGH</span>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : null}
             </div>

             <div style={{ padding: 16 }}>
                <button style={{ width: '100%', background: 'transparent', border: `1px solid ${C.primary}`, color: C.primary, padding: '10px', borderRadius: 2, ...HUD_STYLE, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                   INITIALIZE_FULL_AUDIT
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoAnalysis;
