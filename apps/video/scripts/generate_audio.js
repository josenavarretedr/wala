import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 45 seconds at 44100 Hz, stereo (2 channels), 16-bit
const sampleRate = 44100;
const numChannels = 2;
const durationSeconds = 45;
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

// Transition timestamps in seconds
const cuts = [0, 5.0, 12.5, 20.0, 32.5, 45.0];

// Musical parameters: BPM 115 (approx 1.916 beats per second)
const bpm = 115;
const beatDuration = 60 / bpm;

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // 1. Kick & Hi-hat rhythm
  const beatTime = t % beatDuration;
  const barTime = t % (beatDuration * 4);
  const beatIndex = Math.floor(t / beatDuration);

  // Kick on beats 0 and 2 of the 4-beat bar
  let kick = 0;
  if ((beatIndex % 4 === 0 || beatIndex % 4 === 2) && beatTime < 0.15) {
    const kickFreq = 120 * Math.exp(-beatTime * 30);
    kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * Math.exp(-beatTime * 20) * 0.4;
  }

  // Soft Hi-hat on every 8th note
  let hihat = 0;
  const eighthTime = t % (beatDuration / 2);
  if (eighthTime < 0.04) {
    const noise = (Math.random() * 2 - 1) * Math.exp(-eighthTime * 80);
    hihat = noise * 0.08;
  }

  // 2. Warm Synth Chords (Ferretería modern fintech progression: Dm - F - C - G)
  const chordProg = [
    [293.66, 349.23, 440.0], // Dm
    [349.23, 440.0, 523.25], // F
    [261.63, 329.63, 392.0], // C
    [196.0, 246.94, 293.66],  // G
  ];
  const chordIndex = Math.floor((t / (beatDuration * 4)) % 4);
  const currentChord = chordProg[chordIndex];

  let chord = 0;
  for (const freq of currentChord) {
    // Soft sine chord with vibrato
    const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 5 * t);
    chord += Math.sin(2 * Math.PI * freq * vibrato * t) * 0.035;
  }

  // 3. Transition Sound Effects at each scene cut point!
  let cutFx = 0;
  for (const cut of cuts) {
    const dt = t - cut;
    if (dt >= 0 && dt < 0.5) {
      // Whoosh sweep + bright bell chime
      const sweepFreq = 600 + (1 - dt / 0.5) * 800;
      const chimeFreq = 1760; // A6 chime
      const sweep = Math.sin(2 * Math.PI * sweepFreq * dt) * (1 - dt / 0.5) * 0.15;
      const chime = Math.sin(2 * Math.PI * chimeFreq * dt) * Math.exp(-dt * 8) * 0.2;
      cutFx += sweep + chime;
    }
  }

  // 4. Subtle sidechain / ducking around the cuts
  let ducking = 1.0;
  for (const cut of cuts) {
    const dt = t - cut;
    if (dt >= -0.1 && dt <= 0.15) {
      ducking = 0.4; // dip music at the exact cut
    }
  }

  // Master sum
  let mono = (kick + hihat + chord) * ducking + cutFx;

  // Gentle fade out at the very end (last 1.5s)
  if (t > 43.5) {
    mono *= (45 - t) / 1.5;
  }

  // Clamp and write 16-bit stereo PCM
  const sample16 = Math.max(-32767, Math.min(32767, Math.floor(mono * 32767)));
  const offset = 44 + i * 4;
  buffer.writeInt16LE(sample16, offset); // Left
  buffer.writeInt16LE(sample16, offset + 2); // Right
}

const outputPath = path.resolve(__dirname, "../public/ferreteria_soundtrack.wav");
fs.writeFileSync(outputPath, buffer);
console.log(`Audio soundtrack generated successfully at: ${outputPath}`);
