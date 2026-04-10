// 스테이지 설정 - 10스테이지 점진적 난이도
// 각 스테이지 30초, 불리 수/투사체 종류/속도가 점점 증가

// 스테이지별 스토리 텍스트 — 인트로 컷씬에 사용
const STAGE_STORIES = [
    // Stage 1
    {
        title: '1단계 — 조용한 아침',
        text: '오늘도 어김없이 등교하는 미노.\n교실에 들어서자 두 녀석이 기다리고 있다.\n"오타쿠 냄새 풍기며 오셨습니다~"\n하지만 미노의 눈빛이 달라졌다.\n오늘부터... 각성이다.',
    },
    // Stage 2
    {
        title: '2단계 — 쉬는 시간',
        text: '쉬는 시간, 복도에서 돌아온 미노.\n책상 위에 분필 가루가 잔뜩 뿌려져 있다.\n"크크, 오타쿠 전용 시즌드 데스크~"\n미노는 조용히 분필을 털어내며 중얼거린다.\n"이 정도론... 부족해."',
    },
    // Stage 3
    {
        title: '3단계 — 점심시간의 공포',
        text: '급식실로 향하는 미노.\n등 뒤에서 돌멩이가 날아온다.\n세 명으로 늘어난 적들.\n하지만 미노에게 점심시간은\n수련의 시간일 뿐이다.',
    },
    // Stage 4
    {
        title: '4단계 — 오후 수업',
        text: '수업 시간, 선생님이 칠판을 보는 사이\n연필이 쏟아져 내린다.\n"잘도 수업을 듣는구나, 오타쿠 선생~"\n미노는 눈을 감고 속삭인다.\n"울트라 인스팅트... 발동."',
    },
    // Stage 5
    {
        title: '5단계 — 방과후 전쟁',
        text: '4교시가 끝나고 방과후.\n네 명이 사방에서 에워싼다.\n빵, 지우개, 연필이 동시에 날아온다.\n"자, 이제부터가 진짜다."\n미노의 눈이 번쩍 빛난다.',
    },
    // Stage 6
    {
        title: '6단계 — 복도의 습격',
        text: '화장실을 다녀오는 길.\n복도에서 기습이 시작된다.\n휴지 세례가 쏟아진다.\n"화장실에서 이걸 쓰시지~"\n미노는 미소를 짓는다.\n"잔상이다."',
    },
    // Stage 7
    {
        title: '7단계 — 급식실 대란',
        text: '급식실에서 컵라면이 날아온다.\n다섯 명의 포위망.\n"배고프지? 이거나 먹어!"\n미노는 봉구를 떠올린다.\n든든한 동료가 있으니까.',
    },
    // Stage 8
    {
        title: '8단계 — 운동장 전투',
        text: '체육시간, 운동장.\n연사가 시작된다.\n사방에서 빗발치듯 날아오는 물건들.\n"나루토 달리기 한다~"\n미노: "아니, 이건 시간 가속이다."',
    },
    // Stage 9
    {
        title: '9단계 — 종례 시간',
        text: '하교 직전, 여섯 명 전원 집합.\n최후의 폭격이 시작된다.\n교실이 전장이 된다.\n하지만 미노는 흔들리지 않는다.\n"거의 다 왔어..."',
    },
    // Stage 10
    {
        title: '10단계 — 최종 시험!',
        text: '마지막 시험.\n모든 것을 쏟아붓는 친구들.\n미노도 모든 것을 건다.\n"이게 나의 마지막 에피소드다."\n"반드시... 해피엔딩으로 끝낸다!"',
    },
];

