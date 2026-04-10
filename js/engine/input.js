// 입력 핸들러 - 4방향 이동 + 가상 조이스틱 + 스킬 버튼
// 키보드: ArrowKeys + WASD
// 터치: 조이스틱 방식 (시작점 기준 delta)

class InputHandler {
    constructor() {
        this.keys = {};
        // 터치 4방향
        this.touchUp = false;
        this.touchDown = false;
        this.touchLeft = false;
        this.touchRight = false;
        // 스킬 터치 영역
        this._skill1Touch = false;
        this._skill2Touch = false;
        this.clicks = [];
        this.activeTouches = {};

        const canvas = document.getElementById('gameCanvas');

        // 키보드 이벤트
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 터치 시작
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                const rect = canvas.getBoundingClientRect();
                const canvasX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
                const canvasY = ((touch.clientY - rect.top) / rect.height) * canvas.height;

                this.activeTouches[touch.identifier] = {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentX: touch.clientX,
                    currentY: touch.clientY,
                    canvasX: canvasX,
                    canvasY: canvasY,
                    isSkill: false,
                };

                // 스킬 버튼 영역 체크 (하단 좌우)
                if (canvasY > 400) {
                    if (canvasX < 80) {
                        this._skill1Touch = true;
                        this.activeTouches[touch.identifier].isSkill = true;
                    } else if (canvasX > 240) {
                        this._skill2Touch = true;
                        this.activeTouches[touch.identifier].isSkill = true;
                    }
                }

                this.clicks.push({ x: canvasX, y: canvasY });
            }
            this._updateTouchDirection();
        }, { passive: false });

        // 터치 이동
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (this.activeTouches[touch.identifier]) {
                    this.activeTouches[touch.identifier].currentX = touch.clientX;
                    this.activeTouches[touch.identifier].currentY = touch.clientY;
                }
            }
            this._updateTouchDirection();
        }, { passive: false });

        // 터치 끝
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (this.activeTouches[touch.identifier]) {
                    if (this.activeTouches[touch.identifier].isSkill) {
                        this._skill1Touch = false;
                        this._skill2Touch = false;
                    }
                    delete this.activeTouches[touch.identifier];
                }
            }
            this._updateTouchDirection();
        }, { passive: false });

        canvas.addEventListener('touchcancel', (e) => {
            for (const touch of e.changedTouches) {
                delete this.activeTouches[touch.identifier];
            }
            this._skill1Touch = false;
            this._skill2Touch = false;
            this._updateTouchDirection();
        }, { passive: false });

        // 마우스 클릭 (메뉴용)
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
            const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
            this.clicks.push({ x, y });
        });
    }

    // 터치 방향 업데이트 (가상 조이스틱)
    _updateTouchDirection() {
        this.touchUp = false;
        this.touchDown = false;
        this.touchLeft = false;
        this.touchRight = false;

        const DEAD_ZONE = 15; // 15px 데드존

        for (const id in this.activeTouches) {
            const t = this.activeTouches[id];
            if (t.isSkill) continue; // 스킬 터치는 이동에 영향 없음

            const dx = t.currentX - t.startX;
            const dy = t.currentY - t.startY;

            // 데드존 체크
            if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) continue;

            // 4방향 매핑 (대각선도 허용)
            if (dx < -DEAD_ZONE) this.touchLeft = true;
            if (dx > DEAD_ZONE) this.touchRight = true;
            if (dy < -DEAD_ZONE) this.touchUp = true;
            if (dy > DEAD_ZONE) this.touchDown = true;
        }
    }

    isLeft() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft;
    }

    isRight() {
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight;
    }

    isUp() {
        return this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchUp;
    }

    isDown() {
        return this.keys['ArrowDown'] || this.keys['KeyS'] || this.touchDown;
    }

    // 스킬 1: 봉구 (Q키 또는 하단 좌측 터치)
    isSkill1() {
        return this.keys['KeyQ'] || this._skill1Touch;
    }

    // 스킬 2: 오소이 무적 (E키 또는 하단 우측 터치)
    isSkill2() {
        return this.keys['KeyE'] || this._skill2Touch;
    }

    // 스킬 키 소비 (한번 인식 후 초기화)
    consumeSkill1() {
        if (this.keys['KeyQ']) { this.keys['KeyQ'] = false; return true; }
        if (this._skill1Touch) { this._skill1Touch = false; return true; }
        return false;
    }

    consumeSkill2() {
        if (this.keys['KeyE']) { this.keys['KeyE'] = false; return true; }
        if (this._skill2Touch) { this._skill2Touch = false; return true; }
        return false;
    }

    consumeConfirm() {
        if (this.keys['Enter']) { this.keys['Enter'] = false; return true; }
        if (this.keys['Space']) { this.keys['Space'] = false; return true; }
        return false;
    }

    getClick() {
        return this.clicks.shift() || null;
    }

    clearClicks() {
        this.clicks = [];
    }
}
