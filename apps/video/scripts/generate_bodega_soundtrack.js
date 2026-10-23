import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 60 seconds at 44100 Hz, stereo (2 channels), 16-bit
const sampleRate = 44100;
const numChannels = 2;
const durationSeconds = 60;
const totalSamples = sampleRate * durationSeconds;
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;

const buffer = Buffer.alloc(44 + dataSize);

// Write WAV Header
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34); // BitsPerSample
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

// Transition timestamps according to the script:
// [0-5s] Gancho, [5-20s] Caso A/B, [20-45s] Valor directo, [45-55s] Micro-acción, [55-60s] CTA
const cuts = [0, 5.0, 20.0, 45.0, 55.0];

// Musical parameters: BPM 116 (clean modern rhythm)
const bpm = 116;
const beatDuration = 60 / bpm;

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // 1. Kick & Hi-hat rhythm
  const beatTime = t % beatDuration;
  const beatIndex = Math.floor(t / beatDuration);

  // Kick on beats 0 and 2
  let kick = 0;
  if ((beatIndex % 4 === 0 || beatIndex % 4 === 2) && beatTime < 0.15) {
    const kickFreq = 120 * Math.exp(-beatTime * 30);
    kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * Math.exp(-beatTime * 20) * 0.42;
  }

  // Snare/Clap on beats 1 and 3
  let snare = 0;
  if ((beatIndex % 4 === 1 || beatIndex % 4 === 3) && beatTime < 0.18) {
    const noise = (Math.random() * 2 - 1) * Math.exp(-beatTime * 45);
    snare = noise * 0.16;
  }

  // Soft Hi-hat on every 8th note
  let hihat = 0;
  const eighthTime = t % (beatDuration / 2);
  if (eighthTime < 0.04) {
    const noise = (Math.random() * 2 - 1) * Math.exp(-eighthTime * 80);
    hihat = noise * 0.08;
  }

  // 2. Warm Chords (Modern uplifting progression: Am - F - C - G)
  const chordProg = [
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63], // F
    [261.63, 329.63, 392.0], // C
    [196.0, 246.94, 293.66],  // G
  ];
  const chordIndex = Math.floor((t / (beatDuration * 4)) % 4);
  const currentChord = chordProg[chordIndex];

  let chord = 0;
  for (const freq of currentChord) {
    const vibrato = 1 + 0.002 * Math.sin(2 * Math.PI * 4 * t);
    chord += Math.sin(2 * Math.PI * freq * vibrato * t) * 0.038;
  }

  // 3. Transition Sound Effects at cut points
  let cutFx = 0;
  for (const cut of cuts) {
    const dt = t - cut;
    if (dt >= 0 && dt < 0.5) {
      const sweepFreq = 700 + (1 - dt / 0.5) * 800;
      const chimeFreq = 1760; // A6
      const sweep = Math.sin(2 * Math.PI * sweepFreq * dt) * (1 - dt / 0.5) * 0.14;
      const chime = Math.sin(2 * Math.PI * chimeFreq * dt) * Math.exp(-dt * 8) * 0.18;
      cutFx += sweep + chime;
    }
  }

  // 4. Subtle ducking around cuts
  let ducking = 1.0;
  for (const cut of cuts) {
    const dt = t - cut;
    if (dt >= -0.08 && dt <= 0.12) {
      ducking = 0.45;
    }
  }

  // Master sum
  let mono = (kick + snare + hihat + chord) * ducking + cutFx;

  // Fade out at end (last 1.8s)
  if (t > 58.2) {
    mono *= Math.max(0, (60 - t) / 1.8);
  }

  // Clamp and write 16-bit stereo PCM
  const sample16 = Math.max(-32767, Math.min(32767, Math.floor(mono * 32767)));
  const offset = 44 + i * 4;
  buffer.writeInt16LE(sample16, offset); // Left
  buffer.writeInt16LE(sample16, offset + 2); // Right
}

const outputPath = path.resolve(__dirname, "../public/bodega_soundtrack.wav");
fs.writeFileSync(outputPath, buffer);
console.log(`Bodega 60s soundtrack generated at: ${outputPath}`);
