"use client";

import { useEffect, useRef } from "react";

export function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastProgressRef = useRef(0);
  const lastRecoverRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      video.play().catch(() => undefined);
    };

    const noteProgress = () => {
      lastProgressRef.current = video.currentTime;
    };

    const recoverPlayback = () => {
      const now = Date.now();
      if (now - lastRecoverRef.current < 2500) return;
      lastRecoverRef.current = now;

      if (video.paused || video.ended) {
        playVideo();
        return;
      }

      const stalledFor = Math.abs(video.currentTime - lastProgressRef.current) < 0.01;
      if (!stalledFor) {
        noteProgress();
        return;
      }

      if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        video.load();
      }

      playVideo();
    };

    playVideo();
    noteProgress();
    video.addEventListener("loadedmetadata", noteProgress);
    video.addEventListener("loadeddata", noteProgress);
    video.addEventListener("canplay", noteProgress);
    video.addEventListener("playing", noteProgress);
    video.addEventListener("timeupdate", noteProgress);
    video.addEventListener("waiting", recoverPlayback);
    video.addEventListener("stalled", recoverPlayback);
    video.addEventListener("suspend", recoverPlayback);
    window.addEventListener("pointerdown", playVideo, { once: true });
    window.addEventListener("touchstart", playVideo, { once: true, passive: true });
    window.addEventListener("scroll", playVideo, { once: true, passive: true });

    const watchdog = window.setInterval(recoverPlayback, 4000);

    return () => {
      window.clearInterval(watchdog);
      video.removeEventListener("loadedmetadata", noteProgress);
      video.removeEventListener("loadeddata", noteProgress);
      video.removeEventListener("canplay", noteProgress);
      video.removeEventListener("playing", noteProgress);
      video.removeEventListener("timeupdate", noteProgress);
      video.removeEventListener("waiting", recoverPlayback);
      video.removeEventListener("stalled", recoverPlayback);
      video.removeEventListener("suspend", recoverPlayback);
      window.removeEventListener("pointerdown", playVideo);
      window.removeEventListener("touchstart", playVideo);
      window.removeEventListener("scroll", playVideo);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
