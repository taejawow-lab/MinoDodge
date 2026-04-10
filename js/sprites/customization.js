// 캐릭터 커스터마이즈 시스템
// 성별=5, 머리=5, 얼굴=5, 체형=5, 셔츠색=5, 바지색=5, 신발색=5
// 기존 Game/js/sprites/customization.js 패턴 참조

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
    // 0: 기본 — 둥근 앞머리
    { name: '기본', rows: [
        '00000011111100000000', // 0
        '00001122222211000000', // 1
        '00012233333221000000', // 2  앞머리
        '00123333333332100000', // 3
        '01233333333333210000', // 4
        '12233322233332210000', // 5  앞머리 갈래
        '12233222223333210000', // 6  이마 보임
    ]},
    // 1: 숏컷 — 짧고 가벼운
    { name: '숏컷', rows: [
        '00000000000000000000', // 0  텅 빈 꼭대기
        '00000011111100000000', // 1
        '00001122222211000000', // 2
        '00012232222321000000', // 3  짧은 앞머리
        '00123332223332100000', // 4
        '01233222222233210000', // 5  이마 많이 보임
        '12233222222233210000', // 6
    ]},
    // 2: 긴머리 — 양옆으로 내려옴
    { name: '긴머리', rows: [
        '00000011111100000000', // 0
        '00001122222211000000', // 1
        '00012233333221000000', // 2
        '00123333333332100000', // 3
        '01233333333333210000', // 4
        '12233333333332210000', // 5  머리카락 가득
        '12233333333333210000', // 6  이마 안 보임
    ]},
    // 3: 뾰족 (스파이키)
    { name: '뾰족', rows: [
        '00030000003000000000', // 0  뾰족한 끝
        '00031000013000000000', // 1
        '00012300032100000000', // 2
        '00123333333210000000', // 3
        '01233333333332100000', // 4
        '12233322233332210000', // 5
        '12233222223333210000', // 6
    ]},
    // 4: 트윈테일 — 양쪽 갈래
    { name: '트윈테일', rows: [
        '00000011111100000000', // 0
        '00001122222211000000', // 1
        '00012233333221000000', // 2
        '30123333333332103000', // 3  갈래 시작
        '31233333333333213100', // 4
        '32233322233332232100', // 5  양쪽 튀어나옴
        '32233222223333232100', // 6
    ]},
];

// ==============================
// 얼굴 옵션 (row 7~16 중 눈/코/입 부분 교체)
// ==============================
const FACE_OPTIONS = [
    // 0: 동그란 얼굴 — 기본 넓은 형태
    { name: '동그란', faceRows: [
        '12234444444443210000', // 7
        '12344444444444321000', // 8
        '12344D4004D444321000', // 9  큰 눈
        '12344D4FF4D444321000', // 10 하이라이트
        '54344E4004E444345000', // 11 볼터치
        '54444444444444445000', // 12
        '54444444444444445000', // 13
        '12444444444444421000', // 14
        '01244444CC4444210000', // 15 입
        '00124444444442100000', // 16
    ]},
    // 1: 각진 얼굴 — 좌우 직선
    { name: '각진', faceRows: [
        '12234444444443210000',
        '12344444444444321000',
        '12344D4004D444321000',
        '12344D4FF4D444321000',
        '12344E4004E444321000', // 볼터치 없음 (날카로움)
        '12444444444444421000',
        '12444444444444421000',
        '12444444444444421000',
        '01244444CC4444210000',
        '00124444444442100000',
    ]},
    // 2: 갸름한 얼굴 — 아래로 좁아짐
    { name: '갸름한', faceRows: [
        '12234444444443210000',
        '12344444444444321000',
        '12344D4004D444321000',
        '12344D4FF4D444321000',
        '54344E4004E444345000',
        '54444444444444445000',
        '01444444444444410000', // 좁아짐
        '00144444444444100000',
        '00014444CC4441000000', // 더 좁게
        '00001444444410000000',
    ]},
    // 3: 귀여운 얼굴 — 눈 더 크게, 볼 강조
    { name: '귀여운', faceRows: [
        '12234444444443210000',
        '12344444444444321000',
        '12344DD00DD444321000', // 눈 2칸
        '12344DD00DD444321000', // 눈 크게
        '54344EE00EE444345000', // 볼터치 크게
        '54444444444444445000',
        '54444444444444445000',
        '12444444444444421000',
        '0124444CCCC444210000', // 입 크게 웃음
        '00124444444442100000',
    ]},
    // 4: 날카로운 얼굴 — 가늘고 날카로운 눈
    { name: '날카로운', faceRows: [
        '12234444444443210000',
        '12344444444444321000',
        '12344444444444321000',
        '12344D4004D444321000', // 가는 눈
        '12344444444444321000',
        '12444444444444421000',
        '12444444444444421000',
        '12444444444444421000',
        '01244444CC4444210000',
        '00124444444442100000',
    ]},
];

