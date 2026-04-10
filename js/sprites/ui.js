// UI 요소 스프라이트 + 렌더링 함수
// 하트, 별, 자물쇠, 버튼, 게이지, 타이머

// ==============================
// 빨간 하트 (10x10, 1프레임)
// ==============================
const HEART_FULL = {
    palette: [
        null,            // 0 = 투명
        '#FF3333',       // 1 = 빨강
        '#EE2222',       // 2 = 진빨강
        '#FF6666',       // 3 = 밝은 빨강
        '#FF9999',       // 4 = 하이라이트
    ],
    width: 10,
    height: 10,
    frames: [[
        '0011001100', // 0
        '0133013310', // 1  하트 양쪽 볼록
        '1343113431', // 2  하이라이트
        '1333333331', // 3
        '1333333331', // 4
        '0133333310', // 5
        '0013333100', // 6
        '0001331000', // 7
        '0000110000', // 8
        '0000000000', // 9
    ]]
};

// ==============================
// 빈 하트 (10x10, 1프레임)
// ==============================
const HEART_EMPTY = {
    palette: [
        null,            // 0 = 투명
        '#555555',       // 1 = 외곽 회색
        '#333333',       // 2 = 어두운 내부
        '#444444',       // 3 = 중간
    ],
    width: 10,
    height: 10,
    frames: [[
        '0011001100', // 0
        '0100010010', // 1  빈 하트 외곽만
        '1000110001', // 2
        '1000000001', // 3
        '1000000001', // 4
        '0100000010', // 5
        '0010000100', // 6
        '0001001000', // 7
        '0000110000', // 8
        '0000000000', // 9
    ]]
};

// ==============================
// 별 아이콘 (8x8, 1프레임)
// ==============================
const STAR_ICON = {
    palette: [
        null,            // 0
        '#FFD700',       // 1 = 금색
        '#FFEE44',       // 2 = 밝은 금색
        '#FFFF88',       // 3 = 반짝임
    ],
    width: 8,
    height: 8,
    frames: [[
        '00031000', // 0
        '00012000', // 1
        '00012000', // 2
        '11123111', // 3  별 수평
        '02222200', // 4
        '00122100', // 5
        '01200210', // 6
        '01000010', // 7
    ]]
};

// ==============================
// 자물쇠 아이콘 (8x10, 1프레임)
// ==============================
const LOCK_ICON = {
    palette: [
        null,            // 0
        '#888888',       // 1 = 회색
        '#666666',       // 2 = 어두운
        '#AAAAAA',       // 3 = 밝은
        '#FFCC00',       // 4 = 금색 열쇠구멍
    ],
    width: 8,
    height: 10,
    frames: [[
        '00122100', // 0  고리
        '01200210', // 1
        '01200210', // 2
        '11111111', // 3  몸통
        '12222221', // 4
        '12244221', // 5  열쇠구멍
        '12244221', // 6
        '12224221', // 7
        '12222221', // 8
        '11111111', // 9
    ]]
};

// ==============================
// 버튼 그리기 함수
// ==============================
function drawButton(ctx, x, y, w, h, text, isHovered) {
    ctx.save();

    // 버튼 배경
    const bgColor = isHovered ? '#5599DD' : '#4488CC';
    const borderColor = isHovered ? '#77BBFF' : '#336699';
    const shadowColor = '#224466';

    // 그림자
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x + 2, y + 2, w, h);

    // 본체
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    // 테두리
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // 하이라이트 (상단)
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + 2, y + 2, w - 4, h / 3);

    // 텍스트
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x + w / 2, y + h / 2);
    ctx.fillText(text, x + w / 2, y + h / 2);

    ctx.restore();
}

