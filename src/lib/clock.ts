"use client";

import { useSyncExternalStore } from "react";

let timestamp = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function updateClock() {
  timestamp = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribeToClock(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    updateClock();
    timer = setInterval(updateClock, 60_000);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getClockSnapshot(): number {
  return timestamp;
}

function getServerClockSnapshot(): number {
  return 0;
}

export function useStudyClock(): number {
  return useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
}
