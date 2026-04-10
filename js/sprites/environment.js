// 교실 환경 스프라이트
// 바닥 타일, 칠판, 책상, 창문 + 교실 배경 렌더링 함수

// ==============================
// 나무 바닥 타일 (16x16)
// ==============================
const FLOOR_TILE = {
    palette: [
        null,            // 0 = 투명
        '#C8B896',       // 1 = 밝은 나무
        '#B8A886',       // 2 = 중간 나무
        '#A89876',       // 3 = 어두운 나무
        '#BEA88C',       // 4 = 결 무늬
    ],
    width: 16,
    height: 16,
    frames: [[
        '1112111211121112', // 0  나무 결
        '1111211111112111', // 1
        '2111111121111111', // 2
        '1121111111211111', // 3
        '1111211111112111', // 4  마루 경계
        '3333333333333333', // 5  이음새 (어두운 줄)
        '1111211121111121', // 6
        '1211111111121111', // 7
        '1112111411111211', // 8  결 무늬 포인트
        '1111211111112111', // 9
        '2111111121111111', // 10
        '3333333333333333', // 11 이음새
        '1112111211121112', // 12
        '1111411111114111', // 13 결 포인트
        '1211111121111111', // 14
        '1111211111112111', // 15
    ]]
};

// ==============================
// 학생 책상 타일 (16x16)
// ==============================
const DESK_TILE = {
    palette: [
        null,            // 0 = 투명
        '#AA8855',       // 1 = 밝은 나무 상판
        '#886633',       // 2 = 어두운 나무
        '#665522',       // 3 = 다리
        '#997744',       // 4 = 상판 하이라이트
        '#555555',       // 5 = 금속 다리
    ],
    width: 16,
    height: 16,
    frames: [[
        '1111111111111111', // 0  상판 윗면
        '4441444144414441', // 1  상판 하이라이트
        '2222222222222222', // 2  상판 측면
        '1111111111111111', // 3  상판 아랫면
        '2222222222222222', // 4
        '0050000000005000', // 5  다리
        '0050000000005000', // 6
        '0050000000005000', // 7
        '0050000000005000', // 8
        '0050000000005000', // 9
        '0050000000005000', // 10
        '0050000000005000', // 11
        '0050000000005000', // 12
        '0053000000003500', // 13 받침대
        '0555500000055500', // 14
        '0000000000000000', // 15
    ]]
};

// ==============================
// 칠판 (80x20 = 5x20 팔레트, 실제로는 타일링)
// 대형이라 16x8 기본 타일로 타일링
// ==============================
const BLACKBOARD = {
    palette: [
        null,            // 0 = 투명
        '#2A5A2A',       // 1 = 칠판 초록
        '#1A4A1A',       // 2 = 칠판 어두운 초록
        '#8B6B3A',       // 3 = 나무 테두리
        '#FFFFFF',       // 4 = 분필 글씨
        '#DDDDDD',       // 5 = 분필 흐린
        '#6B4B2A',       // 6 = 테두리 그림자
        '#CCCCCC',       // 7 = 분필 받침
    ],
    width: 16,
    height: 8,
    frames: [[
        '3333333333333333', // 0  나무 테두리
        '3611111111111163', // 1  테두리 안쪽
        '3112251111522113', // 2  칠판 + 분필 글씨
        '3111111111111113', // 3  칠판
        '3111141114111113', // 4  글자 조각
        '3111111111111113', // 5
        '3612251115221163', // 6  칠판 + 글씨
        '3377777777777733', // 7  분필 받침대
    ]]
};