const STAGES = [
    { // 스테이지 1
        name: '1단계', subtitle: '조용한 아침',
        bullyCount: 2, spawnInterval: 2000, projectileSpeed: 60,
        projectileTypes: ['paper_airplane', 'eraser'],
        angelChance: 0.01, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 80 },
            { side: 'top', x: 220 },
        ],
    },
    { // 스테이지 2
        name: '2단계', subtitle: '쉬는 시간',
        bullyCount: 2, spawnInterval: 1800, projectileSpeed: 70,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk'],
        angelChance: 0.012, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 60 },
            { side: 'right', y: 150 },
        ],
    },
    { // 스테이지 3
        name: '3단계', subtitle: '점심시간의 공포',
        bullyCount: 3, spawnInterval: 1600, projectileSpeed: 80,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock'],
        angelChance: 0.014, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 80 },
            { side: 'top', x: 220 },
            { side: 'left', y: 120 },
        ],
    },
    { // 스테이지 4
        name: '4단계', subtitle: '오후 수업',
        bullyCount: 3, spawnInterval: 1400, projectileSpeed: 90,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil'],
        angelChance: 0.016, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 150 },
            { side: 'left', y: 150 },
            { side: 'right', y: 200 },
        ],
    },
    { // 스테이지 5
        name: '5단계', subtitle: '방과후 전쟁',
        bullyCount: 4, spawnInterval: 1200, projectileSpeed: 100,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil', 'bread'],
        angelChance: 0.018, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 80 },
            { side: 'top', x: 220 },
            { side: 'left', y: 150 },
            { side: 'right', y: 200 },
        ],
    },
    { // 스테이지 6
        name: '6단계', subtitle: '복도의 습격',
        bullyCount: 4, spawnInterval: 1100, projectileSpeed: 110,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil', 'bread', 'tissue'],
        angelChance: 0.020, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 100 },
            { side: 'top', x: 200 },
            { side: 'left', y: 180 },
            { side: 'bottom', x: 150 },
        ],
    },
    { // 스테이지 7
        name: '7단계', subtitle: '급식실 대란',
        bullyCount: 5, spawnInterval: 1000, projectileSpeed: 120,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil', 'bread', 'tissue', 'cup_ramen'],
        angelChance: 0.022, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 60 },
            { side: 'top', x: 160 },
            { side: 'top', x: 260 },
            { side: 'left', y: 200 },
            { side: 'right', y: 200 },
        ],
    },
    { // 스테이지 8
        name: '8단계', subtitle: '운동장 전투',
        bullyCount: 5, spawnInterval: 900, projectileSpeed: 135,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil', 'bread', 'tissue', 'cup_ramen'],
        angelChance: 0.024, duration: 30000,
        burstThrows: true, // 연속 투척
        bullyPositions: [
            { side: 'top', x: 80 },
            { side: 'top', x: 240 },
            { side: 'left', y: 120 },
            { side: 'right', y: 120 },
            { side: 'bottom', x: 160 },
        ],
    },
    { // 스테이지 9
        name: '9단계', subtitle: '종례 시간',
        bullyCount: 6, spawnInterval: 750, projectileSpeed: 150,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil', 'bread', 'tissue', 'cup_ramen'],
        angelChance: 0.025, duration: 30000,
        bullyPositions: [
            { side: 'top', x: 50 },
            { side: 'top', x: 150 },
            { side: 'top', x: 250 },
            { side: 'left', y: 150 },
            { side: 'right', y: 150 },
            { side: 'bottom', x: 160 },
        ],
    },
    { // 스테이지 10
        name: '10단계', subtitle: '최종 시험!',
        bullyCount: 6, spawnInterval: 600, projectileSpeed: 160,
        projectileTypes: ['paper_airplane', 'eraser', 'chalk', 'rock', 'pencil', 'bread', 'tissue', 'cup_ramen'],
        angelChance: 0.028, duration: 30000,
        burstThrows: true,
        isBoss: true,
        bullyPositions: [
            { side: 'top', x: 60 },
            { side: 'top', x: 160 },
            { side: 'top', x: 260 },
            { side: 'left', y: 100 },
            { side: 'right', y: 100 },
            { side: 'bottom', x: 160 },
        ],
    },
];
