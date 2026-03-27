import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const C = {
  primary: '#00f2ff',
  secondary: '#7000ff',
  accent: '#ff0055',
  success: '#00ff9d',
  warning: '#ffcc00',
  bg950: '#020204',
};

const S = {
  panel: {
    background: 'rgba(10,10,15,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 4,
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  hud: {
    fontFamily: '"JetBrains Mono","Courier New",monospace',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch video history from server
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/video', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Map backend Video format to uploadedFiles format
          setUploadedFiles(data.map(v => ({
            id: v._id,
            name: v.originalFilename,
            type: v.originalFilename.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
            size: 0,
            uploadedAt: new Date(v.createdAt),
            url: v.processedVideoUrl,
            analysis: v.metrics ? { ...v.metrics, objects_detected: v.metrics.objects_detected || 0 } : null,
            status: v.status
          })));
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    if (user?.token) {
      fetchVideos();
    }
    return () => clearInterval(timer);
  }, [user]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('video', file);

        const response = await fetch('/api/video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          },
          body: formData,
        });

        if (response.ok) {
           const result = await response.json();
           setUploadedFiles(prev => [
             {
               id: result._id,
               name: result.originalFilename,
               type: 'video/mp4',
               size: 0,
               uploadedAt: new Date(),
               status: 'pending'
             },
             ...prev
           ]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const AnalysisModal = ({ file, onClose }) => {
    if (!file) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ ...S.panel, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'white', cursor: 'pointer', ...S.hud, fontSize: 14 }}>[X]</button>
          
          <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ ...S.hud, fontSize: 14, color: 'white', margin: 0 }}>ANALYSIS_REPORT: {file.name}</h2>
            <div style={{ ...S.hud, fontSize: 8, color: C.primary, marginTop: 4 }}>ID: {file.id} | PROTOCOL: V-SHIELD_v2.1</div>
          </div>

          <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            <div style={{ background: '#000', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {(file.status === 'completed' && (file.analysis?.corrected_frame || file.url)) ? (
                 <img src={file.analysis?.corrected_frame || file.url} alt="Analyzed" style={{ maxWidth: '100%', height: 'auto' }} />
               ) : (
                 <div style={{ padding: 40, textAlign: 'center' }}>
                   <div style={{ ...S.hud, color: C.warning }}>PROCESS_PENDING</div>
                 </div>
               )}
               <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 2, ...S.hud, fontSize: 8, color: C.success }}>CORRECTION_ACTIVE</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ ...S.hud, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>IMAGE_METRICS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                     <div>
                        <div style={{ ...S.hud, fontSize: 12, color: 'white' }}>{file.analysis?.psnr || 'N/A'}</div>
                        <div style={{ ...S.hud, fontSize: 7, color: C.primary }}>PSNR (dB)</div>
                     </div>
                     <div>
                        <div style={{ ...S.hud, fontSize: 12, color: 'white' }}>{file.analysis?.ssim || 'N/A'}</div>
                        <div style={{ ...S.hud, fontSize: 7, color: C.success }}>SSIM_INDEX</div>
                     </div>
                  </div>
               </div>

               <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ ...S.hud, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>OBJECT_DETECTION</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'white', ...S.hud }}>{file.analysis?.objects_detected || 0} ITEMS</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Confidence Avg: 94.2%</div>
               </div>

               <div style={{ flex: 1, padding: 16, background: 'rgba(0,242,255,0.02)', borderRadius: 4, border: '1px solid rgba(0,242,255,0.05)', overflowY: 'auto' }}>
                  <div style={{ ...S.hud, fontSize: 8, color: C.primary, marginBottom: 10 }}>SYSTEM_LOGS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                     <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>[11:04:22] FILE_LOAD_SUCCESS</div>
                     <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>[11:04:23] TURBULENCE_FILTER_APPLIED</div>
                     <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>[11:04:24] OBJECT_REID_COMPLETE</div>
                     <div style={{ fontSize: 8, color: C.success }}>[11:04:25] REPORT_GENERATED</div>
                  </div>
               </div>
            </div>
          </div>
          
          <div style={{ padding: 16, textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <button onClick={onClose} style={{ background: C.primary, color: 'black', border: 'none', padding: '8px 24px', borderRadius: 2, ...S.hud, fontWeight: 900, cursor: 'pointer' }}>CLOSE_REPORT</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg950, color: '#a0aec0', overflow: 'hidden' }}>
      <Sidebar activePage="dashboard" />
      {selectedFile && <AnalysisModal file={selectedFile} onClose={() => setSelectedFile(null)} />}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.success }} />
              <span style={{ ...S.hud, fontSize: 9, color: C.success }}>SYSTEM OPERATIONAL</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.08)' }}>|</span>
            <span style={{ ...S.hud, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...S.hud, fontSize: 10, color: 'white', fontWeight: 900 }}>{user?.name || 'ADMIN.ROOT'}</div>
              <div style={{ ...S.hud, fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>{user?.email || 'SYSTEM_OPERATOR'}</div>
            </div>
            <div style={{ 
              width: 32, height: 32, borderRadius: 4, 
              background: user?.picture ? `url(${user.picture})` : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 10, color: 'white'
            }}>
              {!user?.picture && (user?.name?.[0] || 'A')}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ ...S.hud, fontSize: 24, color: 'white', margin: 0, fontWeight: 900 }}>V-SHIELD SURVEILLANCE</h1>
            <p style={{ ...S.hud, fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0' }}>
              Real-Time Turbulence Correction & Object Tracking
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div style={{ ...S.panel, padding: '20px' }}>
              <div style={{ ...S.hud, fontSize: 12, color: 'white', marginBottom: 12, fontWeight: 900 }}>SYSTEM STATUS</div>
              <div style={{ ...S.hud, fontSize: 16, color: C.success, marginBottom: 12, fontWeight: 900 }}>OPERATIONAL</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>All systems running normally</div>
            </div>

            <div style={{ ...S.panel, padding: '20px' }}>
              <div style={{ ...S.hud, fontSize: 12, color: 'white', marginBottom: 12, fontWeight: 900 }}>AI PROCESSING</div>
              <div style={{ ...S.hud, fontSize: 14, color: C.primary, marginBottom: 8, fontWeight: 900 }}>PSNR: 38.4 dB</div>
              <div style={{ ...S.hud, fontSize: 14, color: C.success, fontWeight: 900 }}>SSIM: 0.947</div>
            </div>

            <div style={{ ...S.panel, padding: '20px' }}>
              <div style={{ ...S.hud, fontSize: 12, color: 'white', marginBottom: 12, fontWeight: 900 }}>OBJECT TRACKING</div>
              <div style={{ ...S.hud, fontSize: 14, color: C.warning, marginBottom: 8, fontWeight: 900 }}>LIVE FEEDS</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Analyzing 3 active entities</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, marginBottom: 32 }}>
            <div style={{ ...S.panel, padding: '20px' }}>
              <h3 style={{ ...S.hud, fontSize: 14, color: 'white', marginBottom: 16, fontWeight: 900 }}>UPLOAD FILES</h3>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isUploading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontFamily: '"JetBrains Mono",monospace',
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1,
                  boxShadow: `0 0 15px ${C.primary}33`
                }}
              >
                {isUploading ? 'UPLOADING' : 'SELECT FILES'}
              </button>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>FEATURES:</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>✓ Turbulence Correction</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>✓ Object Detection</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>✓ Motion Tracking</div>
              </div>
            </div>

            <div style={{ ...S.panel, padding: '20px' }}>
              <h3 style={{ ...S.hud, fontSize: 14, color: 'white', marginBottom: 16, fontWeight: 900 }}>ANALYZED FILES ({uploadedFiles.length})</h3>

              {uploadedFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: 12 }}>NO FILES UPLOADED</div>
                  <div style={{ fontSize: 10, marginTop: 8 }}>Upload to analyze</div>
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      onClick={() => setSelectedFile(file)}
                      style={{ 
                        padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s',
                        ':hover': { background: 'rgba(255,255,255,0.05)' }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <div style={{ ...S.hud, fontSize: 11, color: 'white', fontWeight: 900 }}>{file.name}</div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{file.status.toUpperCase()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontSize: 9, color: file.status === 'completed' ? C.success : C.warning }}>{file.status === 'completed' ? 'RESULT_READY' : 'PROCESSING'}</div>
                           <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{file.uploadedAt.toLocaleDateString()}</div>
                        </div>
                      </div>
                      {file.analysis && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 9 }}>
                          <div>PSNR: <span style={{ color: C.primary }}>{file.analysis.psnr}</span></div>
                          <div>SSIM: <span style={{ color: C.success }}>{file.analysis.ssim}</span></div>
                          <div>OBJECTS: <span style={{ color: C.warning }}>{file.analysis.objects_detected}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ ...S.panel, padding: '20px' }}>
              <h3 style={{ ...S.hud, fontSize: 14, color: 'white', marginBottom: 16, fontWeight: 900 }}>SYSTEM ACTIVITY</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, borderLeft: `3px solid ${C.success}` }}>
                  <div style={{ ...S.hud, fontSize: 11, color: 'white', fontWeight: 900 }}>System Boot</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>All services initialized</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, borderLeft: `3px solid ${C.primary}` }}>
                  <div style={{ ...S.hud, fontSize: 11, color: 'white', fontWeight: 900 }}>AI Model Update</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Turbulence model v2.1 deployed</div>
                </div>
              </div>
            </div>

            <div style={{ ...S.panel, padding: '20px' }}>
              <h3 style={{ ...S.hud, fontSize: 14, color: 'white', marginBottom: 16, fontWeight: 900 }}>SECURITY PROTOCOLS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                  <span style={{ ...S.hud, fontSize: 9, color: 'white' }}>Encryption_Key</span>
                  <span style={{ ...S.hud, fontSize: 9, color: C.success }}>AES-256V2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                  <span style={{ ...S.hud, fontSize: 9, color: 'white' }}>Two-Step Verification</span>
                  <span style={{ ...S.hud, fontSize: 9, color: user?.is2FAEnabled ? C.success : C.accent }}>{user?.is2FAEnabled ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                  <span style={{ ...S.hud, fontSize: 9, color: 'white' }}>Secure_Login_V2</span>
                  <span style={{ ...S.hud, fontSize: 9, color: C.primary }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
