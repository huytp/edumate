// Web Audio API Synthesizer & Web Speech API - Female Teacher Voice Manager

export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  displayName: string;
  isRecommended: boolean;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private speechEnabled: boolean = true;
  private speechRate: number = 0.70; // Tốc độ đọc chậm rãi, ngọt ngào, chuẩn cho học sinh Lớp 1 (0.68 - 0.72)
  private speechPitch: number = 1.0; // Cao độ tự nhiên để giữ đúng thanh điệu tiếng Việt
  private preferredVoiceURI: string = '';
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoices();
      };
    }
  }

  public refreshVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices() || [];
    }
    return this.cachedVoices;
  }

  public setEnabled(
    sound: boolean,
    speech: boolean,
    rate: number = 0.70,
    pitch: number = 1.0,
    voiceURI: string = ''
  ) {
    this.isEnabled = sound;
    this.speechEnabled = speech;
    this.speechRate = rate > 0 ? rate : 0.70;
    this.speechPitch = pitch > 0 ? pitch : 1.0;
    this.preferredVoiceURI = voiceURI || '';
  }

  public setPreferredVoice(voiceURI: string) {
    this.preferredVoiceURI = voiceURI;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate > 0 ? rate : 0.70;
  }

  public setSpeechPitch(pitch: number) {
    this.speechPitch = pitch > 0 ? pitch : 1.0;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Ticking sound for wheel or countdown
  public playTick() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignore audio errors
    }
  }

  // Positive bell chime / Correct answer
  public playSuccess() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Fanfare / Big Reward / Wheel Stop
  public playFanfare() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const chord = [
        { f: 523.25, t: 0, d: 0.15 },
        { f: 659.25, t: 0.12, d: 0.15 },
        { f: 783.99, t: 0.24, d: 0.2 },
        { f: 1046.5, t: 0.42, d: 0.5 },
      ];
      chord.forEach(({ f, t, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + t);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + d);
      });
    } catch {
      // Ignore
    }
  }

  // Applause crowd synthesis using noise buffer
  public playApplause() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.8));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 1.5);
    } catch {
      // Ignore
    }
  }

  // Point add / star sound
  public playCoin() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {
      // Ignore
    }
  }

  /**
   * Strictly determines if a voice belongs to a male persona.
   * Catches male voices across Windows (An, NamMinh, David, Mark), Chrome, macOS and Android.
   */
  public isMaleVoice(voice: SpeechSynthesisVoice): boolean {
    const rawName = `${voice.name} ${voice.voiceURI}`.toLowerCase();

    // Remove country/language labels that contain "nam" (Viet Nam / Vietnam)
    const sanitized = rawName
      .replace(/vietnam/g, '')
      .replace(/việt nam/g, '')
      .replace(/viet nam/g, '');

    // Windows built-in Vietnamese voice "Microsoft An" is male
    if (/\bmicrosoft an\b/.test(sanitized)) return true;

    const maleTokens = [
      'namminh',
      'nam minh',
      'nam-minh',
      'giọng nam',
      'david',
      'mark',
      'george',
      'daniel',
      'alex',
      'fred',
      'male',
      'guy',
      'google us english', // Chrome desktop "Google US English" is a male voice
    ];

    return maleTokens.some((token) => sanitized.includes(token));
  }

  // Only standard Vietnamese (vi-VN) voices are used
  private isVietnameseVoice(voice: SpeechSynthesisVoice): boolean {
    return voice.lang.toLowerCase().replace('_', '-').startsWith('vi');
  }

  // Known Vietnamese female voices: Edge/Windows HoaiMy, Chrome "Google Tiếng Việt", macOS/iOS Linh
  private isConfirmedVietnameseFemale(voice: SpeechSynthesisVoice): boolean {
    const n = voice.name.toLowerCase();
    return ['hoaimy', 'hoài my', 'hoai my', 'google tiếng việt', 'google tieng viet', 'linh', 'female', 'giọng nữ'].some(
      (kw) => n.includes(kw)
    );
  }

  private getVietnameseFemaleVoices(): SpeechSynthesisVoice[] {
    const voices = this.refreshVoices().filter(
      (v) => this.isVietnameseVoice(v) && !this.isMaleVoice(v)
    );
    // Confirmed female voices first, natural (online) voices before local ones
    const rank = (v: SpeechSynthesisVoice) =>
      (this.isConfirmedVietnameseFemale(v) ? 0 : 2) + (/natural|online/i.test(v.name) ? 0 : 1);
    return voices.sort((a, b) => rank(a) - rank(b));
  }

  // Known English female voices: Edge/Windows Jenny, Aria, Zira; Chrome UK Female; macOS/iOS Samantha, Victoria, Karen
  private isConfirmedEnglishFemale(voice: SpeechSynthesisVoice): boolean {
    const n = voice.name.toLowerCase();
    return ['jenny', 'aria', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'ava', 'female'].some((kw) =>
      n.includes(kw)
    );
  }

  // English female voices only, used for short praises and English words in games
  private findEnglishFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this.refreshVoices().filter(
      (v) => v.lang.toLowerCase().replace('_', '-').startsWith('en') && !this.isMaleVoice(v)
    );
    const rank = (v: SpeechSynthesisVoice) =>
      (this.isConfirmedEnglishFemale(v) ? 0 : 4) +
      (v.lang.toLowerCase().replace('_', '-') === 'en-us' ? 0 : 2) +
      (/natural|online/i.test(v.name) ? 0 : 1);
    return voices.sort((a, b) => rank(a) - rank(b))[0] ?? null;
  }

  /**
   * Vietnamese female voices installed on the device, for the selection UI
   */
  public getAvailableFemaleVoices(): VoiceOption[] {
    return this.getVietnameseFemaleVoices().map((v) => {
      const lower = v.name.toLowerCase();
      let displayName = `🇻🇳 ${v.name} (Giọng nữ tiếng Việt)`;
      if (lower.includes('hoaimy') || lower.includes('hoài my') || lower.includes('hoai my')) {
        displayName = `🌸 Cô giáo Hoài My (Giọng nữ miền Bắc chuẩn - khuyên dùng)`;
      } else if (lower.includes('google')) {
        displayName = `🇻🇳 Google Tiếng Việt (Giọng nữ chuẩn)`;
      } else if (lower.includes('linh')) {
        displayName = `🍎 Linh (Giọng nữ tiếng Việt)`;
      }
      return {
        voiceURI: v.voiceURI,
        name: v.name,
        lang: v.lang,
        displayName,
        isRecommended: this.isConfirmedVietnameseFemale(v),
      };
    });
  }

  /**
   * Find a standard Vietnamese female voice.
   * Never returns a male voice or a voice of another language.
   */
  private findFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVietnameseFemaleVoices();
    if (this.preferredVoiceURI) {
      const preferred = voices.find((v) => v.voiceURI === this.preferredVoiceURI);
      if (preferred) return preferred;
    }
    return voices[0] ?? null;
  }

  /**
   * Web Speech API Voice Reading — always a female voice of the requested language
   * (vi-VN by default, en-US for English praises/words), slow and calm for Grade 1 pupils.
   * Natural pitch keeps Vietnamese tones accurate.
   * If the device has no female voice for that language, nothing is spoken (never a male voice).
   */
  public speak(
    text: string,
    lang: 'vi-VN' | 'en-US' = 'vi-VN',
    customPitch?: number,
    customRate?: number
  ) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      const femaleVoice = lang === 'en-US' ? this.findEnglishFemaleVoice() : this.findFemaleVoice();
      if (!femaleVoice) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.voice = femaleVoice;

      // Pacing: default 0.70 (slow, calm, clear for grade 1)
      const targetRate = customRate ?? this.speechRate ?? 0.70;
      utterance.rate = Math.min(Math.max(targetRate, 0.5), 0.95);

      // Pitch kept close to natural so Vietnamese tones (sắc, huyền, hỏi, ngã, nặng) stay correct
      const targetPitch = customPitch ?? this.speechPitch ?? 1.0;
      utterance.pitch = Math.min(Math.max(targetPitch, 0.95), 1.1);

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech error
    }
  }

  // Stop any speech in progress
  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Slow, clear reading tailored specifically for Grade 1 elementary pupils
  public speakSlowly(text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN') {
    this.speak(text, lang, undefined, 0.70);
  }

  // Read full question and its multiple-choice options with natural teacher pauses
  public speakQuestionAndOptions(prompt: string, options: string[], lang: 'vi-VN' | 'en-US' = 'vi-VN') {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const optionTexts = options
      .map((opt, i) => `Đáp án ${letters[i] || i + 1}: ${opt}.`)
      .join(' ... ');
    const fullText = `Cô xin đọc câu hỏi: ${prompt}. ... ${optionTexts}`;
    this.speakSlowly(fullText, lang);
  }

  private speakRandom(lines: string[], lang: 'vi-VN' | 'en-US' = 'vi-VN') {
    this.speak(lines[Math.floor(Math.random() * lines.length)], lang, undefined, 0.72);
  }

  // Short, clear English praises for Grade 1 pupils
  public speakEnglishPraise() {
    this.speakRandom(['Good job!', 'Well done!', 'Wonderful!', 'Great job!', 'Super star!', 'Excellent!'], 'en-US');
  }

  // Short, caring English encouragements for Grade 1 pupils
  public speakEnglishEncouragement() {
    this.speakRandom(['Keep going!', "Don't worry!", 'Nice try!', 'Try again!', 'You can do it!'], 'en-US');
  }

  // Short, joyful English game-finish celebration
  public speakEnglishCelebration() {
    this.speakRandom(
      [
        'Wonderful! Good job everyone!',
        'Well done! You did it!',
        'Super star! Great job!',
        'Congratulations! Good job!',
      ],
      'en-US'
    );
  }
}

export const soundManager = new SoundManager();
