// @ts-ignore
import { sfxr } from 'jsfxr';

let audioCtx: AudioContext | null = null;
let isMuted = false;

const newTableSoundParams = {
  "oldParams": true,
  "wave_type": 1,
  "p_env_attack": 0,
  "p_env_sustain": 0.10920079515000228,
  "p_env_punch": 0,
  "p_env_decay": 0.1459391439156795,
  "p_base_freq": 0.5901754818977897,
  "p_freq_limit": 0,
  "p_freq_ramp": -0.004443135187568746,
  "p_freq_dramp": -0.027904947112140855,
  "p_vib_strength": 0.02737917330309185,
  "p_vib_speed": 0,
  "p_arp_mod": 0,
  "p_arp_speed": -0.03770585632123544,
  "p_duty": 0.9765739981675536,
  "p_duty_ramp": 0,
  "p_repeat_speed": -0.02743793640177744,
  "p_pha_offset": -0.035850540772705344,
  "p_pha_ramp": -0.0011529670459636474,
  "p_lpf_freq": 1,
  "p_lpf_ramp": 0,
  "p_lpf_resonance": 0,
  "p_hpf_freq": 0.16691859254494024,
  "p_hpf_ramp": 0.010525770810095786,
  "sound_vol": 0.75,
  "sample_rate": 44100,
  "sample_size": 8
};

let cachedNewTableBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  if (!audioCtx) {
    // Standard web audio context with fallback
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setMute = (mute: boolean) => {
  isMuted = mute;
  if (mute) {
    stopBgm();
    if (audioCtx) {
      audioCtx.close().then(() => {
        audioCtx = null;
      });
    }
  }
};

export const getMuteStatus = () => isMuted;

// Play a sweet cash register 'ka-ching' sound (two notes rising quickly)
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // First note (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.45, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second note (B5) starting slightly later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.6, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.warn('Failed to play success sound:', e);
  }
}

// Play a standard double error buzzer sound (low-pitched square waves)
export function playFailureSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // First buzz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    gain1.gain.setValueAtTime(0.45, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second buzz
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(110, now + 0.18);
    gain2.gain.setValueAtTime(0.45, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn('Failed to play failure sound:', e);
  }
}

// Play a short clicky sound for keypad buttons
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    console.warn('Failed to play click sound:', e);
  }
}

// Play a nice tavern wooden block sound for screen change or start
export function playWoodBlockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    console.warn('Failed to play wood block sound:', e);
  }
}

// Play a game over chime (descending low sad notes)
export function playGameOverSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const freqs = [330, 294, 262, 220]; // E4, D4, C4, A3
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + index * 0.15;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.36, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    console.warn('Failed to play game over sound:', e);
  }
}

// Play custom sound effect when a new table/slip is added (using sfxr parameters)
export function playNewTableSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    let source: AudioBufferSourceNode;

    if (cachedNewTableBuffer) {
      source = ctx.createBufferSource();
      source.buffer = cachedNewTableBuffer;
    } else {
      // @ts-ignore
      source = sfxr.toWebAudio(newTableSoundParams, ctx);
      if (source && source.buffer) {
        cachedNewTableBuffer = source.buffer;
      }
    }

    if (!source) {
      // Fallback
      playWoodBlockSound();
      return;
    }

    // Connect to destination and play
    const gainNode = ctx.createGain();
    // Set sound volume matching sfxr settings or comfortable default
    gainNode.gain.setValueAtTime(0.75, ctx.currentTime);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    console.warn('Failed to play custom new table sound:', e);
    // Fallback to woodblock
    playWoodBlockSound();
  }
}

// ==========================================
// CHIPTUNE BGM SEQUENCER (Lively Tavern Scale)
// ==========================================

let isBgmPlaying = false;
let bgmStepTimer: any = null;
let currentBgmStep = 0;
let nextNoteTime = 0.0;

// Upbeat, cheerful traditional festival pentatonic melody in G major
const melodyPattern: (number | null)[] = [
  74, 76, 79, 76, 74, 71, 74, null, // D5, E5, G5, E5, D5, B4, D5, _
  71, 69, 67, 69, 71, null, 67, null, // B4, A4, G4, A4, B4, _, G4, _
  74, 76, 79, 76, 74, 76, 79, 81,     // D5, E5, G5, E5, D5, E5, G5, A5
  83, 81, 79, 76, 74, 71, 67, null    // B5, A5, G5, E5, D5, B4, G4, _
];

// Simple bouncy bassline matching the harmony
const bassPattern: (number | null)[] = [
  43, null, 43, null, 47, null, 47, null, // G2, G2, B2, B2
  45, null, 45, null, 43, null, 43, null, // A2, A2, G2, G2
  43, null, 43, null, 47, null, 47, null, // G2, G2, B2, B2
  45, null, 45, null, 55, null, null, null // A2, A2, G3
];

function playMelodyNote(midi: number, time: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle'; // Smooth, friendly flute-like chiptune note
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  osc.frequency.setValueAtTime(freq, time);
  
  // Very soft envelope to prevent clipping or dominance
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.024, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.25);
}

function playBassNote(midi: number, time: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine'; // Deep, clean, unobtrusive bass pluck
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  osc.frequency.setValueAtTime(freq, time);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.044, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.16);
}

function playKickTick(time: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, time);
  osc.frequency.exponentialRampToValueAtTime(30, time + 0.06);
  
  gain.gain.setValueAtTime(0.030, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.06);
}

function playSnareTick(time: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1800, time);
  osc.frequency.exponentialRampToValueAtTime(500, time + 0.04);
  
  gain.gain.setValueAtTime(0.008, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.04);
}

function scheduleNote(step: number, time: number, ctx: AudioContext) {
  // Play melody
  const melMidi = melodyPattern[step % melodyPattern.length];
  if (melMidi !== null) {
    playMelodyNote(melMidi, time, ctx);
  }

  // Play bass
  const bassMidi = bassPattern[step % bassPattern.length];
  if (bassMidi !== null) {
    playBassNote(bassMidi, time, ctx);
  }

  // Soft rhythm beats
  if (step % 4 === 2) {
    playSnareTick(time, ctx);
  } else if (step % 2 === 0) {
    playKickTick(time, ctx);
  }
}

export function startBgm() {
  const ctx = getAudioContext();
  if (!ctx || isBgmPlaying) return;
  
  isBgmPlaying = true;
  currentBgmStep = 0;
  nextNoteTime = ctx.currentTime + 0.1;
  
  function scheduler() {
    const context = getAudioContext();
    if (!context || !isBgmPlaying || isMuted) return;
    
    while (nextNoteTime < context.currentTime + 0.12) {
      scheduleNote(currentBgmStep, nextNoteTime, context);
      
      const tempo = 138.0; // Lively tempo
      const secondsPerBeat = 60.0 / tempo;
      const stepDuration = secondsPerBeat / 2; // Eighth notes
      
      nextNoteTime += stepDuration;
      currentBgmStep = (currentBgmStep + 1) % 32;
    }
  }
  
  scheduler();
  bgmStepTimer = setInterval(scheduler, 25);
}

export function stopBgm() {
  isBgmPlaying = false;
  if (bgmStepTimer) {
    clearInterval(bgmStepTimer);
    bgmStepTimer = null;
  }
}

export function toggleBgm() {
  if (isBgmPlaying) {
    stopBgm();
  } else {
    startBgm();
  }
  return isBgmPlaying;
}

export function isBgmActive() {
  return isBgmPlaying;
}


