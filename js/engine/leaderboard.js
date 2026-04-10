// 리더보드 서비스
// 원격 API + localStorage 폴백

class LeaderboardService {
    constructor() {
        this.API_URL = 'https://mino-dodge-lb.taekm33.org';
        this.TIMEOUT = 3000; // 3초 타임아웃
        this.PREFIX = 'minoDodge_';
    }

    // 타임아웃 fetch 래퍼
    async _fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            return res;
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }

    // 스테이지 점수 제출
    async submitScore(stage, name, score, look) {
        this._saveLocal(stage, name, score, look);
        try {
            const res = await this._fetchWithTimeout(this.API_URL + '/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage, name, score, date: Date.now(), look: look || null })
            });
            return res.ok;
        } catch (e) { /* 오프라인 폴백 */ }
        return false;
    }

    // 스테이지 리더보드 조회
    async getLeaderboard(stage) {
        try {
            const res = await this._fetchWithTimeout(this.API_URL + '/api/leaderboard/' + stage);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) return data;
            }
        } catch (e) { /* 폴백 */ }
        return this._getLocal(stage);
    }

    // 명예의 전당 제출
    async submitHallOfFame(name, totalScore, look) {
        this._saveTotalLocal(name, totalScore, look);
        try {
            await this._fetchWithTimeout(this.API_URL + '/api/halloffame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, totalScore, date: Date.now(), look: look || null })
            });
        } catch (e) { /* 오프라인 폴백 */ }
    }

    // 명예의 전당 조회
    async getHallOfFame() {
        try {
            const res = await this._fetchWithTimeout(this.API_URL + '/api/halloffame');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) return data;
            }
        } catch (e) { /* 폴백 */ }
        return this._getTotalLocal();
    }

    // --- localStorage ---
    _saveLocal(stage, name, score, look) {
        try {
            const key = this.PREFIX + 'lb_' + stage;
            const lb = JSON.parse(localStorage.getItem(key) || '[]');
            lb.push({ name, score, date: Date.now(), look: look || null });
            lb.sort((a, b) => b.score - a.score);
            localStorage.setItem(key, JSON.stringify(lb.slice(0, 30)));
        } catch (e) {}
    }

    _getLocal(stage) {
        try { return JSON.parse(localStorage.getItem(this.PREFIX + 'lb_' + stage) || '[]'); }
        catch (e) { return []; }
    }

    _saveTotalLocal(name, totalScore, look) {
        try {
            const lb = JSON.parse(localStorage.getItem(this.PREFIX + 'lb_total') || '[]');
            lb.push({ name, totalScore, date: Date.now(), look: look || null });
            lb.sort((a, b) => b.totalScore - a.totalScore);
            localStorage.setItem(this.PREFIX + 'lb_total', JSON.stringify(lb.slice(0, 30)));
        } catch (e) {}
    }

    _getTotalLocal() {
        try { return JSON.parse(localStorage.getItem(this.PREFIX + 'lb_total') || '[]'); }
        catch (e) { return []; }
    }
}