// ==============================
// 스킬 버튼 그리기 함수
// ==============================
function drawSkillButton(ctx, x, y, w, h, label, gauge, cost, isReady) {
    ctx.save();

    // 배경
    const bgColor = isReady ? '#44AA55' : '#555555';
    const borderColor = isReady ? '#66CC77' : '#444444';

    ctx.fillStyle = '#222222';
    ctx.fillRect(x + 2, y + 2, w, h);

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    // 게이지 바 (하단)
    const gaugeH = 4;
    const gaugeFill = Math.min(1, gauge / cost);
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 2, y + h - gaugeH - 2, w - 4, gaugeH);
    ctx.fillStyle = isReady ? '#FFDD44' : '#888888';
    ctx.fillRect(x + 2, y + h - gaugeH - 2, (w - 4) * gaugeFill, gaugeH);

    // 테두리
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // 빛나는 효과 (준비 완료 시)
    if (isReady) {
        ctx.fillStyle = 'rgba(255,255,100,0.15)';
        ctx.fillRect(x + 2, y + 2, w - 4, h / 2);
    }

    // 라벨
    ctx.fillStyle = isReady ? '#FFFFFF' : '#999999';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 - 4);

    ctx.restore();
}

// ==============================
// 게이지 바 그리기 함수
// ==============================
function drawGauge(ctx, x, y, w, h, value, maxValue, color) {
    ctx.save();

    const ratio = Math.min(1, Math.max(0, value / maxValue));

    // 배경
    ctx.fillStyle = '#222222';
    ctx.fillRect(x, y, w, h);

    // 채우기
    ctx.fillStyle = color || '#44CC55';
    ctx.fillRect(x + 1, y + 1, (w - 2) * ratio, h - 2);

    // 테두리
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // 하이라이트
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + 1, y + 1, (w - 2) * ratio, (h - 2) / 3);

    ctx.restore();
}

// ==============================
// 타이머 그리기 함수
// ==============================
function drawTimer(ctx, x, y, seconds) {
    ctx.save();

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    // 배경 박스
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const textWidth = 60;
    ctx.fillRect(x - textWidth / 2 - 4, y - 10, textWidth + 8, 22);

    // 테두리
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - textWidth / 2 - 4, y - 10, textWidth + 8, 22);

    // 시간 텍스트
    ctx.fillStyle = seconds <= 10 ? '#FF4444' : '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, x, y + 1);

    ctx.restore();
}

// ==============================
// 스킬 아이콘 — 봉구 (개 발바닥, 10x10)
// ==============================
const SKILL_BONGGU_ICON = {
    palette: [
        null,
        '#8B4513',       // 1 = 갈색
        '#A0522D',       // 2 = 밝은 갈색
        '#FFD700',       // 3 = 금색 테두리
    ],
    width: 10,
    height: 10,
    frames: [[
        '0011001100',
        '0022002200',
        '0011001100',
        '0000000000',
        '0001111000',
        '0012222100',
        '0122222210',
        '0122222210',
        '0012222100',
        '0001111000',
    ]]
};

// ==============================
// 스킬 아이콘 — 오소이 (방패, 10x10)
// ==============================
const SKILL_OSOI_ICON = {
    palette: [
        null,
        '#4488FF',       // 1 = 파랑
        '#66AAFF',       // 2 = 밝은 파랑
        '#2266DD',       // 3 = 진파랑
        '#FFFFFF',       // 4 = 흰 장식
    ],
    width: 10,
    height: 10,
    frames: [[
        '0011111100',
        '0133333310',
        '1324442431',
        '1324442431',
        '1334443431',
        '1333333431',
        '0133333310',
        '0013333100',
        '0001331000',
        '0000110000',
    ]]
};

// ==============================
// 화살표 아이콘 (8x8)
// ==============================
const ARROW_LEFT = {
    palette: [null, '#FFFFFF', '#CCCCCC'],
    width: 8, height: 8,
    frames: [[
        '00010000',
        '00110000',
        '01110000',
        '11111111',
        '11111111',
        '01110000',
        '00110000',
        '00010000',
    ]]
};

const ARROW_RIGHT = {
    palette: [null, '#FFFFFF', '#CCCCCC'],
    width: 8, height: 8,
    frames: [[
        '00001000',
        '00001100',
        '00001110',
        '11111111',
        '11111111',
        '00001110',
        '00001100',
        '00001000',
    ]]
};
