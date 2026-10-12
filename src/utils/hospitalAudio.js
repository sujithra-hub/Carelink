// Hospital Audio Chime & Spoken Announcement Engine
class HospitalAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Two-tone harmonic hospital chime (D5 -> A5)
  playChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2: 880 Hz (A5) slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.28);
      gain2.gain.setValueAtTime(0.3, now + 0.28);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 1.0);
    } catch (e) {
      console.warn('Audio chime playback notice:', e.message);
    }
  }

  // Synthesize voice announcement using Web Speech API
  announceToken({ tokenCode, patientName, roomNumber }) {
    if (this.isMuted) return;
    this.playChime();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTimeout(() => {
        try {
          window.speechSynthesis.cancel(); // clear previous utterance
          const cleanedName = patientName ? patientName.split('(')[0].trim() : 'Patient';
          const spokenText = `Attention please. Token ${tokenCode}, ${cleanedName}, please proceed to ${roomNumber || 'Consultation Room 102'}.`;
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.rate = 0.92; // Slightly measured, clear tempo
          utterance.pitch = 1.05;
          utterance.lang = 'en-US';

          // Pick natural English voice if available
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('Speech synthesis notice:', err.message);
        }
      }, 700);
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const hospitalAudio = new HospitalAudioEngine();
