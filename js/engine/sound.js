// 사운드 엔진 (Web Audio API)
// 레트로 칩튠 효과음 + 스테이지별 BGM

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
        this.bgmPlaying = false;
        this.bgmGain = null;
        this.bgmInterval = null;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.value = 0.08;
            this.bgmGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 단일 톤 재생
    playTone(freq, duration, type, volume, ramp) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type || 'square';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(volume || 0.12, this.ctx.currentTime);
            if (ramp !== false) {
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            }
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { /* 무시 */ }
    }

    // 주파수 스윕 재생
    playSweep(startFreq, endFreq, duration, type, volume) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type || 'square';
            osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
            gain.gain.setValueAtTime(volume || 0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { /* 무시 */ }
    }

    // --- 효과음 ---
    dodge() {
        // 니어미스 회피 사운드
        this.playTone(880, 0.06, 'square', 0.08);
        setTimeout(() => this.playTone(1100, 0.06, 'square', 0.06), 60);
    }

    hit() {
        // 피격 사운드
        this.playSweep(400, 100, 0.2, 'sawtooth', 0.12);
        setTimeout(() => this.playTone(80, 0.15, 'square', 0.1), 100);
    }

    skillActivate() {
        // 스킬 발동
        this.playTone(523, 0.08, 'square', 0.1);
        setTimeout(() => this.playTone(659, 0.08, 'square', 0.1), 80);
        setTimeout(() => this.playTone(784, 0.12, 'square', 0.08), 160);
    }

    bongguBark() {
        // 봉구 짖는 소리
        this.playTone(300, 0.08, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(400, 0.1, 'sawtooth', 0.08), 100);
        setTimeout(() => this.playTone(350, 0.12, 'sawtooth', 0.06), 200);
    }

    angelAppear() {
        // 천사 등장
        this.playTone(1047, 0.1, 'sine', 0.06);
        setTimeout(() => this.playTone(1319, 0.1, 'sine', 0.05), 100);
        setTimeout(() => this.playTone(1568, 0.15, 'sine', 0.04), 200);
    }

    starGet() {
        // 별 획득
        this.playTone(880, 0.08, 'square', 0.1);
        setTimeout(() => this.playTone(1100, 0.08, 'square', 0.08), 80);
        setTimeout(() => this.playTone(1320, 0.1, 'square', 0.08), 160);
        setTimeout(() => this.playTone(1760, 0.15, 'sine', 0.06), 240);
    }

    stageStart() {
        this.playSweep(330, 660, 0.25, 'square', 0.1);
    }

    stageClear() {
        this.stopBGM();
        if (!this.enabled || !this.ctx) return;
        const notes = [523, 587, 659, 784, 659, 784, 1047];
        let time = 0;
        for (const note of notes) {
            setTimeout(() => this.playTone(note, 0.2, 'square', 0.12), time);
            time += 120;
        }
    }

    gameOver() {
        this.stopBGM();
        if (!this.enabled || !this.ctx) return;
        setTimeout(() => this.playTone(440, 0.15, 'square', 0.15), 0);
        setTimeout(() => this.playTone(330, 0.15, 'square', 0.13), 150);
        setTimeout(() => this.playTone(220, 0.15, 'square', 0.11), 300);
        setTimeout(() => this.playTone(110, 0.4, 'sawtooth', 0.1), 450);
    }

    buttonClick() {
        this.playTone(660, 0.07, 'square', 0.1);
        setTimeout(() => this.playTone(880, 0.09, 'square', 0.08), 70);
    }

    // --- BGM ---
    playBGM(stageIndex) {
        if (!this.enabled || !this.ctx || this.bgmPlaying) return;
        this.bgmPlaying = true;
        this.resume();

        const C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494;
        const C5=523, D5=587, E5=659, F5=698, G5=784, A5=880;

        const bgmData = this._getBGMData(stageIndex || 0, C4,D4,E4,F4,G4,A4,B4,C5,D5,E5,F5,G5,A5);
        const melody = bgmData.melody;
        const bass = bgmData.bass;
        const noteDuration = bgmData.noteDuration;

        let noteIndex = 0;

        const playNext = () => {
            if (!this.bgmPlaying || !this.enabled) return;
            try {
                const t = this.ctx.currentTime;
                // 멜로디
                const osc1 = this.ctx.createOscillator();
                const g1 = this.ctx.createGain();
                osc1.type = 'square';
                osc1.frequency.setValueAtTime(melody[noteIndex % melody.length], t);
                g1.gain.setValueAtTime(0.06, t);
                g1.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 0.9);
                osc1.connect(g1);
                g1.connect(this.bgmGain);
                osc1.start(t);
                osc1.stop(t + noteDuration);

                // 베이스
                const osc2 = this.ctx.createOscillator();
                const g2 = this.ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(bass[noteIndex % bass.length] / 2, t);
                g2.gain.setValueAtTime(0.05, t);
                g2.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 0.9);
                osc2.connect(g2);
                g2.connect(this.bgmGain);
                osc2.start(t);
                osc2.stop(t + noteDuration);

                noteIndex++;
            } catch (e) { /* 무시 */ }
        };

        this.bgmInterval = setInterval(playNext, noteDuration * 1000);
        playNext();
    }

    _getBGMData(stageIndex, C4,D4,E4,F4,G4,A4,B4,C5,D5,E5,F5,G5,A5) {
        // 스테이지를 2개씩 그룹핑
        const group = Math.floor(stageIndex / 2);
        switch (group) {
            case 0: // 1-2: C메이저 느긋한 교실
                return {
                    noteDuration: 0.22,
                    melody: [
                        C5, E5, G5, E5, C5, D5, E5, C5,
                        G4, A4, B4, C5, D5, C5, B4, A4,
                        C5, E5, G5, E5, D5, E5, C5, G4,
                        A4, B4, C5, D5, E5, D5, C5, C5,
                    ],
                    bass: [
                        C4, C4, G4, G4, F4, F4, C4, C4,
                        E4, E4, G4, G4, A4, A4, G4, G4,
                        C4, C4, G4, G4, F4, F4, C4, C4,
                        A4, A4, G4, G4, C4, C4, C4, C4,
                    ],
                };
            case 1: // 3-4: 마이너 긴장감
                return {
                    noteDuration: 0.18,
                    melody: [
                        A4, C5, E5, C5, A4, B4, C5, A4,
                        E4, F4, G4, A4, B4, A4, G4, F4,
                        A4, C5, E5, C5, B4, C5, A4, E4,
                        F4, G4, A4, B4, C5, B4, A4, A4,
                    ],
                    bass: [
                        A4, A4, E4, E4, D4, D4, A4, A4,
                        C4, C4, E4, E4, F4, F4, E4, E4,
                        A4, A4, E4, E4, D4, D4, A4, A4,
                        F4, F4, E4, E4, A4, A4, A4, A4,
                    ],
                };
            case 2: // 5-6: 액션
                return {
                    noteDuration: 0.15,
                    melody: [
                        E5, G5, A5, G5, E5, D5, E5, G5,
                        C5, D5, E5, G5, A5, G5, E5, D5,
                        G5, E5, D5, C5, D5, E5, G5, A5,
                        E5, D5, C5, D5, E5, G5, E5, C5,
                    ],
                    bass: [
                        C4, C4, E4, E4, G4, G4, C4, C4,
                        A4, A4, G4, G4, F4, F4, E4, E4,
                        C4, C4, E4, E4, G4, G4, A4, A4,
                        F4, F4, G4, G4, C4, C4, C4, C4,
                    ],
                };
            case 3: // 7-8: 격렬
                return {
                    noteDuration: 0.12,
                    melody: [
                        G5, A5, G5, E5, G5, A5, G5, E5,
                        D5, E5, G5, A5, G5, E5, D5, C5,
                        E5, G5, A5, G5, E5, D5, E5, G5,
                        A5, G5, E5, D5, C5, D5, E5, E5,
                    ],
                    bass: [
                        C4, E4, G4, C4, E4, G4, A4, G4,
                        F4, G4, A4, G4, F4, E4, D4, C4,
                        C4, E4, G4, C4, E4, G4, A4, G4,
                        F4, E4, D4, C4, G4, G4, C4, C4,
                    ],
                };
            case 4: // 9-10: 광란
            default:
                return {
                    noteDuration: 0.10,
                    melody: [
                        A5, G5, E5, G5, A5, G5, E5, D5,
                        E5, G5, A5, G5, E5, D5, C5, D5,
                        E5, G5, A5, G5, A5, G5, E5, D5,
                        C5, D5, E5, D5, C5, B4, A4, A4,
                    ],
                    bass: [
                        A4, A4, E4, E4, A4, A4, G4, G4,
                        F4, F4, E4, E4, D4, D4, C4, C4,
                        A4, A4, E4, E4, A4, A4, G4, G4,
                        F4, F4, E4, E4, A4, A4, A4, A4,
                    ],
                };
        }
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.stopBGM();
        return this.enabled;
    }
}

const Sound = new SoundEngine();
