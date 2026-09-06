"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/components/audio-provider";

export function GlobalAudioPlayer() {
  const { audioRef, state, setState } = useAudio();
  const isPlayingRef = useRef(state.isPlaying);

  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
  }, [state.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncAudioState = () => {
      setState((current) => ({
        ...current,
        currentTime: audio.currentTime || 0,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0
      }));
    };

    const onEnded = () => {
      audio.currentTime = 0;
      if (!isPlayingRef.current) {
        setState((current) => ({ ...current, currentTime: 0 }));
        return;
      }

      audio.play().catch(() => {
        setState((current) => ({ ...current, isPlaying: false, autoplayBlocked: true }));
      });
    };

    const onPlay = () => {
      setState((current) => ({ ...current, isPlaying: true, autoplayBlocked: false }));
    };

    const onPause = () => {
      setState((current) => ({ ...current, isPlaying: false }));
    };

    audio.addEventListener("loadedmetadata", syncAudioState);
    audio.addEventListener("durationchange", syncAudioState);
    audio.addEventListener("timeupdate", syncAudioState);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    syncAudioState();

    return () => {
      audio.removeEventListener("loadedmetadata", syncAudioState);
      audio.removeEventListener("durationchange", syncAudioState);
      audio.removeEventListener("timeupdate", syncAudioState);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioRef, setState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let hasStartedFromInteraction = false;

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", startFromInteraction, true);
      window.removeEventListener("keydown", startFromInteraction, true);
    };

    const startFromInteraction = (event: Event) => {
      if (hasStartedFromInteraction) return;

      audio.play().then(() => {
        hasStartedFromInteraction = true;
        removeInteractionListeners();
        setState((current) => ({ ...current, isPlaying: true, autoplayBlocked: false }));
      }).catch(() => {
        setState((current) => ({ ...current, autoplayBlocked: true }));
      });
    };

    window.addEventListener("pointerdown", startFromInteraction, true);
    window.addEventListener("keydown", startFromInteraction, true);

    return removeInteractionListeners;
  }, [audioRef, setState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = state.volume;
    if (state.currentTime > 0 && Math.abs(audio.currentTime - state.currentTime) > 1) {
      audio.currentTime = state.currentTime;
    }
  }, [audioRef, state.currentTime, state.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.play().catch(() => {
        setState((current) => ({ ...current, autoplayBlocked: true, isPlaying: false }));
      });
      return;
    }

    if (!audio.paused) {
      audio.pause();
    }
  }, [audioRef, setState, state.isPlaying]);

  return <audio ref={audioRef} preload="auto" src={state.src} />;
}
