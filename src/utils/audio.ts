/**
 * 音效引擎 (Web Audio API)
 *
 * 負責合成轉盤的所有音效，無需外部音檔。
 * - tick(): 模擬棘輪撞擊聲 (短促噪音 + 高頻)
 * - win(): 勝利音效 (C Major Arpeggio + Delay)
 * - click(): 按鈕點擊聲
 */
class AudioEngine {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        // 現代瀏覽器 AudioContext 建構
        const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
        }
    }

    /** 初始化 AudioContext (需在使用者互動後呼叫) */
    public init() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
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
