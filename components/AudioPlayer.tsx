import React, { useRef, useEffect, useState } from 'react';

// Add global declaration for YouTube API
declare global {
    interface Window {
        onYouTubeIframeAPIReady?: () => void;
        YT?: any;
    }
}

interface AudioPlayerProps {
  play: boolean;
  volume: number;
}

const YOUTUBE_VIDEO_ID = 'rUxyKA_-grg'; // "you're in love - lofi hip hop mix" (Allows embedding)

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ play, volume }) => {
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    const createPlayer = () => {
      // Ensure we don't create more than one player
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1, // Autoplay the video
          controls: 0,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID, // Required for single video looping
          playsinline: 1,
          mute: 1, // Must be muted to autoplay reliably
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
          },
          // In case of any error, log it.
          onError: (event: any) => {
            console.error('YouTube Player Error Code:', event.data);
          }
        },
      });
    };
    
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      const scriptTag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!scriptTag) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }

    return () => {
      if (playerRef.current) {
        // The destroy method is sometimes flaky, wrap in try/catch
        try {
            playerRef.current.destroy();
        } catch (e) {
            console.error("Error destroying YouTube player", e);
        }
      }
      if (window.onYouTubeIframeAPIReady === createPlayer) {
          delete window.onYouTubeIframeAPIReady;
      }
    };
  }, []);

  useEffect(() => {
    if (playerReady && playerRef.current) {
      // Control volume and mute state based on props
      playerRef.current.setVolume(volume * 100);
      if (play) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
  }, [play, volume, playerReady]);

  return <div id="youtube-player-container" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }} />;
};

export default AudioPlayer;