// 캐릭터 커스터마이즈 시스템
// 성별=5, 머리=5, 얼굴=5, 체형=5, 셔츠색=5, 바지색=5, 신발색=5
// 새 스프라이트 구조: 머리(0-6) + 얼굴(7-12) + 몸(13-20) + 바지/다리(21-27)

// ==============================
// 성별 옵션 (기본 얼굴/체형 프리셋)
// ==============================
const GENDER_OPTIONS = [
    { name: '남자',   faceDefault: 0, bodyDefault: 2, hairDefault: 0 },
    { name: '여자',   faceDefault: 3, bodyDefault: 1, hairDefault: 2 },
    { name: '중성A',  faceDefault: 1, bodyDefault: 2, hairDefault: 1 },
    { name: '중성B',  faceDefault: 2, bodyDefault: 1, hairDefault: 3 },
    { name: '로봇',   faceDefault: 4, bodyDefault: 3, hairDefault: 4 },
];

// ==============================
// 머리 스타일 (정면 기준 상단 7줄 교체, row 0~6)
// ==============================
const HAIR_OPTIONS = [
    // 0: 기본 — 둥근 앞머리 + 가르마
    { name: '기본', rows: [
        '00000011111100000000', // 0
        '00001122222211000000', // 1
        '00011233333211000000', // 2
        '00012333333321000000', // 3
        '00012333233321000000', // 4  가르마
        '00012322222321000000', // 5  이마 보임
        '00012244444221000000', // 6
    ]},
    // 1: 숏컷 — 짧고 가벼운
    { name: '숏컷', rows: [
        '00000000000000000000', // 0  텅 빈 꼭대기
        '00000011111100000000', // 1
        '00001122222211000000', // 2
        '00011232222311000000', // 3  짧은 앞머리
        '00012332223321000000', // 4
        '00012222222221000000', // 5  이마 많이 보임
        '00012244444221000000', // 6
    ]},
    // 2: 긴머리 — 양옆으로 내려옴
    { name: '긴머리', rows: [
        '00000011111100000000', // 0
        '00001122222211000000', // 1
        '00011233333211000000', // 2
        '00012333333321000000', // 3
        '00012333333331000000', // 4  머리카락 가득
        '00012333333331000000', // 5  이마 안 보임
        '00012334444331000000', // 6
    ]},
    // 3: 뾰족 (스파이키)
    { name: '뾰족', rows: [
        '00003000030000000000', // 0  뾰족한 끝
        '00003110031000000000', // 1
        '00011233332100000000', // 2
        '00012333333321000000', // 3
        '00012333233321000000', // 4
        '00012322222321000000', // 5
        '00012244444221000000', // 6
    ]},
    // 4: 트윈테일 — 양쪽 갈래
    { name: '트윈테일', rows: [
        '00000011111100000000', // 0
        '00001122222211000000', // 1
        '00011233333211000000', // 2
        '30012333333321030000', // 3  갈래 시작
        '31012333233321310000', // 4
        '32012322222321230000', // 5  양쪽 튀어나옴
        '32012244444221230000', // 6
    ]},
];

// ==============================
// 얼굴 옵션 (row 7~12 교체, 6줄)
// ==============================
const FACE_OPTIONS = [
    // 0: 동그란 얼굴 — 기본
    { name: '동그란', faceRows: [
        '00014DD4444DD4100000', // 7  큰 눈 좌우대칭
        '00014DF4444DF4100000', // 8  하이라이트
        '0001E4444444E4100000', // 9  볼터치
        '00014444444444100000', // 10
        '00001444CC4441000000', // 11 입
        '00000144444410000000', // 12 턱
    ]},
    // 1: 각진 얼굴 — 좌우 직선
    { name: '각진', faceRows: [
        '00014DD4444DD4100000', // 7
        '00014DF4444DF4100000', // 8
        '00014444444444100000', // 9  볼터치 없음
        '00014444444444100000', // 10
        '00001444CC4441000000', // 11
        '00000144444410000000', // 12
    ]},
    // 2: 갸름한 얼굴 — 아래로 좁아짐
    { name: '갸름한', faceRows: [
        '00014DD4444DD4100000', // 7
        '00014DF4444DF4100000', // 8
        '0001E4444444E4100000', // 9  볼터치
        '00001444444441000000', // 10 좁아짐
        '00000144CC4410000000', // 11 더 좁게
        '00000014444100000000', // 12
    ]},
    // 3: 귀여운 얼굴 — 눈 더 크게, 볼 강조
    { name: '귀여운', faceRows: [
        '00014DD4444DD4100000', // 7  눈 크게
        '00014DF4444DF4100000', // 8  하이라이트
        '001EE4444444EE100000', // 9  볼터치 크게
        '00014444444444100000', // 10
        '00001444CC4441000000', // 11 웃는 입
        '00000144444410000000', // 12
    ]},
    // 4: 날카로운 얼굴 — 가늘고 날카로운 눈
    { name: '날카로운', faceRows: [
        '00014444444444100000', // 7
        '00014D444444D4100000', // 8  가는 눈 (1px)
        '00014444444444100000', // 9  볼터치 없음
        '00014444444444100000', // 10
        '00001444CC4441000000', // 11
        '00000144444410000000', // 12
    ]},
];

