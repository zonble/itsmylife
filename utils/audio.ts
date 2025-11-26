
// Singleton AudioContext
let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playJumpSound = () => {
  const ctx = initAudio();
  const t = ctx.currentTime;

  // 1. The "Huff" / Effort sound (Filtered Noise)
  const bufferSize = ctx.sampleRate * 0.3; // 300ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(800, t);
  noiseFilter.frequency.linearRampToValueAtTime(300, t + 0.2); // Filter closes down

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  noise.start();

  // 2. Subtle "Spring/Movement" sound (Oscillator slide)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.linearRampToValueAtTime(200, t + 0.15); // Pitch up slightly
  
  oscGain.gain.setValueAtTime(0.05, t); // Very quiet
  oscGain.gain.linearRampToValueAtTime(0, t + 0.15);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  
  osc.start();
  osc.stop(t + 0.2);
};

export const playPantSound = () => {
  const ctx = initAudio();
  const t = ctx.currentTime;
  
  // Only play if audio context is running
  if (ctx.state !== 'running') return;

  // 1. Breathy Exhale (Pink Noise-ish)
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02; // Simple pinking filter
    lastOut = data[i];
    data[i] *= 3.5; // Compensate for gain loss
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 800;
  noiseFilter.Q.value = 1;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.05, t); // Low volume
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start();

  // 2. Groan (Low Sawtooth)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'sawtooth';
  // Pitch drops slightly (tiredness)
  osc.frequency.setValueAtTime(150, t); 
  osc.frequency.linearRampToValueAtTime(100, t + 0.3);

  oscGain.gain.setValueAtTime(0.08, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  
  // Lowpass to muffle the harsh saw wave
  const oscFilter = ctx.createBiquadFilter();
  oscFilter.type = 'lowpass';
  oscFilter.frequency.value = 300;

  osc.connect(oscFilter);
  oscFilter.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start();
  osc.stop(t + 0.4);
};
// Helper for pink noise state
let lastOut = 0;

export const playPropSound = (type: 'BIRD' | 'BUG' | 'PAPER' | 'ROACH') => {
  const ctx = initAudio();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  switch (type) {
    case 'BIRD':
      // High pitch chirp
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(1000, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(2500, t + 0.2);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.start();
      osc.stop(t + 0.3);
      break;

    case 'BUG':
    case 'ROACH':
      // Squish sound (Noise burst + Low pitch slide)
      {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();
      }
      break;

    case 'PAPER':
      // Rustle (Filtered noise)
      {
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        noiseGain.gain.setValueAtTime(0.3, t);
        noiseGain.gain.linearRampToValueAtTime(0, t + 0.2);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();
      }
      break;
  }
};
