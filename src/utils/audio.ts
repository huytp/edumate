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
  private speechPitch: number = 1.30; // Cao độ trong trẻo, êm dịu của cô giáo
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
    pitch: number = 1.30,
    voiceURI: string = ''
  ) {
    this.isEnabled = sound;
    this.speechEnabled = speech;
    this.speechRate = rate > 0 ? rate : 0.70;
    this.speechPitch = pitch > 0 ? pitch : 1.30;
    this.preferredVoiceURI = voiceURI || '';
  }

  public setPreferredVoice(voiceURI: string) {
    this.preferredVoiceURI = voiceURI;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = rate > 0 ? rate : 0.70;
  }

  public setSpeechPitch(pitch: number) {
    this.speechPitch = pitch > 0 ? pitch : 1.30;
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
   * Explicitly catches male voices across Windows (David, Mark, George, NamMinh),
   * Chrome (Google US English male, Android TTS male), macOS, and Linux.
   */
  public isMaleVoice(voice: SpeechSynthesisVoice): boolean {
    const rawName = `${voice.name} ${voice.voiceURI}`.toLowerCase();

    // Remove country/language labels that contain "nam" (Viet Nam / Vietnam)
    const sanitized = rawName
      .replace(/vietnam/g, '')
      .replace(/việt nam/g, '')
      .replace(/viet nam/g, '');

    // Common male voice names across Windows, MacOS, iOS, Android, and Chromium
    const maleTokens = [
      'namminh',
      'nam minh',
      'nam-minh',
      'david',
      'mark',
      'george',
      'richard',
      'daniel',
      'alex',
      'fred',
      'bruce',
      'junior',
      'ralph',
      'tom',
      'male',
      'man',
      'boy',
      'guy',
      'stefan',
      'paul',
      'james',
      'john',
      'oliver',
      'harry',
      'charles',
      'ravi',
      'cosmo',
      'eddy',
      'reed',
      'rocky',
      'grandpa',
      'sir',
      'mr.',
      'mr ',
      'father',
      'google us english', // In Chrome desktop, Google US English is a male voice
      'microsoft david',
      'microsoft mark',
      'microsoft george',
    ];

    for (const token of maleTokens) {
      if (sanitized.includes(token)) return true;
    }

    return false;
  }

  /**
   * Get list of verified female voices installed on user's device for selection UI
   */
  public getAvailableFemaleVoices(): VoiceOption[] {
    const allVoices = this.refreshVoices();
    if (!allVoices || allVoices.length === 0) return [];

    const femaleKeywords = [
      'hoaimy',
      'hoài my',
      'mai',
      'linh',
      'chi',
      'an',
      'lan',
      'huong',
      'thao',
      'ngoc',
      'trang',
      'nhi',
      'vy',
      'yen',
      'jenny',
      'aria',
      'samantha',
      'victoria',
      'zira',
      'karen',
      'hazel',
      'helena',
      'catherine',
      'ava',
      'tessa',
      'moira',
      'clara',
      'amy',
      'emily',
      'sarah',
      'linda',
      'alice',
      'sophia',
      'olivia',
      'emma',
      'siri',
      'female',
      'woman',
      'girl',
      'google tiếng việt',
      'google uk english female',
    ];

    const results: VoiceOption[] = [];

    for (const v of allVoices) {
      if (this.isMaleVoice(v)) continue;

      const lower = v.name.toLowerCase();
      const isConfirmedFemale = femaleKeywords.some((kw) => lower.includes(kw));

      let displayName = v.name;
      let isRecommended = false;

      if (lower.includes('hoaimy') || lower.includes('hoài my')) {
        displayName = `🌸 Cô giáo Hoài My (Việt Nam - Giọng nữ dịu dàng khuyên dùng)`;
        isRecommended = true;
      } else if (lower.includes('google tiếng việt')) {
        displayName = `🇻🇳 Google Tiếng Việt (Nữ nhẹ nhàng)`;
        isRecommended = true;
      } else if (lower.includes('jenny')) {
        displayName = `🇺🇸 Microsoft Jenny (Giọng nữ chuẩn)`;
        isRecommended = true;
      } else if (lower.includes('aria')) {
        displayName = `🇺🇸 Microsoft Aria (Giọng nữ trong trẻo)`;
        isRecommended = true;
      } else if (lower.includes('zira')) {
        displayName = `🇺🇸 Microsoft Zira (Nữ rõ ràng)`;
      } else if (lower.includes('samantha')) {
        displayName = `🍎 Samantha (Giọng nữ ấm áp)`;
      } else if (lower.includes('victoria')) {
        displayName = `🍎 Victoria (Giọng nữ nhẹ)`;
      } else if (lower.includes('google uk english female')) {
        displayName = `🇬🇧 Google UK English (Nữ Anh)`;
      } else if (isConfirmedFemale) {
        displayName = `👩‍🏫 ${v.name} (Giọng nữ)`;
      } else if (!this.isMaleVoice(v)) {
        displayName = `👩‍🏫 ${v.name} (Nữ)`;
      }

      results.push({
        voiceURI: v.voiceURI,
        name: v.name,
        lang: v.lang,
        displayName,
        isRecommended,
      });
    }

    // Sort recommended first
    return results.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }

  /**
   * Find a gentle, standard female voice for the specified language.
   * ABSOLUTE GUARANTEE: Never, under any circumstances, returns a male voice.
   */
  private findFemaleVoice(lang: string): SpeechSynthesisVoice | null {
    const allVoices = this.refreshVoices();

    if (!allVoices || allVoices.length === 0) return null;

    // 0. If user specifically selected a preferred voice and it is NOT male:
    if (this.preferredVoiceURI) {
      const preferred = allVoices.find(
        (v) => v.voiceURI === this.preferredVoiceURI && !this.isMaleVoice(v)
      );
      if (preferred) return preferred;
    }

    const langPrefix = lang.split('-')[0].toLowerCase();
    const langVoices = allVoices.filter((v) =>
      v.lang.toLowerCase().startsWith(langPrefix)
    );

    // Known female names & keywords across all major TTS engines
    const femaleKeywords = [
      'hoaimy',
      'hoài my',
      'mai',
      'linh',
      'chi',
      'an',
      'lan',
      'huong',
      'thao',
      'ngoc',
      'trang',
      'nhi',
      'vy',
      'yen',
      'google tiếng việt',
      'jenny',
      'aria',
      'samantha',
      'victoria',
      'zira',
      'karen',
      'hazel',
      'helena',
      'catherine',
      'ava',
      'tessa',
      'moira',
      'clara',
      'amy',
      'emily',
      'google uk english female',
      'siri',
      'female',
      'woman',
      'girl',
    ];

    // Priority 1: High-end Vietnamese female voices (Hoài My, Google tiếng Việt, Linh, Mai, Chi)
    if (langPrefix === 'vi') {
      const hoaimy = langVoices.find(
        (v) =>
          !this.isMaleVoice(v) &&
          (v.name.toLowerCase().includes('hoaimy') || v.name.toLowerCase().includes('hoài my'))
      );
      if (hoaimy) return hoaimy;

      const gVi = langVoices.find(
        (v) => !this.isMaleVoice(v) && v.name.toLowerCase().includes('tiếng việt')
      );
      if (gVi) return gVi;
    }

    // Priority 2: Safe female voice in requested language
    const safeLangVoices = langVoices.filter((v) => !this.isMaleVoice(v));

    if (safeLangVoices.length > 0) {
      // Look for confirmed female keyword
      const confirmedFemale = safeLangVoices.find((v) => {
        const n = v.name.toLowerCase();
        return femaleKeywords.some((kw) => n.includes(kw));
      });
      if (confirmedFemale) return confirmedFemale;

      // Safe non-male voice in this language
      return safeLangVoices[0];
    }

    // Priority 3: If no voice in this language is female, find ANY verified female voice across the entire OS:
    const anyConfirmedFemale = allVoices.find(
      (v) =>
        !this.isMaleVoice(v) &&
        femaleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (anyConfirmedFemale) {
      return anyConfirmedFemale;
    }

    // Priority 4: Any non-male voice across system
    const anyNonMale = allVoices.find((v) => !this.isMaleVoice(v));
    if (anyNonMale) {
      return anyNonMale;
    }

    return null;
  }

  /**
   * Web Speech API Voice Reading:
   * Enforces soft, sweet, gentle female tone (pitch: 1.30, rate: 0.70)
   * Slow, calm, articulate pacing specifically for Grade 1 elementary pupils.
   * Completely excludes any male voice or rushed tempo.
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      // Pacing strictly controlled: default 0.70 (slow, calm, clear for grade 1)
      const targetRate = customRate ?? this.speechRate ?? 0.70;
      utterance.rate = Math.min(Math.max(targetRate, 0.5), 0.95);

      // Pitch strictly controlled: elevated to soft, feminine teacher tone
      const targetPitch = customPitch ?? this.speechPitch ?? 1.30;
      utterance.pitch = Math.min(Math.max(targetPitch, 1.15), 1.6);

      // Select strictly gentle female voice
      const femaleVoice = this.findFemaleVoice(lang);
      if (femaleVoice && !this.isMaleVoice(femaleVoice)) {
        utterance.voice = femaleVoice;
      }

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

  // Slow, clear reading tailored specifically for Grade 1 elementary pupils (rate 0.70, pitch 1.30)
  public speakSlowly(text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN') {
    this.speak(text, lang, 1.30, 0.70);
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

  /**
   * Short, clear, energetic English praises for Grade 1 pupils
   * Examples: Good job, Well done, Wonderful, Great job, Super star
   */
  public speakEnglishPraise() {
    const praiseLines = [
      'Good job!',
      'Well done!',
      'Wonderful!',
      'Great job!',
      'Super star!',
      'Excellent!',
    ];
    const picked = praiseLines[Math.floor(Math.random() * praiseLines.length)];
    // Standard English pronunciation, slow, crisp, sweet female voice
    this.speak(picked, 'en-US', 1.30, 0.72);
  }

  /**
   * Short, caring English encouragements for Grade 1 pupils
   * Examples: Keep going, Don't worry, Nice try, Try again, You can do it
   */
  public speakEnglishEncouragement() {
    const encourageLines = [
      'Keep going!',
      "Don't worry!",
      'Nice try!',
      'Try again!',
      'You can do it!',
    ];
    const picked = encourageLines[Math.floor(Math.random() * encourageLines.length)];
    // Standard English pronunciation, warm, gentle and slow
    this.speak(picked, 'en-US', 1.28, 0.70);
  }

  /**
   * Short, joyful English game finish celebration for Grade 1 pupils
   */
  public speakEnglishCelebration() {
    const celebrations = [
      'Wonderful! Good job everyone!',
      'Well done! You did it!',
      'Super star! Great job!',
      'Congratulations! Good job!',
    ];
    const picked = celebrations[Math.floor(Math.random() * celebrations.length)];
    this.speak(picked, 'en-US', 1.30, 0.72);
  }
}

export const soundManager = new SoundManager();