// ==============================
// 체형 옵션 (row 13~20 교체 — 목+셔츠+바지상단, 8줄)
// ==============================
const BODY_OPTIONS = [
    // 0: 홀쭉 — 좁은 셔츠
    { name: '홀쭉', bodyRows: [
        '00000015544500000000', // 13 목
        '00000056676500000000', // 14 좁은 어깨
        '00000566776500000000', // 15
        '00000567765000000000', // 16 좁은 셔츠
        '00000567765000000000', // 17
        '00000566665000000000', // 18
        '00000056776000000000', // 19
        '00000008888000000000', // 20 바지
    ]},
    // 1: 날씬
    { name: '날씬', bodyRows: [
        '00000015544500000000', // 13
        '00000566776500000000', // 14
        '00005667776650000000', // 15
        '00005667767665000000', // 16
        '00005667767665000000', // 17
        '00005666666665000000', // 18
        '00000566776650000000', // 19
        '00000088888800000000', // 20
    ]},
    // 2: 기본
    { name: '기본', bodyRows: [
        '00000015544500000000', // 13
        '00000566776650000000', // 14
        '00005667776765000000', // 15
        '00005667CC7665000000', // 16 리본
        '00005667767665000000', // 17
        '00005666666665000000', // 18
        '00000566776650000000', // 19
        '00000088888800000000', // 20
    ]},
    // 3: 통통
    { name: '통통', bodyRows: [
        '00000155444510000000', // 13 넓은 목
        '00005667776650000000', // 14
        '00056677776765000000', // 15
        '00056677CC7665000000', // 16
        '00056677767665000000', // 17
        '00056666666665000000', // 18
        '00005667776650000000', // 19
        '00000888888800000000', // 20
    ]},
    // 4: 뚱뚱
    { name: '뚱뚱', bodyRows: [
        '00000564444650000000', // 13 넓은 목
        '00056677776650000000', // 14
        '00566777776765000000', // 15
        '00566777CC7665000000', // 16
        '00566777767665000000', // 17
        '00566666666665000000', // 18
        '00056677776650000000', // 19
        '00008888888880000000', // 20
    ]},
];

// ==============================
// 색상 옵션 — 팔레트 인덱스 교체
// ==============================

// 셔츠 색상 (인덱스 6, 7 교체)
const SHIRT_COLORS = [
    { name: '화이트', colors: { 6: '#FFFFFF', 7: '#DDDDDD' } },
    { name: '레드',   colors: { 6: '#DD4444', 7: '#BB2222' } },
    { name: '블루',   colors: { 6: '#4488DD', 7: '#3366BB' } },
    { name: '옐로우', colors: { 6: '#FFCC44', 7: '#DDAA22' } },
    { name: '블랙',   colors: { 6: '#333333', 7: '#222222' } },
];

// 바지 색상 (인덱스 8, 9 교체)
const PANTS_COLORS = [
    { name: '블루',   colors: { 8: '#4488CC', 9: '#3366AA' } },
    { name: '블랙',   colors: { 8: '#333333', 9: '#222222' } },
    { name: '카키',   colors: { 8: '#99AA77', 9: '#778855' } },
    { name: '화이트', colors: { 8: '#EEEEEE', 9: '#CCCCCC' } },
    { name: '그레이', colors: { 8: '#888888', 9: '#666666' } },
];

// 신발 색상 (인덱스 A, B 교체)
const SHOE_COLORS = [
    { name: '블랙',   colors: { 10: '#2C2C2C', 11: '#1A1A1A' } },
    { name: '화이트', colors: { 10: '#EEEEEE', 11: '#CCCCCC' } },
    { name: '레드',   colors: { 10: '#DD3333', 11: '#AA1111' } },
    { name: '블루',   colors: { 10: '#3366CC', 11: '#224499' } },
    { name: '브라운', colors: { 10: '#8B5A2B', 11: '#6B3A1B' } },
];

// ==============================
// 커스터마이즈 카테고리 배열 (UI 순서)
// ==============================
const CUSTOMIZATION_CATEGORIES = [
    { name: '성별',     options: GENDER_OPTIONS,  key: 'gender' },
    { name: '머리모양', options: HAIR_OPTIONS,    key: 'hair' },
    { name: '얼굴',     options: FACE_OPTIONS,    key: 'face' },
    { name: '체형',     options: BODY_OPTIONS,    key: 'body' },
    { name: '셔츠색',   options: SHIRT_COLORS,    key: 'shirt' },
    { name: '바지색',   options: PANTS_COLORS,    key: 'pants' },
    { name: '신발색',   options: SHOE_COLORS,     key: 'shoes' },
];

