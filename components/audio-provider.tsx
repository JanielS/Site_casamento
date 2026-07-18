"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import { CLIENT_AUDIO_STATE_KEY } from "@/lib/session";

type AudioState = {
  title: string;
  src: string;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  shouldAutoplay: boolean;
  autoplayBlocked: boolean;
};

type AudioContextValue = {
  state: AudioState;
  audioRef: RefObject<HTMLAudioElement | null>;
  setState: Dispatch<SetStateAction<AudioState>>;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({
  children,
  initialTrack
}: {
  children: ReactNode;
  initialTrack: { title: string; src: string };
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    title: initialTrack.title,
    src: initialTrack.src,
    isPlaying: true,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    shouldAutoplay: true,
    autoplayBlocked: false
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(CLIENT_AUDIO_STATE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<AudioState>;
      setState((current) => ({
        ...current,
        ...parsed,
        isPlaying: true,
        shouldAutoplay: true,
        autoplayBlocked: false,
        title: initialTrack.title,
        src: initialTrack.src
      }));
    } catch {
      window.localStorage.removeItem(CLIENT_AUDIO_STATE_KEY);
    }
  }, [initialTrack.src, initialTrack.title]);

  useEffect(() => {
    window.localStorage.setItem(
      CLIENT_AUDIO_STATE_KEY,
      JSON.stringify({
        volume: state.volume,
        currentTime: state.currentTime,
        src: state.src
      })
    );
  }, [state.currentTime, state.isPlaying, state.src, state.volume]);

  const value = useMemo(
    () => ({
      state,
      audioRef,
      setState
    }),
    [state]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
