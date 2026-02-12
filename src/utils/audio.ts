/**
 * 音效引擎 (Web Audio API)
 *
 * 負責合成轉盤的所有音效，無需外部音檔。
 * - tick(): 模擬棘輪撞擊聲 (短促噪音 + 高頻)
 * - win(): 勝利音效 (C Major Arpeggio + Delay)
 * - click(): 按鈕點擊聲
 * - scratch(): 刮刮樂沙沙聲
 * - crank(): 扭蛋轉動聲
 * - thunk(): 扭蛋掉落聲
 * - pop(): 扭蛋打開聲
 * - shuffle(): 洗牌聲
 * - flip(): 翻牌聲
 * - shake(): 搖籤聲
 */
class AudioEngine {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;
    private scratchBuffer: AudioBuffer | null = null;

    constructor() {
        // 現代瀏覽器 AudioContext 建構
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
            this.initScratchBuffer();
        }
    }

    /** 初始化 AudioContext (需在使用者互動後呼叫) */
    public init() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
        if (this.ctx && !muted && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public getMuted(): boolean {
        return this.isMuted;
    }

    private initScratchBuffer() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.2; // 0.2s duration
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        this.scratchBuffer = buffer;
    }

    /** 播放刮刮樂音效 (建議 throttle 呼叫) */
    public scratch() {
        if (!this.ctx || this.isMuted || !this.scratchBuffer) return;

        const t = this.ctx.currentTime;
        const source = this.ctx.createBufferSource();
        source.buffer = this.scratchBuffer;

        // 隨機變調，模擬不規則刮擦聲
        source.playbackRate.value = 0.8 + Math.random() * 0.4;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, t); // 降低音量
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start(t);
    }

    /** 播放棘輪聲 (Tick) */
    public tick() {
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // 短促的高頻脈衝
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        // 音量包絡：瞬間爆發後迅速衰減
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    /** 扭蛋轉動聲 (Crank) */
    public crank() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // 模擬齒輪轉動：連續 3 個卡嗒聲
        for (let i = 0; i < 3; i++) {
            const time = t + i * 0.15;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(100, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        }
    }

    /** 扭蛋掉落聲 (Thunk) */
    public thunk() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    /** 扭蛋打開聲 (Pop) */
    public pop() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.1);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    /** 洗牌音效 */
    public shuffle() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // 快速連續的噪音，模擬紙張摩擦
        const count = 8;
        for (let i = 0; i < count; i++) {
            const time = t + i * 0.08;
            const bufferSize = this.ctx.sampleRate * 0.05;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * 0.5;
            }

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            // Lowpass filter to soften the noise
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            source.start(time);
        }
    }

    /** 翻牌音效 */
    public flip() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
            data[j] = (Math.random() * 2 - 1) * 0.3;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(1000, t + 0.1);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start(t);
    }

    /** 搖籤聲 (木頭撞擊) */
    public shake() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // 模擬多根籤棒撞擊
        const count = 3;
        for (let i = 0; i < count; i++) {
            const time = t + Math.random() * 0.1;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Wood block sound: short sine/triangle with quick decay
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300 + Math.random() * 200, time);

            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.05);
        }
    }

    /** 播放勝利音效 (Win) */
    public win() {
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5 (C Major)

        notes.forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            // 琶音效果：每個音錯開 0.1s
            const startTime = t + i * 0.1;
            const duration = 0.8;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    /** 播放點擊聲 */
    public click() {
        if (!this.ctx || this.isMuted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
    }
}

export const audio = new AudioEngine();
