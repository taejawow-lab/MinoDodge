// 메인 진입점
// 에러 복구 게임 루프, requestAnimationFrame, dt 캡핑 50ms

(function () {
    const canvas = document.getElementById('gameCanvas');
    const input = new InputHandler();

    let game;
    let lastError = null;
    // 디버그용 글로벌 노출
    window._game = null;

    try {
        game = new Game(canvas, input);
        window._game = game;
    } catch (e) {
        console.error('게임 초기화 실패:', e);
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 480;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 320, 480);
        ctx.fillStyle = '#FF4444';
        ctx.font = '14px monospace';
        ctx.fillText('Init Error: ' + e.message, 10, 240);
        return;
    }

    // 캔버스 리사이즈 (320:480 비율 유지)
    function resize() {
        const ratio = game.WIDTH / game.HEIGHT;
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (w / h > ratio) {
            w = h * ratio;
        } else {
            h = w / ratio;
        }
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
    }

    window.addEventListener('resize', resize);
    resize();

    // 에러 복구 게임 루프
    let lastTime = performance.now();

    function gameLoop(timestamp) {
        // 다음 프레임 먼저 예약 (루프 사망 방지)
        requestAnimationFrame(gameLoop);

        const dt = Math.min(timestamp - lastTime, 50); // 50ms 캡핑
        lastTime = timestamp;

        try {
            game.update(dt);
            game.render();
            lastError = null;
        } catch (e) {
            // 캔버스에 에러 표시하되 루프 유지
            if (lastError !== e.message) {
                console.error('게임 에러:', e);
                lastError = e.message;
            }
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, game.WIDTH, game.HEIGHT);
            ctx.fillStyle = '#FF4444';
            ctx.font = '12px monospace';
            ctx.fillText('Error: ' + e.message, 10, game.HEIGHT / 2);
            ctx.fillStyle = '#AAAAAA';
            ctx.font = '10px monospace';
            ctx.fillText('탭하여 재시도', 10, game.HEIGHT / 2 + 20);

            // 클릭으로 복구 시도
            const click = input.getClick();
            if (click) {
                try {
                    game.state = GameState.TITLE;
                    game.titleBlink = 0;
                } catch (e2) { /* 무시 */ }
            }
        }
    }

    requestAnimationFrame(gameLoop);
})();