// ==============================
// buildCharacterSprite — 옵션 조합 -> 4방향 스프라이트 세트 생성
// 새 스프라이트 구조: 머리(0-6) + 얼굴(7-12) + 몸(13-20) + 바지/다리(21-27)
// ==============================
function buildCharacterSprite(options) {
    const opts = options || {};
    const genderIdx = opts.gender || 0;
    const hairIdx   = opts.hair   !== undefined ? opts.hair   : GENDER_OPTIONS[genderIdx].hairDefault;
    const faceIdx   = opts.face   !== undefined ? opts.face   : GENDER_OPTIONS[genderIdx].faceDefault;
    const bodyIdx   = opts.body   !== undefined ? opts.body   : GENDER_OPTIONS[genderIdx].bodyDefault;
    const shirtIdx  = opts.shirt  || 0;
    const pantsIdx  = opts.pants  || 0;
    const shoesIdx  = opts.shoes  || 0;

    const hair = HAIR_OPTIONS[hairIdx % HAIR_OPTIONS.length];
    const face = FACE_OPTIONS[faceIdx % FACE_OPTIONS.length];
    const body = BODY_OPTIONS[bodyIdx % BODY_OPTIONS.length];

    // 색상 오버라이드 모으기
    const colorOverrides = {};
    const shirtColors = SHIRT_COLORS[shirtIdx % SHIRT_COLORS.length].colors;
    const pantsColors = PANTS_COLORS[pantsIdx % PANTS_COLORS.length].colors;
    const shoeColors  = SHOE_COLORS[shoesIdx % SHOE_COLORS.length].colors;
    Object.assign(colorOverrides, shirtColors, pantsColors, shoeColors);

    // ====== 정면 스프라이트 빌드 ======
    const frontFrames = MINO_FRONT.frames.map(frame => {
        const newFrame = [...frame];
        // 머리 교체 (row 0~6, 7줄)
        for (let i = 0; i < 7; i++) {
            newFrame[i] = hair.rows[i];
        }
        // 얼굴 교체 (row 7~12, 6줄)
        for (let i = 0; i < 6; i++) {
            newFrame[7 + i] = face.faceRows[i];
        }
        // 체형 교체 (row 13~20, 8줄)
        for (let i = 0; i < 8; i++) {
            newFrame[13 + i] = body.bodyRows[i];
        }
        return newFrame;
    });

    const frontSprite = {
        palette: MINO_PALETTE,
        width: 20,
        height: 28,
        frames: frontFrames,
    };

    // ====== 뒷면은 체형만 교체 (얼굴 안 보이므로) ======
    const backFrames = MINO_BACK.frames.map(frame => {
        const newFrame = [...frame];
        // 체형 교체 (row 13~20, 8줄)
        for (let i = 0; i < 8; i++) {
            newFrame[13 + i] = body.bodyRows[i];
        }
        return newFrame;
    });

    const backSprite = {
        palette: MINO_PALETTE,
        width: 20,
        height: 28,
        frames: backFrames,
    };

    // ====== 좌/우측은 그대로 사용 ======
    const leftFrames = MINO_LEFT.frames.map(frame => [...frame]);
    const rightFrames = MINO_RIGHT.frames.map(frame => [...frame]);

    const leftSprite = {
        palette: MINO_PALETTE,
        width: 20, height: 28,
        frames: leftFrames,
    };
    const rightSprite = {
        palette: MINO_PALETTE,
        width: 20, height: 28,
        frames: rightFrames,
    };

    // 색상 오버라이드 적용 (팔레트 수정본)
    const SCALE = 2;
    return {
        front: Object.keys(colorOverrides).length > 0
            ? { sprite: frontSprite, prerendered: SpriteRenderer.prerenderSpriteWithColors(frontSprite, SCALE, colorOverrides) }
            : { sprite: frontSprite, prerendered: SpriteRenderer.prerenderSprite(frontSprite, SCALE) },
        back: Object.keys(colorOverrides).length > 0
            ? { sprite: backSprite, prerendered: SpriteRenderer.prerenderSpriteWithColors(backSprite, SCALE, colorOverrides) }
            : { sprite: backSprite, prerendered: SpriteRenderer.prerenderSprite(backSprite, SCALE) },
        left: Object.keys(colorOverrides).length > 0
            ? { sprite: leftSprite, prerendered: SpriteRenderer.prerenderSpriteWithColors(leftSprite, SCALE, colorOverrides) }
            : { sprite: leftSprite, prerendered: SpriteRenderer.prerenderSprite(leftSprite, SCALE) },
        right: Object.keys(colorOverrides).length > 0
            ? { sprite: rightSprite, prerendered: SpriteRenderer.prerenderSpriteWithColors(rightSprite, SCALE, colorOverrides) }
            : { sprite: rightSprite, prerendered: SpriteRenderer.prerenderSprite(rightSprite, SCALE) },
        colorOverrides,
    };
}

// 스와치 색상 미리보기용
function getShirtSwatch(idx) { return SHIRT_COLORS[idx % SHIRT_COLORS.length].colors[6]; }
function getPantsSwatch(idx) { return PANTS_COLORS[idx % PANTS_COLORS.length].colors[8]; }
function getShoeSwatch(idx)  { return SHOE_COLORS[idx % SHOE_COLORS.length].colors[10]; }
