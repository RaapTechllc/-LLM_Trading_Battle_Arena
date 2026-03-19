// Simple sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    // Initialize on first user interaction to comply with browser policies
    if (typeof window !== 'undefined') {
      document.addEventListener('click', this.initAudio.bind(this), { once: true });
    }
  }

  private initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      // Audio not supported
      this.enabled = false;
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      // Audio playback failed
      this.enabled = false;
    }
  }

  // Design System Sounds

  click() {
    this.playTone(800, 0.05, 'sine');
  }

  hover() {
    this.playTone(600, 0.03, 'sine');
  }

  tradeWin() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'sine'), i * 100);
    });
  }

  tradeLoss() {
    const notes = [329.63, 293.66, 261.63]; // E4, D4, C4
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sawtooth'), i * 150);
    });
  }

  legendaryReveal() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'triangle', 0.15), i * 80);
    });
    // Ka-ching effect
    setTimeout(() => {
      this.playTone(1500, 0.1, 'sine', 0.2);
      setTimeout(() => this.playTone(1800, 0.3, 'sine', 0.1), 50);
    }, 600);
  }

  battleStart() {
    const notes = [261.63, 392.00, 523.25]; // C4, G4, C5
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.1, 'square'), i * 100);
    });
  }

  victory() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'sine'), i * 80);
    });
  }

  defeat() {
    const notes = [392.00, 349.23, 329.63, 293.66, 261.63]; // G4 to C4
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.25, 'sawtooth'), i * 150);
    });
  }

  // Legacy/Compatibility methods
  cardCreated() { this.tradeWin(); }
  rareReveal() { this.tradeWin(); }
  cardSelect() { this.click(); }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