// ==============================
// 창문 타일 (16x32)
// ==============================
const WINDOW_TILE = {
    palette: [
        null,            // 0 = 투명
        '#888888',       // 1 = 창틀 회색
        '#666666',       // 2 = 창틀 어두운
        '#99CCFF',       // 3 = 하늘색 유리
        '#77AADD',       // 4 = 유리 어두운
        '#BBDDFF',       // 5 = 유리 밝은 (반사)
        '#AAAAAA',       // 6 = 창틀 밝은
        '#FFFFFF',       // 7 = 구름/빛 반사
    ],
    width: 16,
    height: 32,
    frames: [[
        '1111111111111111', // 0  창틀 상단
        '1666666666666661', // 1
        '1633353433353361', // 2  유리 상단
        '1633333433333361', // 3  유리 + 가운데 세로살
        '1633333433333361', // 4
        '1633733433373361', // 5  구름/반사
        '1633333433333361', // 6
        '1633333433333361', // 7
        '1633333433333361', // 8
        '1633333433333361', // 9
        '1633353433353361', // 10 반사
        '1633333433333361', // 11
        '1633333433333361', // 12
        '1633333433333361', // 13
        '1622222422222261', // 14 가로살
        '1622222422222261', // 15
        '1644444444444461', // 16 하단 유리
        '1644444444444461', // 17
        '1644444444444461', // 18
        '1644544444454461', // 19 반사
        '1644444444444461', // 20
        '1644444444444461', // 21
        '1644444444444461', // 22
        '1644444444444461', // 23
        '1644444444444461', // 24
        '1644744444474461', // 25 반사
        '1644444444444461', // 26
        '1644444444444461', // 27
        '1644444444444461', // 28
        '1622222222222261', // 29 하단 창틀
        '1666666666666661', // 30
        '1111111111111111', // 31
    ]]
};

// ==============================
// 교실 배경 프리렌더 함수
// ==============================
function renderClassroom(ctx, canvasWidth, canvasHeight) {
    const SCALE = 2;

    // 1. 바닥 타일링 (전체)
    const floorFrames = SpriteRenderer.prerenderSprite(FLOOR_TILE, SCALE);
    const tileW = FLOOR_TILE.width * SCALE;
    const tileH = FLOOR_TILE.height * SCALE;
    for (let y = 0; y < canvasHeight; y += tileH) {
        for (let x = 0; x < canvasWidth; x += tileW) {
            ctx.drawImage(floorFrames[0], x, y);
        }
    }

    // 2. 상단에 칠판 타일링 (가로 5개)
    const bbFrames = SpriteRenderer.prerenderSprite(BLACKBOARD, SCALE);
    const bbW = BLACKBOARD.width * SCALE;
    const bbH = BLACKBOARD.height * SCALE;
    const bbStartX = Math.floor((canvasWidth - bbW * 5) / 2);
    for (let i = 0; i < 5; i++) {
        ctx.drawImage(bbFrames[0], bbStartX + i * bbW, 8);
    }

    // 3. 좌우에 창문
    const winFrames = SpriteRenderer.prerenderSprite(WINDOW_TILE, SCALE);
    const winW = WINDOW_TILE.width * SCALE;
    const winH = WINDOW_TILE.height * SCALE;
    // 왼쪽 벽 창문
    ctx.drawImage(winFrames[0], 4, 30);
    ctx.drawImage(winFrames[0], 4, 30 + winH + 16);
    // 오른쪽 벽 창문
    ctx.drawImage(winFrames[0], canvasWidth - winW - 4, 30);
    ctx.drawImage(winFrames[0], canvasWidth - winW - 4, 30 + winH + 16);

    // 4. 가장자리에 책상 배치 (불리들이 서있을 자리)
    const deskFrames = SpriteRenderer.prerenderSprite(DESK_TILE, SCALE);
    const deskW = DESK_TILE.width * SCALE;
    const deskH = DESK_TILE.height * SCALE;
    // 상단 줄 (칠판 아래)
    const deskY = bbH + 24;
    for (let i = 0; i < 4; i++) {
        ctx.drawImage(deskFrames[0], 60 + i * (deskW + 16), deskY);
    }
    // 하단 줄
    const deskY2 = canvasHeight - deskH - 20;
    for (let i = 0; i < 4; i++) {
        ctx.drawImage(deskFrames[0], 60 + i * (deskW + 16), deskY2);
    }
}

// 오프스크린 캔버스에 교실 배경 프리렌더
function prerenderClassroom(canvasWidth, canvasHeight) {
    const offscreen = document.createElement('canvas');
    offscreen.width = canvasWidth;
    offscreen.height = canvasHeight;
    const octx = offscreen.getContext('2d');
    octx.imageSmoothingEnabled = false;
    renderClassroom(octx, canvasWidth, canvasHeight);
    return offscreen;
}
