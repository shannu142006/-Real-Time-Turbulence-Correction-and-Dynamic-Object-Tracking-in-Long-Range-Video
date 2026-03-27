import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  Play, Download, Trash, RefreshCw, 
  Search, Filter, MoreVertical,
  ChevronDown, Calendar, FileVideo,
  X
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

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
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
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    try {
      const response = await fetch(`/api/video/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        setHistory(prev => prev.filter(v => v._id !== id));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredHistory = history.filter(item => 
    item.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#020204', color: '#a0aec0', overflow: 'hidden' }}>
      <Sidebar activePage="/history" />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calendar size={16} color={C.primary} />
            <h1 style={{ ...HUD_STYLE, fontSize: 13, fontWeight: 900, color: 'white', margin: 0 }}>PROCESSING.LOG</h1>
          </div>
          <button onClick={fetchHistory} style={{ 
            background: 'none', border: '1px solid rgba(0,242,255,0.2)', color: C.primary, 
            padding: '6px 12px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, 
            ...HUD_STYLE, fontSize: 10, cursor: 'pointer' 
          }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> SYNC_DATABASE
          </button>
        </header>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {/* Sub Header / Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="FILTER_BY_FILENAME..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: 4, padding: '10px 12px 10px 36px', color: 'white', ...HUD_STYLE, fontSize: 10, outline: 'none'
                }} 
              />
            </div>
            <button style={{ background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0 16px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, ...HUD_STYLE, fontSize: 10, cursor: 'pointer' }}>
              <Filter size={14} /> FILTER_OPTIONS <ChevronDown size={14} />
            </button>
          </div>

          {/* History Grid/List */}
          <div style={{ background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
            {/* Table Header */}
            <div style={{ display: 'flex', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', ...HUD_STYLE, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ flex: 2 }}>MEDIA_IDENTIFIER</div>
              <div style={{ flex: 1 }}>STATUS</div>
              <div style={{ flex: 1 }}>ANALYSIS_METRICS</div>
              <div style={{ flex: 1 }}>TIMESTAMP</div>
              <div style={{ width: 120 }}>ACTIONS</div>
            </div>

            {/* List Content */}
            {filteredHistory.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                <FileVideo size={48} style={{ marginBottom: 16 }} />
                <div style={{ ...HUD_STYLE, fontSize: 12 }}>NO_RECORDS_FOUND</div>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="history-row">
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: 'rgba(0,242,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,242,255,0.1)' }}>
                      <Play size={14} color={C.primary} fill={C.primary} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: 'white', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.originalFilename}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', ...HUD_STYLE }}>MP4_FORMAT</div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: item.status === 'completed' ? 'rgba(0,255,157,0.05)' : 'rgba(255,204,0,0.05)', border: `1px solid ${item.status === 'completed' ? 'rgba(0,255,157,0.2)' : 'rgba(255,204,0,0.2)'}`, color: item.status === 'completed' ? C.success : C.warning, ...HUD_STYLE, fontSize: 9 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: item.status === 'completed' ? C.success : C.warning }} />
                      {item.status}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    {item.metrics ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>PSNR:</span> <span style={{ color: C.primary, fontSize: 10, fontWeight: 700 }}>{item.metrics.psnr}</span></div>
                        <div><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>OBJ:</span> <span style={{ color: C.warning, fontSize: 10, fontWeight: 700 }}>{item.metrics.objects_detected || 0}</span></div>
                      </div>
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>PENDING_METRICS</div>
                    )}
                  </div>

                  <div style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.4)', ...HUD_STYLE }}>
                    {new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>

                  <div style={{ width: 120, display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => setSelectedVideo(item)}
                      style={{ background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.3)', color: C.primary, padding: '6px 12px', borderRadius: 4, fontSize: 9, ...HUD_STYLE, fontWeight: 900, cursor: 'pointer' }}
                    >
                      REPLAY
                    </button>
                    <button 
                      onClick={() => deleteVideo(item._id)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,0,85,0.2)', color: C.accent, padding: '6px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Replay */}
        {selectedVideo && (
           <div style={{ position: 'fixed', inset: 0, zHeight: 1000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: '100%', maxWidth: 1000, background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: 8, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>
                   <X size={20} />
                </button>
                <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ ...HUD_STYLE, fontSize: 13, color: 'white' }}>PLAYBACK.STREAM // {selectedVideo.originalFilename}</div>
                   <button 
                    onClick={() => window.open(selectedVideo.processedVideoUrl, '_blank')}
                    style={{ background: C.primary, color: 'black', border: 'none', padding: '6px 16px', borderRadius: 4, ...HUD_STYLE, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                     <Download size={12} style={{ marginRight: 8 }} /> DOWNLOAD_RAW
                   </button>
                </div>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'black' }}>
                   <video 
                    controls 
                    autoPlay 
                    style={{ width: '100%', height: '100%' }}
                    src={selectedVideo.processedVideoUrl}
                   />
                </div>
              </div>
           </div>
        )}
      </main>
      <style>{`
        .history-row:hover { background: rgba(255,255,255,0.02) !important; }
      `}</style>
    </div>
  );
}
