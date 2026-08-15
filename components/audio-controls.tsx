"use client";

import { useAudio } from "@/components/audio-provider";

export function AudioControls() {
  const { state, setState } = useAudio();
  const progress = state.duration ? Math.min((state.currentTime / state.duration) * 100, 100) : 0;

  function toggleAudio() {
    setState((current) => ({ ...current, isPlaying: !current.isPlaying, autoplayBlocked: false }));
  }

  return (
    <div className="audio-strip reveal-on-scroll reveal-delay-2" aria-label="Controle da música">
      <span className="audio-cta">Aumente o som</span>
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
      {state.autoplayBlocked ? (
        <button className="audio-unblock" type="button" onClick={toggleAudio}>
          Toque para viver esta experiência com música
        </button>
      ) : null}
    </div>
  );
}
