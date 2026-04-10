// 스테이지 설정 - 10스테이지 점진적 난이도
// 각 스테이지 30초, 불리 수/투사체 종류/속도가 점점 증가

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
