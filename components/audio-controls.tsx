"use client";

import { useAudio } from "@/components/audio-provider";

export function AudioControls() {
  const { state, setState } = useAudio();
  const progress = state.duration ? Math.min((state.currentTime / state.duration) * 100, 100) : 0;

  function toggleAudio() {
    setState((current) => ({ ...current, isPlaying: !current.isPlaying, autoplayBlocked: false }));
  }

  return (
    <div
      className="audio-strip reveal-on-scroll reveal-delay-2"
      data-audio-control
      aria-label="Controle da música"
    >
      <div className="audio-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="audio-row audio-row-single">
        <button
          className="audio-main-button"
          type="button"
          aria-label={state.isPlaying ? "Pausar música" : "Tocar música"}
          aria-pressed={state.isPlaying}
          onClick={toggleAudio}
        >
          {state.isPlaying ? "Ⅱ" : "▶"}
        </button>
      </div>
      <span className="audio-title">{state.title}</span>
    </div>
  );
}