// ==============================
// 체형 옵션 (row 17~22 교체 — 목+셔츠)
// ==============================
const BODY_OPTIONS = [
    // 0: 홀쭉 — 좁은 셔츠
    { name: '홀쭉', bodyRows: [
        '00000154451000000000', // 17 좁은 목
        '00000666760000000000', // 18
        '00005666765000000000', // 19
        '00056667765000000000', // 20 좁은 셔츠
        '00056667765000000000', // 21
        '00005666650000000000', // 22
    ]},
    // 1: 날씬
    { name: '날씬', bodyRows: [
        '00001544451000000000',
        '00006667766000000000',
        '00056667766500000000',
        '00566677767650000000',
        '00566677767650000000',
        '00056666666500000000',
    ]},
    // 2: 기본
    { name: '기본', bodyRows: [
        '00001544445100000000',
        '00006667766600000000',
        '00056667766650000000',
        '00566677CC7766500000',
        '00566677CC7766500000',
        '00056666666650000000',
    ]},
    // 3: 통통
    { name: '통통', bodyRows: [
        '00015444445100000000',
        '00066677766600000000',
        '00566677766650000000',
        '05666777CC77666500000',
        '05666777CC77666500000',
        '00566666666665000000',
    ]},
    // 4: 뚱뚱
    { name: '뚱뚱', bodyRows: [
        '00056444445600000000',
        '00566677766650000000',
        '05666677766665000000',
        '566667777CC776665000',
        '566667777CC776665000',
        '05666666666665000000',
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
// buildCharacterSprite — 옵션 조합 → 4방향 스프라이트 세트 생성
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
        // 머리 교체 (row 0~6)
        for (let i = 0; i < 7; i++) {
            newFrame[i] = hair.rows[i];
        }
        // 얼굴 교체 (row 7~16)
        for (let i = 0; i < 10; i++) {
            newFrame[7 + i] = face.faceRows[i];
        }
        // 체형 교체 (row 17~22)
        for (let i = 0; i < 6; i++) {
            newFrame[17 + i] = body.bodyRows[i];
        }
        return newFrame;
    });

    const frontSprite = {
        palette: MINO_PALETTE,
        width: 20,
        height: 28,
        frames: frontFrames,
    };

    // ====== 뒷면은 머리만 교체 (얼굴 안 보이므로) ======
    const backFrames = MINO_BACK.frames.map(frame => {
        const newFrame = [...frame];
        // 체형 교체 (row 17~22)
        for (let i = 0; i < 6; i++) {
            newFrame[17 + i] = body.bodyRows[i];
        }
        return newFrame;
    });

    const backSprite = {
        palette: MINO_PALETTE,
        width: 20,
        height: 28,
        frames: backFrames,
    };

    // ====== 좌/우측은 체형만 교체 ======
    const leftFrames = MINO_LEFT.frames.map(frame => {
        const newFrame = [...frame];
        return newFrame;
    });
    const rightFrames = MINO_RIGHT.frames.map(frame => {
        const newFrame = [...frame];
        return newFrame;
    });

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
