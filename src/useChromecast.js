import { useState, useEffect, useCallback } from 'react';

const useChromecast = (streamUrl) => {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  const loadMedia = useCallback((session) => {
    if (session) {
      const mediaInfo = new window.chrome.cast.media.MediaInfo(streamUrl, 'application/x-mpegURL');
      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      session.loadMedia(request).then(
        () => {
          console.log('Media loaded successfully');
          setIsCasting(true);
        },
        (errorCode) => {
          console.error('Error loading media. Error code:', errorCode);
          setIsCasting(false);
        }
      );
    } else {
      console.error('No valid cast session available');
    }
  }, [streamUrl]);

  const handleSessionStateChange = useCallback((event) => {
    console.log('Session state changed:', event.sessionState);
    if (event.sessionState === window.cast.framework.SessionState.SESSION_STARTED) {
      loadMedia(event.session);
    } else if (event.sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
      setIsCasting(false);
    }
  }, [loadMedia]);

  const initializeCastApi = useCallback(() => {
    const context = window.cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    context.addEventListener(
      window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      handleSessionStateChange
    );

    setIsCastAvailable(true);
  }, [handleSessionStateChange]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    document.body.appendChild(script);

    window['__onGCastApiAvailable'] = function(isAvailable) {
      if (isAvailable) {
        initializeCastApi();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [initializeCastApi]);

  const toggleCast = async () => {
    const castContext = window.cast.framework.CastContext.getInstance();
    
    if (isCasting) {
      try {
        await castContext.endCurrentSession(true);
        console.log('Cast session ended');
        setIsCasting(false);
      } catch (error) {
        console.error('Error ending cast session:', error);
      }
    } else {
      try {
        await castContext.requestSession();
        console.log('Cast session requested');
        // The session will be handled by the SESSION_STATE_CHANGED event
      } catch (error) {
        console.error('Error requesting cast session:', error);
      }
    }
  };

  return {
    isCastAvailable,
    isCasting,
    toggleCast
  };
};

export default useChromecast;