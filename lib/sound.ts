"use client";

let ctx: AudioContext | null = null;

function tone(freq: number, duration = 0.08, type: OscillatorType = "sine", delay = 0, gain = 0.06) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  x: () => tone(660, 0.07, "triangle"),
  o: () => tone(440, 0.07, "triangle"),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "square", i * 0.1, 0.04)),
  draw: () => [392, 330].forEach((f, i) => tone(f, 0.2, "sine", i * 0.15)),
};
