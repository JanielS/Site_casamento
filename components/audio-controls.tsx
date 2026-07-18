"use client";

import { useMemo } from "react";
import { useAudio } from "@/components/audio-provider";

export function AudioControls() {
  const { audioRef, state, setState } = useAudio();

  const progress = useMemo(() => {
    if (!state.duration) return 0;
    return Math.min((state.currentTime / state.duration) * 100, 100);
  }, [state.currentTime, state.duration]);

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {
        setState((current) => ({ ...current, autoplayBlocked: true, isPlaying: false }));
      });
    } else {
      audio.pause();
    }
  }

  return (
    <div className="audio-strip reveal-on-scroll reveal-delay-2" aria-label="Controle da música">
      <span className="audio-cta">Clique aqui</span>
      <div className="audio-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="audio-row audio-row-single">
        <button
          className="audio-main-button"
          type="button"
          aria-label={state.isPlaying ? "Pausar música" : "Tocar música"}
          onClick={toggleAudio}
        >
          {state.isPlaying ? "Ⅱ" : "▶"}
        </button>
      </div>
      <span className="audio-title">{state.title}</span>
    </div>
  );
}
