"use client";

import { useEffect, useRef } from "react";

export function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      video.play().catch(() => undefined);
    };

    playVideo();
    window.addEventListener("pointerdown", playVideo, { once: true });
    window.addEventListener("touchstart", playVideo, { once: true, passive: true });
    window.addEventListener("scroll", playVideo, { once: true, passive: true });

    return () => {
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
