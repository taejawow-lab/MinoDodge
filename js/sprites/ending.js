// 엔딩 시퀀스 — 스프라이트 + 이펙트 + 렌더링
// 악수 장면, 박수 파티클, 4단계 엔딩 렌더링

// ==============================
// 악수 스프라이트 (24x20, 2프레임 — 미노와 친구 악수)
// ==============================
const HANDSHAKE_SPRITE = {
    palette: [
        null,            // 0 = 투명
        '#1A1008',       // 1 = 외곽
        '#3A2818',       // 2 = 갈색 머리 (미노)
        '#5C4030',       // 3 = 밝은 머리
        '#F5D6B8',       // 4 = 피부
        '#E8C4A0',       // 5 = 피부 그림자
        '#FFFFFF',       // 6 = 흰 셔츠
        '#333333',       // 7 = 눈
        '#FF8888',       // 8 = 볼
        '#4488CC',       // 9 = 파란 바지
        '#335577',       // A = 상대 교복
        '#224466',       // B = 교복 그림자
        '#FFCC99',       // C = 상대 피부
        '#4A3020',       // D = 상대 머리
        '#FF4444',       // E = 악수 포인트/하트
        '#FFCC00',       // F = 반짝임
    ],
    width: 24,
    height: 20,
    frames: [
        // 프레임 0: 악수 기본
        [
            '001221000000000DD1000000', // 0  미노 머리 + 상대 머리
            '012332100000001DD1000000', // 1
            '123333210000011DD1100000', // 2
            '12333321000CDDDDDC100000', // 3
            '144744100000C7C7CC000000', // 4  눈
            '148484100000C8C8CC000000', // 5  볼
            '144444100000CCCCCC000000', // 6
            '014441000000CCCCC0000000', // 7
            '006660000000AAAA00000000', // 8  셔츠/교복
            '066760000000AAAB00000000', // 9
            '066760044CC0AABB00000000', // 10 악수! 손 맞잡음
            '066760044CC0AABB00000000', // 11
            '006660000000AAAA00000000', // 12
            '009990000000AAAA00000000', // 13 바지
            '099990000000AAAA00000000', // 14
            '099090000000AA0A00000000', // 15
            '099090000000AA0A00000000', // 16
            '000000000000000000000000', // 17
            '000000000000000000000000', // 18
            '000000000000000000000000', // 19
        ],
        // 프레임 1: 악수 + 반짝
        [
            '001221000000000DD1000000', // 0
            '012332100000001DD1000000', // 1
            '123333210000011DD1100000', // 2
            '12333321000CDDDDDC100000', // 3
            '144744100000C7C7CC000000', // 4
            '148484100000C8C8CC000000', // 5
            '144444100000CCCCCC000000', // 6
            '014441000000CCCCC0000000', // 7
            '006660000000AAAA00000000', // 8
            '066760000F00AAAB00000000', // 9  반짝
            '066760044CC0AABB00000000', // 10 악수
            '066760044CC0AABB00000000', // 11
            '006660F00000AAAA00000000', // 12 반짝
            '009990000000AAAA00000000', // 13
            '099990000000AAAA00000000', // 14
            '099090000000AA0A00000000', // 15
            '099090000000AA0A00000000', // 16
            '0000F0000000000F00000000', // 17 반짝
            '000000000000000000000000', // 18
            '000000000000000000000000', // 19
        ],
    ]
};

// ==============================
// 박수 파티클 이펙트 (하트, 별이 올라감)
// ==============================
class ApplauseEffect {
    constructor(canvasWidth, canvasHeight) {
        this.particles = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.elapsed = 0;
    }

    // 파티클 생성 (주기적으로 호출)
    spawn() {
        const types = ['heart', 'star', 'sparkle'];
        const colors = ['#FF4444', '#FFD700', '#FF88CC', '#88DDFF', '#AAFFAA'];
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                type: types[Math.floor(Math.random() * types.length)],
                x: Math.random() * this.canvasWidth,
                y: this.canvasHeight + 10,
                vx: (Math.random() - 0.5) * 30,
                vy: -(60 + Math.random() * 40),
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                rotation: Math.random() * Math.PI * 2,
                life: 0,
                maxLife: 2000 + Math.random() * 1000,
            });
        }
    }

    update(dt) {
        this.elapsed += dt;
        // 0.3초마다 파티클 생성
        if (this.elapsed > 300) {
            this.elapsed -= 300;
            this.spawn();
        }

        for (const p of this.particles) {
            p.life += dt;
            p.x += p.vx * dt / 1000;
            p.y += p.vy * dt / 1000;
            p.rotation += 2 * dt / 1000;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        }
        // 죽은 파티클 제거
        this.particles = this.particles.filter(p => p.life < p.maxLife);
    }

    render(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;

            if (p.type === 'heart') {
                // 간단한 하트
                ctx.font = `${p.size * 2}px serif`;
                ctx.textAlign = 'center';
                ctx.fillText('\u2665', p.x, p.y);
            } else if (p.type === 'star') {
                // 별
                ctx.font = `${p.size * 2}px serif`;
                ctx.textAlign = 'center';
                ctx.fillText('\u2605', p.x, p.y);
            } else {
                // 반짝이 (작은 사각형)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
        }
        ctx.restore();
    }
}

