import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize, Settings, FileVideo, ShieldAlert } from 'lucide-react';

const VideoPlayer = ({ videoData }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const src = videoData?.processedVideoUrl ? `${videoData.processedVideoUrl}?t=${new Date(videoData.updatedAt || Date.now()).getTime()}` : null;
  const metrics = videoData?.metrics;
  const detections = videoData?.trackingLogs?.[0]?.trackingData || [];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const C = { 
    primary: '#00f2ff', 
    accent: '#ff0055',
    success: '#00ff9d'
  };

  const hudStyle = {
    fontFamily: '"JetBrains Mono",monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: 9
  };

  return (
    <div style={{ background: '#06060a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Info */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileVideo size={14} color={C.primary} />
            <span style={{ ...hudStyle, color: 'white', fontWeight: 900 }}>{videoData?.originalFilename || 'SELECT_STREAM'}</span>
            {videoData?.status === 'completed' && <span style={{ ...hudStyle, color: C.success, fontSize: 7 }}>[ ANALYZED ]</span>}
         </div>
         <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,0.3)' }}>
            <Settings size={14} /><Maximize size={14} />
         </div>
      </div>

      {/* Primary Visualizer */}
      <div style={{ flex: 1, position: 'relative', background: 'black', overflow: 'hidden' }} className="scanlines">
        {src ? (
          <>
            <video 
              ref={videoRef}
              src={src} 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            
            {/* Object Detection Overlays (Simulated for First Frame if needed, or based on time) */}
            {detections.length > 0 && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {detections.map((d, i) => {
                  const [x1, y1, x2, y2] = d.bbox || [0,0,0,0];
                  // If we had real coordinates, we'd map them here. 
                  // Since we are using mock data in backend, we'll demonstrate them using the relative positions stored.
                  return (
                    <div key={i} style={{ 
                      position: 'absolute', 
                      left: `${(x1 / 720) * 100}%`, top: `${(y1 / 480) * 100}%`,
                      width: `${((x2 - x1) / 720) * 100}%`, height: `${((y2 - y1) / 480) * 100}%`,
                      border: `2px solid ${d.label === 'VEHICLE' ? C.primary : d.label === 'PERSON' ? C.accent : C.success}`,
                      boxShadow: `0 0 15px ${C.primary}33`,
                    }}>
                      <div style={{ 
                        position: 'absolute', top: -18, left: -2, background: d.label === 'VEHICLE' ? C.primary : d.label === 'PERSON' ? C.accent : C.success,
                        color: 'black', padding: '2px 6px', ...hudStyle, fontSize: 8, fontWeight: 900, whiteSpace: 'nowrap'
                      }}>
                        {d.label}_{d.id} {Math.floor(d.confidence * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
             <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,242,255,0.05)', border: '1px solid rgba(0,242,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={32} color={C.primary} opacity={0.3} />
             </div>
             <div style={{ ...hudStyle, color: 'rgba(255,255,255,0.2)' }}>WAITING_FOR_UPLINK</div>
          </div>
        )}

        {/* Live Indicator Overlay */}
        {src && <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 2 }}>
           <span className="status-dot status-active" />
           <span style={{ ...hudStyle, color: 'white' }}>UPLINK_LIVE</span>
        </div>}
      </div>

      {/* Controls Bar */}
      <div style={{ background: 'rgba(0,0,0,0.85)', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ height: 3, width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 16, position: 'relative', cursor: 'pointer' }}>
           <div style={{ height: '100%', width: `${(currentTime / duration) * 100 || 0}%`, background: C.primary }} />
           <div style={{ position: 'absolute', top: -4, left: `${(currentTime / duration) * 100 || 0}%`, width: 10, height: 10, borderRadius: '50%', background: 'white', boxShadow: `0 0 10px ${C.primary}` }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', items: 'center', gap: 24 }}>
              <button 
                onClick={togglePlay}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
              <button 
                onClick={() => { if(videoRef.current) videoRef.current.currentTime = 0; }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <RotateCcw size={16} />
              </button>
              <div style={{ ...hudStyle, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
              </div>
           </div>

           {metrics && (
             <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ ...hudStyle }}>PSNR: <span style={{ color: C.primary }}>{metrics.psnr || 'N/A'} dB</span></div>
                <div style={{ ...hudStyle }}>SSIM: <span style={{ color: C.primary }}>{metrics.ssim || 'N/A'}</span></div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
