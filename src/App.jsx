import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import useChromecast from './useChromecast';

const App = () => {
  const streamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const videoRef = useRef(null);
  const { isCastAvailable, isCasting, toggleCast } = useChromecast(streamUrl);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);

  return (
    <div>
      <h1>Reproductor con Chromecast</h1>
      <video ref={videoRef} controls style={{ width: '100%', maxWidth: '640px' }}></video>
      {isCastAvailable && (
        <button 
          onClick={toggleCast} 
          style={{ marginTop: '10px' }}
        >
          {isCasting ? 'Stop Casting' : 'Start Casting'}
        </button>
      )}
    </div>
  );
};

export default App;
