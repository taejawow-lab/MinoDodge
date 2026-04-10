// 이펙트 스프라이트 + 유틸 클래스
// 무적 오라, 말풍선, 떠오르는 텍스트, 충격파

// ==============================
// 무적 오라 (24x32, 2프레임 — 반투명 빛나는 오라)
// ==============================
const INVINCIBLE_AURA = {
    palette: [
        null,            // 0 = 투명
        '#FFEE44',       // 1 = 금빛 오라 외곽
        '#FFDD22',       // 2 = 금빛 중간
        '#FFCC00',       // 3 = 금빛 진한
        '#FFFFFF',       // 4 = 반짝임
    ],
    width: 24,
    height: 32,
    frames: [
        // 프레임 0: 오라 넓게
        [
            '000000004100000040000000', // 0
            '000004001000041000000000', // 1  반짝이
            '000010000000000004000000', // 2
            '000001000000000010000000', // 3
            '001000011111100000010000', // 4  오라 외곽 시작
            '000001122222110000000000', // 5
            '000012200000022100000000', // 6
            '000120000000000210000000', // 7
            '001200000000000021000000', // 8
            '012000000000000002100000', // 9
            '012000000000000002100000', // 10
            '120000000000000000210000', // 11
            '120000000000000000210000', // 12
            '120000000000000000210000', // 13
            '120000000000000000210000', // 14
            '120000000000000000210000', // 15
            '120000000000000000210000', // 16
            '120000000000000000210000', // 17
            '120000000000000000210000', // 18
            '120000000000000000210000', // 19
            '120000000000000000210000', // 20
            '120000000000000000210000', // 21
            '012000000000000002100000', // 22
            '012000000000000002100000', // 23
            '001200000000000021000000', // 24
            '000120000000000210000000', // 25
            '000012200000022100000000', // 26
            '000001122222110000000000', // 27
            '000000011111100000000000', // 28
            '000000000000000000400000', // 29
            '000040000000000000000000', // 30
            '000000000400000000000000', // 31
        ],
        // 프레임 1: 오라 살짝 수축 + 반짝이 이동
        [
            '000000000000004000000000', // 0
            '000000040000000000400000', // 1
            '000040000000000000000000', // 2
            '000000000000000000000000', // 3
            '000000011111100000000000', // 4
            '000001122222110000000000', // 5
            '004012200000022100400000', // 6
            '000120000000000210000000', // 7
            '001200000000000021000000', // 8
            '012000000000000002100000', // 9
            '012000000000000002100000', // 10
            '120000000000000000210000', // 11
            '120000000000000000210000', // 12
            '120000000000000000210000', // 13
            '120000000000000000210000', // 14
            '120000000000000000210000', // 15
            '120000000000000000210000', // 16
            '120000000000000000210000', // 17
            '120000000000000000210000', // 18
            '120000000000000000210000', // 19
            '120000000000000000210000', // 20
            '120000000000000000210000', // 21
            '012000000000000002100000', // 22
            '012000000000000002100000', // 23
            '001200000000000021000000', // 24
            '000120000000000210000000', // 25
            '000012200000022100000000', // 26
            '000001122222110000000000', // 27
            '000000011111100000000000', // 28
            '000000000400000000000000', // 29
            '000000000000040000000000', // 30
            '000004000000000000000000', // 31
        ],
    ]
};

// ==============================
// 말풍선 렌더링 함수
// ==============================
function drawSpeechBubble(ctx, x, y, text, maxWidth) {
    maxWidth = maxWidth || 120;
    ctx.save();
    ctx.font = '10px monospace';

    // 텍스트 줄바꿈 처리
    const words = text.split('');
    const lines = [];
    let currentLine = '';
    for (const ch of words) {
        const testLine = currentLine + ch;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth - 16 && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = ch;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 14;
    const padding = 8;
    const bubbleWidth = maxWidth;
    const bubbleHeight = lines.length * lineHeight + padding * 2;

    // 말풍선 본체 (둥근 사각형)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    const bx = x - bubbleWidth / 2;
    const by = y - bubbleHeight - 10;
    const radius = 6;

    ctx.beginPath();
    ctx.moveTo(bx + radius, by);
    ctx.lineTo(bx + bubbleWidth - radius, by);
    ctx.quadraticCurveTo(bx + bubbleWidth, by, bx + bubbleWidth, by + radius);
    ctx.lineTo(bx + bubbleWidth, by + bubbleHeight - radius);
    ctx.quadraticCurveTo(bx + bubbleWidth, by + bubbleHeight, bx + bubbleWidth - radius, by + bubbleHeight);
    // 꼬리 (삼각형)
    ctx.lineTo(x + 6, by + bubbleHeight);
    ctx.lineTo(x, by + bubbleHeight + 8);
    ctx.lineTo(x - 6, by + bubbleHeight);
    ctx.lineTo(bx + radius, by + bubbleHeight);
    ctx.quadraticCurveTo(bx, by + bubbleHeight, bx, by + bubbleHeight - radius);
    ctx.lineTo(bx, by + radius);
    ctx.quadraticCurveTo(bx, by, bx + radius, by);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 텍스트
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + padding, by + padding + i * lineHeight);
    }

    ctx.restore();
}