// ==============================
// 엔딩 텍스트 시퀀스
// ==============================
const ENDING_SCENES = [
    {
        text: '미노는 오늘도 모든 것을 피했다.',
        duration: 3000,
    },
    {
        text: '교실의 투사체들은 멈추고,\n괴롭히는 아이들도 지쳐 갔다.',
        duration: 4000,
    },
    {
        text: '미노는 깨달았다.\n피하는 것도 실력이라는 것을.',
        duration: 4000,
    },
    {
        text: '봉구와 함께 집으로 돌아가는 길,\n미노의 발걸음은 가벼웠다.',
        duration: 4000,
    },
    {
        text: '내일도 피할 수 있을까?\n물론이지. 미노니까.',
        duration: 3000,
    },
];

// ==============================
// 4단계 엔딩 렌더링 함수
// phase 0: 텍스트 시퀀스 (감정씬)
// phase 1: 악수 장면 + 박수
// phase 2: 크레딧 롤
// phase 3: "THE END" + 재시작 버튼
// ==============================
function renderEndingScene(ctx, phase, elapsed, canvasWidth, canvasHeight, applauseEffect) {
    ctx.save();

    // 배경 어둡게
    ctx.fillStyle = '#111122';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    switch (phase) {
        case 0: {
            // 텍스트 시퀀스 — 몇 번째 텍스트인지 계산
            let cumTime = 0;
            let currentScene = 0;
            for (let i = 0; i < ENDING_SCENES.length; i++) {
                if (elapsed < cumTime + ENDING_SCENES[i].duration) {
                    currentScene = i;
                    break;
                }
                cumTime += ENDING_SCENES[i].duration;
                if (i === ENDING_SCENES.length - 1) currentScene = i;
            }
            const scene = ENDING_SCENES[currentScene];
            const localElapsed = elapsed - cumTime;
            const fadeIn = Math.min(1, localElapsed / 500);

            ctx.globalAlpha = fadeIn;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = scene.text.split('\n');
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], canvasWidth / 2, canvasHeight / 2 - 10 + i * 24);
            }
            break;
        }

        case 1: {
            // 악수 장면 + 박수 파티클
            const handshakeFrames = SpriteRenderer.prerenderSprite(HANDSHAKE_SPRITE, 3);
            const frameIdx = Math.floor(elapsed / 500) % 2;
            const hx = (canvasWidth - HANDSHAKE_SPRITE.width * 3) / 2;
            const hy = canvasHeight / 2 - HANDSHAKE_SPRITE.height * 3 / 2;
            ctx.drawImage(handshakeFrames[frameIdx], hx, hy);

            if (applauseEffect) {
                applauseEffect.render(ctx);
            }

            ctx.fillStyle = '#FFDD44';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('화해의 악수!', canvasWidth / 2, hy + HANDSHAKE_SPRITE.height * 3 + 30);
            break;
        }

        case 2: {
            // 크레딧 롤 (위로 스크롤)
            const scrollSpeed = 30; // px/sec
            const scrollY = elapsed * scrollSpeed / 1000;

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            let y = canvasHeight - scrollY;
            for (const item of CREDITS) {
                if (item.type === 'title') {
                    ctx.font = 'bold 18px monospace';
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText(item.text, canvasWidth / 2, y);
                    y += 30;
                } else if (item.type === 'role') {
                    ctx.font = '10px monospace';
                    ctx.fillStyle = '#AAAAAA';
                    ctx.fillText(item.text, canvasWidth / 2, y);
                    y += 18;
                } else if (item.type === 'name') {
                    ctx.font = 'bold 14px monospace';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(item.text, canvasWidth / 2, y);
                    y += 22;
                } else if (item.type === 'spacer') {
                    y += 20;
                }
            }
            break;
        }

        case 3: {
            // THE END
            const pulse = Math.sin(elapsed / 500) * 0.1 + 0.9;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 32px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('THE END', canvasWidth / 2, canvasHeight / 2 - 20);

            ctx.globalAlpha = 1;
            ctx.fillStyle = '#AAAAAA';
            ctx.font = '12px monospace';
            ctx.fillText('아무 키나 눌러서 다시 시작', canvasWidth / 2, canvasHeight / 2 + 30);
            break;
        }
    }

    ctx.restore();
}

// 크레딧 데이터
const CREDITS = [
    { type: 'title', text: '미노, 모든 것을 피한다!' },
    { type: 'spacer' },
    { type: 'role', text: '기획 / 프로그래밍' },
    { type: 'name', text: '태경민' },
    { type: 'spacer' },
    { type: 'role', text: '캐릭터 디자인' },
    { type: 'name', text: '태경민 & Claude' },
    { type: 'spacer' },
    { type: 'role', text: '사운드' },
    { type: 'name', text: 'Web Audio API' },
    { type: 'spacer' },
    { type: 'role', text: '스페셜 땡스' },
    { type: 'name', text: '미노 (실제 강아지)' },
    { type: 'name', text: '봉구 (실제 강아지)' },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'title', text: 'THE END' },
    { type: 'spacer' },
    { type: 'name', text: '플레이해줘서 고마워!' },
];
