/**
 * Audio Engine for retro DOS sound effects
 */
class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.mainGain = null;
    this.processInterval = null;
  }

  /**
   * Initialize audio context
   */
  init() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.mainGain = this.audioCtx.createGain();
        this.mainGain.connect(this.audioCtx.destination);
      } catch (e) {
        console.warn('AudioContext not available:', e.message);
        return false;
      }
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return true;
  }

  /**
   * Play retro click sound
   */
  playRetroClickSound() {
    if (!this.init()) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        250,
        this.audioCtx.currentTime + 0.02
      );

      noteGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 0.02
      );

      osc.connect(noteGain);
      noteGain.connect(this.mainGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.02);
    } catch (e) {
      console.warn('Error playing click sound:', e.message);
    }
  }

  /**
   * Play typewriter sound
   */
  playTypewriterSound() {
    if (!this.init()) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'square';
      const freq = 1800 + Math.random() * 400;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      noteGain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 0.015
      );

      osc.connect(noteGain);
      noteGain.connect(this.mainGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.015);
    } catch (e) {
      console.warn('Error playing typewriter sound:', e.message);
    }
  }

  /**
   * Play error beep sound
   */
  playErrorBeepSound() {
    if (!this.init()) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);

      noteGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 0.25
      );

      osc.connect(noteGain);
      noteGain.connect(this.mainGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Error playing error beep:', e.message);
    }
  }

  /**
   * Start floppy disk sound (processing loop)
   */
  startFloppyDiskSound() {
    if (!this.init()) return;

    try {
      this.stopFloppyDiskSound();
      this.processInterval = setInterval(() => {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        const freq = 120 + Math.random() * 80;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        noteGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioCtx.currentTime + 0.03
        );

        osc.connect(noteGain);
        noteGain.connect(this.mainGain);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.03);
      }, 60);
    } catch (e) {
      console.warn('Error playing floppy disk sound:', e.message);
    }
  }

  /**
   * Stop floppy disk sound
   */
  stopFloppyDiskSound() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }

  /**
   * Play status beep (success or error)
   * @param {boolean} isSuccess - Whether to play success or error sound
   */
  playStatusBeep(isSuccess = true) {
    if (!this.init()) return;

    try {
      this.stopFloppyDiskSound();

      if (!isSuccess) {
        this.playErrorBeepSound();
        return;
      }

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        1200,
        this.audioCtx.currentTime + 0.15
      );

      noteGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 0.15
      );

      osc.connect(noteGain);
      noteGain.connect(this.mainGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Error playing status beep:', e.message);
    }
  }
}

// Export singleton instance
export default new AudioEngine();