// ==============================
// FloatingText 클래스 — 위로 떠오르며 페이드 아웃
// ==============================
class FloatingText {
    constructor(x, y, text, color, lifetime) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color || '#FFFFFF';
        this.lifetime = lifetime || 1500; // ms
        this.elapsed = 0;
        this.alpha = 1.0;
        this.alive = true;
    }

    update(dt) {
        this.elapsed += dt;
        // 위로 떠오름 (초당 20px)
        this.y -= 20 * dt / 1000;
        // 페이드 아웃
        this.alpha = Math.max(0, 1.0 - this.elapsed / this.lifetime);
        if (this.elapsed >= this.lifetime) {
            this.alive = false;
        }
    }

    render(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 외곽선
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, this.x, this.y);
        // 채우기
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// ==============================
// 충격파 이펙트 — 봉구 스킬 발동 시 퍼지는 원형
// ==============================
function drawShockwave(ctx, centerX, centerY, radius, maxRadius, color) {
    const progress = radius / maxRadius;
    const alpha = Math.max(0, 1.0 - progress);
    const lineWidth = Math.max(1, 4 * (1.0 - progress));

    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = color || '#FFDD44';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 안쪽 밝은 링
    if (progress < 0.5) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = lineWidth * 0.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

// ==============================
// 히트 이펙트 (10x10, 2프레임 — 피격 반짝임)
// ==============================
const HIT_EFFECT = {
    palette: [
        null,            // 0
        '#FFFFFF',       // 1 = 흰색
        '#FFFF00',       // 2 = 노랑
        '#FF8800',       // 3 = 주황
    ],
    width: 10,
    height: 10,
    frames: [
        [
            '0000100000',
            '0001310000',
            '0100010010',
            '0030000300',
            '1000000001',
            '0030000300',
            '0100010010',
            '0001310000',
            '0000100000',
            '0000000000',
        ],
        [
            '0010000100',
            '0000200000',
            '0002020000',
            '1000000001',
            '0020000200',
            '1000000001',
            '0002020000',
            '0000200000',
            '0010000100',
            '0000000000',
        ],
    ]
};

// ==============================
// 방패 이펙트 (16x16, 2프레임 — 무적 실드)
// ==============================
const SHIELD_EFFECT = {
    palette: [
        null,            // 0
        '#88DDFF',       // 1 = 밝은 하늘
        '#44AAEE',       // 2 = 중간 파랑
        '#AAEEFF',       // 3 = 매우 밝은
    ],
    width: 16,
    height: 16,
    frames: [
        [
            '0000011111000000',
            '0001100000110000',
            '0010000000001000',
            '0100000000000100',
            '1000000000000010',
            '1000000000000010',
            '1000000000000010',
            '1000000000000010',
            '1000000000000010',
            '1000000000000010',
            '0100000000000100',
            '0010000000001000',
            '0001000000010000',
            '0000100000100000',
            '0000011111000000',
            '0000000000000000',
        ],
        [
            '0000022222000000',
            '0002200000220000',
            '0020000000002000',
            '0200000000000200',
            '2000000000000020',
            '2000000000000020',
            '2000000000000020',
            '2000000000000020',
            '2000000000000020',
            '2000000000000020',
            '0200000000000200',
            '0020000000002000',
            '0002000000020000',
            '0000200000200000',
            '0000022222000000',
            '0000000000000000',
        ],
    ]
};
