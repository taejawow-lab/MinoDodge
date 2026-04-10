// 외곽선 텍스트 렌더링 헬퍼 — 가독성 확보용
function drawOutlinedText(ctx, text, x, y, fillColor, outlineColor, font) {
    if (font) ctx.font = font;
    ctx.lineWidth = 3;
    ctx.strokeStyle = outlineColor || '#000000';
    ctx.fillStyle = fillColor || '#FFFFFF';
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

// 게임 상태 열거
const GameState = {
    NAME_INPUT: 'name_input',
    TITLE: 'title',
    CHARACTER_CUSTOMIZE: 'customize',
    PROLOGUE: 'prologue',
    STAGE_SELECT: 'stage_select',
    STAGE_INTRO: 'stage_intro',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    STAGE_CLEAR: 'stage_clear',
    ENDING: 'ending',
    HALL_OF_FAME: 'hall_of_fame',
    RANKING_VIEW: 'ranking_view',
};

// 미노 대사 (니어미스 시)
const MINO_QUOTES = [
    "오소이!", "잔상이다", "너.. 약하잖아?", "이게 수준차이다",
    "울트라 인스팅트!", "각성했다!", "허접!", "움직임이 보인다",
    "날 이길 수 있을 줄 알았나?", "100만 볼트!",
    "불꽃 소년이 돌아왔다", "나는 멈추지 않는다!",
    "세계 최강이 된 기분이다", "이것이... 힘이다",
    "오마에와 모우 신데이루", "나니?!", "무다무다무다!",
    "쿠라에!", "자... 잔상이다", "겨우 이 정도?",
    "마다마다다네", "다메다! 다메다!", "키사마..!",
    "넌 이미 죽어있다", "반카이!", "기어세컨드!",
    "도망가? 아니, 회피라고 해", "이것이 주인공 보정이다"
];

// 괴롭히는 친구 멘트
const BULLY_TAUNTS = [
    "얼이빠진녀석!", "라면뚱땡이!", "마운자로도 이기는 녀석!",
    "오타쿠 냄새난다!", "피할 수 있으면 피해봐!", "이거나 먹어!",
    "애니 그만 봐!", "도망만 다니냐?", "맞아봐 한 번!",
    "빨리빨리!", "헛! 빠지긴!", "크.. 운이 좋았어",
    "이번엔 못 피한다!", "실력 한번 보자!",
    "오타쿠는 체육시간에 뭐하냐?", "나루토 달리기 하지마!",
    "카메하메하 쏴봐~", "변신이라도 해볼래?",
    "피카츄 불러와봐!", "드래곤볼 모아봐!",
    "짜잔~ 선물이다!", "받아라 필살기!",
    "이것도 피해보시지~", "감히 내 앞에서?"
];

class Game {
    constructor(canvas, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.input = input;
        this.WIDTH = 320;
        this.HEIGHT = 480;
        this.SCALE = 2;
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;

        // 시스템 초기화
        this.leaderboard = new LeaderboardService();
        this.skillSystem = new SkillSystem();
        this.projectileSystem = new ProjectileSystem();

        // 플레이어 이름
        this.playerName = this._loadName();
        this.nameChars = this.playerName ? this.playerName.split('') : [];
        this.customization = this._loadCustomization();
        this.state = this.playerName ? GameState.TITLE : GameState.NAME_INPUT;

        // 스테이지 관련
        this.currentStage = 0;
        this.clearedStages = this._loadProgress();
        this.stageScores = [];
        this.titleBlink = 0;

        // 아레나 좌표
        this.arenaLeft = 20;
        this.arenaTop = 40;
        this.arenaWidth = 280;
        this.arenaHeight = 380;

        // 플레이어 상태
        this.player = null;

        // 불리 배열
        this.bullies = [];

        // 천사/별 상태
        this.angel = null;
        this.angelStar = null;

        // 플로팅 텍스트 배열
        this.floatingTexts = [];

        // 타이머/카운터
        this.stageTimer = 0;
        this.gameOverTimer = 0;
        this.clearTimer = 0;
        this.introTimer = 0;

        // 프롤로그
        this.prologueScene = 0;
        this.prologueCharIndex = 0;
        this.prologueTimer = 0;
        this.prologueTypingSpeed = 50; // 50ms/자

        // 엔딩
        this.endingTimer = 0;
        this.endingPhase = 0;
        this.endingScrollY = 0;

        // 커스터마이즈
        this.customizeCategory = 0;

        // 리더보드 캐시
        this.cachedLeaderboard = [];
        this.cachedHallOfFame = [];
        this.rankingViewTab = 0;
        this.rankingViewData = [];

        // 스프라이트 프리렌더링
        this.SP = this.SCALE;
        this._miniSpriteCache = {};
        this._prerenderSprites();
    }

    // === 스프라이트 프리렌더링 ===
    _prerenderSprites() {
        // 플레이어 (커스터마이즈 기반)
        this._rebuildPlayerSprite();

        // 불리 타입들
        this.bullyFrames = BULLY_TYPES.map(bt => SpriteRenderer.prerenderSprite(bt, this.SP));

        // 투사체 스프라이트
        this.projectileFrames = {};
        for (const [key, sprite] of Object.entries(PROJECTILE_SPRITE_MAP)) {
            this.projectileFrames[key] = SpriteRenderer.prerenderSprite(sprite, this.SP);
        }

        // 천사
        this.angelFrames = SpriteRenderer.prerenderSprite(typeof ANGEL_SPRITE !== 'undefined' ? ANGEL_SPRITE : ANGEL, this.SP);

        // 봉구
        this.bongguFrames = SpriteRenderer.prerenderSprite(typeof BONGGU_SPRITE !== 'undefined' ? BONGGU_SPRITE : BONGGU, this.SP);

        // 이펙트/UI
        this.starFrames = SpriteRenderer.prerenderSprite(typeof STAR_ITEM !== 'undefined' ? STAR_ITEM : STAR, this.SP);
        this.heartCanvas = SpriteRenderer.prerenderSprite(typeof HEART_FULL !== 'undefined' ? HEART_FULL : HEART, this.SP)[0];
        this.heartEmptyCanvas = SpriteRenderer.prerenderSprite(HEART_EMPTY, this.SP)[0];
        this.lockCanvas = SpriteRenderer.prerenderSprite(typeof LOCK_ICON !== 'undefined' ? LOCK_ICON : LOCK, this.SP)[0];

        // 무적 오라
        if (typeof INVINCIBLE_AURA !== 'undefined') {
            this.auraFrames = SpriteRenderer.prerenderSprite(INVINCIBLE_AURA, this.SP);
        }
        this.arrowLCanvas = SpriteRenderer.prerenderSprite(ARROW_LEFT, 3)[0];
        this.arrowRCanvas = SpriteRenderer.prerenderSprite(ARROW_RIGHT, 3)[0];

        // 미노 정면 (타이틀/프롤로그용)
        this.minoFrontFrames = SpriteRenderer.prerenderSprite(MINO_FRONT, 3);
        // 커스터마이즈된 정면도 타이틀용으로 준비
        if (this.playerFrontFrames) {
            this.minoFrontLargeFrames = this.playerFrontFrames;
        }

        // 교실 배경 프리렌더
        if (typeof prerenderClassroom === 'function') {
            this.classroomBg = prerenderClassroom(this.WIDTH, this.HEIGHT);
        }
        this.floorTile = SpriteRenderer.prerenderSprite(FLOOR_TILE, this.SP)[0];
    }

    _rebuildPlayerSprite() {
        // 커스터마이즈 적용된 스프라이트 빌드
        const result = buildCharacterSprite(this.customization);
        // 새 API: { front: {sprite, prerendered}, back: {sprite, prerendered}, left, right }
        if (result && result.back && result.back.prerendered) {
            this.playerFrames = result.back.prerendered;
            this.playerFrontFrames = result.front ? result.front.prerendered : this.playerFrames;
            this.playerLeftFrames = result.left ? result.left.prerendered : this.playerFrames;
            this.playerRightFrames = result.right ? result.right.prerendered : this.playerFrames;
            // 미니 스프라이트
            const backSprite = result.back.sprite;
            this.playerMiniFrames = SpriteRenderer.prerenderSprite(backSprite, 1);
        } else if (result && result.frames) {
            // 이전 API 호환 (단일 스프라이트 반환)
            this.playerFrames = SpriteRenderer.prerenderSprite(result, this.SP);
            this.playerMiniFrames = SpriteRenderer.prerenderSprite(result, 1);
        }
    }

    // === 데이터 영속성 ===
    _loadName() { try { return localStorage.getItem('minoDodge_name') || ''; } catch(e) { return ''; } }
    _saveName(n) { try { localStorage.setItem('minoDodge_name', n); } catch(e) {} }
    _loadProgress() { try { const d = localStorage.getItem('minoDodge_cleared'); return d ? JSON.parse(d) : []; } catch(e) { return []; } }
    _saveProgress() { try { localStorage.setItem('minoDodge_cleared', JSON.stringify(this.clearedStages)); } catch(e) {} }
    _loadCustomization() {
        const defaults = { gender: 0, hair: 0, face: 0, body: 0, shirt: 0, pants: 0, shoes: 0 };
        try {
            const d = localStorage.getItem('minoDodge_custom');
            return d ? Object.assign(defaults, JSON.parse(d)) : defaults;
        } catch(e) { return defaults; }
    }
    _saveCustomization() { try { localStorage.setItem('minoDodge_custom', JSON.stringify(this.customization)); } catch(e) {} }
    isStageUnlocked(i) { return i === 0 || this.clearedStages.includes(i - 1); }

    // === 스테이지 시작 ===
    startStage(idx) {
        this.currentStage = idx;
        const stage = STAGES[idx];
        const pw = MAIN_CHARACTER.width * this.SP;
        const ph = MAIN_CHARACTER.height * this.SP;

        // 플레이어 초기화
        this.player = {
            x: this.arenaLeft + this.arenaWidth / 2 - pw / 2,
            y: this.arenaTop + this.arenaHeight / 2 - ph / 2 + 80,
            width: pw,
            height: ph,
            frame: 0,
            frameTimer: 0,
            speed: 120, // px/s
            hp: 3,
            maxHp: 3,
            invincibleTimer: 0,
            score: 0,
            nearMissCount: 0,
            direction: 'front', // 기본 방향: 정면
        };

        // 불리 초기화
        this.bullies = [];
        for (let i = 0; i < stage.bullyCount; i++) {
            const pos = stage.bullyPositions[i] || stage.bullyPositions[0];
            const bullyType = i % BULLY_TYPES.length;
            let bx, by;

            switch (pos.side) {
                case 'top':
                    bx = pos.x - 16;
                    by = this.arenaTop - 10;
                    break;
                case 'bottom':
                    bx = (pos.x || 160) - 16;
                    by = this.arenaTop + this.arenaHeight - 20;
                    break;
                case 'left':
                    bx = this.arenaLeft - 10;
                    by = (pos.y || 150) - 12;
                    break;
                case 'right':
                    bx = this.arenaLeft + this.arenaWidth - 22;
                    by = (pos.y || 150) - 12;
                    break;
                default:
                    bx = pos.x || 100;
                    by = this.arenaTop;
            }

            this.bullies.push({
                x: bx,
                y: by,
                width: BULLY_TYPES[bullyType].width * this.SP,
                height: BULLY_TYPES[bullyType].height * this.SP,
                typeIdx: bullyType,
                frame: 0,
                spawnTimer: Math.random() * stage.spawnInterval,
                currentTaunt: '',
                tauntTimer: 0,
                side: pos.side,
            });
        }

        // 시스템 초기화
        this.projectileSystem.clearAll();
        this.skillSystem.reset();
        this.floatingTexts = [];
        this.angel = null;
        this.angelStar = null;
        this.stageTimer = stage.duration;
        this.state = GameState.STAGE_INTRO;
        this.introTimer = 0;

        Sound.init();
        Sound.stageStart();
        this.input.clearClicks();
    }

    // === 메인 업데이트 ===
    update(dt) {
        switch (this.state) {
            case GameState.NAME_INPUT: this.updateNameInput(); break;
            case GameState.TITLE: this.updateTitle(dt); break;
            case GameState.CHARACTER_CUSTOMIZE: this.updateCustomize(); break;
            case GameState.PROLOGUE: this.updatePrologue(dt); break;
            case GameState.STAGE_SELECT: this.updateStageSelect(); break;
            case GameState.STAGE_INTRO: this.updateStageIntro(dt); break;
            case GameState.PLAYING: this.updatePlaying(dt); break;
            case GameState.GAME_OVER: this.updateGameOver(dt); break;
            case GameState.STAGE_CLEAR: this.updateStageClear(dt); break;
            case GameState.ENDING: this.updateEnding(dt); break;
            case GameState.HALL_OF_FAME: this.updateHallOfFame(dt); break;
            case GameState.RANKING_VIEW: this.updateRankingView(); break;
        }
    }

    // === 이름 입력 ===
    updateNameInput() {
        const click = this.input.getClick();
        if (!click) return;
        const cols = 7, cellW = 38, cellH = 32, startX = 15, startY = 200;
        for (let i = 0; i < 26; i++) {
            const col = i % cols, row = Math.floor(i / cols);
            const cx = startX + col * cellW, cy = startY + row * cellH;
            if (Collision.pointInRect(click.x, click.y, cx, cy, cellW - 4, cellH - 4)) {
                if (this.nameChars.length < 10) this.nameChars.push(String.fromCharCode(65 + i));
                return;
            }
        }
        // 백스페이스
        if (Collision.pointInRect(click.x, click.y, 15, 370, 80, 32)) {
            this.nameChars.pop();
        }
        // OK
        if (Collision.pointInRect(click.x, click.y, 220, 370, 80, 32) && this.nameChars.length >= 2) {
            this.playerName = this.nameChars.join('');
            this._saveName(this.playerName);
            this.state = GameState.CHARACTER_CUSTOMIZE;
            Sound.init();
            Sound.buttonClick();
        }
    }

    // === 타이틀 ===
    updateTitle(dt) {
        this.titleBlink += dt;
        if (this.input.consumeConfirm()) {
            Sound.init(); Sound.buttonClick();
            this.state = GameState.STAGE_SELECT;
            this.input.clearClicks();
            return;
        }
        const click = this.input.getClick();
        if (!click) return;

        // 사운드 토글
        if (this._checkSoundToggle(click)) return;

        const btnW = 100, btnH = 28;
        const cx = this.WIDTH / 2 - btnW / 2;

        // START
        if (Collision.pointInRect(click.x, click.y, cx, 250, btnW, btnH)) {
            Sound.init(); Sound.buttonClick();
            this.state = GameState.STAGE_SELECT;
            this.input.clearClicks();
            return;
        }
        // RANKING
        if (Collision.pointInRect(click.x, click.y, cx, 285, btnW, btnH)) {
            Sound.init(); Sound.buttonClick();
            this._openRankingView();
            return;
        }
        // CUSTOMIZE
        if (Collision.pointInRect(click.x, click.y, cx, 320, btnW, btnH)) {
            Sound.init(); Sound.buttonClick();
            this.state = GameState.CHARACTER_CUSTOMIZE;
            this.customizeCategory = 0;
            this.input.clearClicks();
            return;
        }
        // STORY
        if (Collision.pointInRect(click.x, click.y, cx, 355, btnW, btnH)) {
            Sound.init(); Sound.buttonClick();
            this._startPrologue();
            return;
        }
    }

    // === 커스터마이즈 ===
    updateCustomize() {
        const click = this.input.getClick();
        if (!click) return;

        const categories = CUSTOMIZATION_CATEGORIES;
        // 렌더와 동일한 좌표 사용 (catY=150, catH=35)
        const catY = 150;
        const catH = 35;

        // 카테고리별 좌우 화살표
        for (let i = 0; i < categories.length; i++) {
            const y = catY + i * catH;
            const cat = categories[i];
            const key = cat.key;
            const maxOpt = cat.options.length;

            // 왼쪽 화살표
            if (Collision.pointInRect(click.x, click.y, 130, y + 5, 30, 22)) {
                this.customization[key] = (this.customization[key] - 1 + maxOpt) % maxOpt;
                // 성별 변경 시 hair/face/body 연동
                if (key === 'gender') {
                    const gOpt = GENDER_OPTIONS[this.customization.gender];
                    this.customization.hair = gOpt.hairDefault;
                    this.customization.face = gOpt.faceDefault;
                    this.customization.body = gOpt.bodyDefault;
                }
                this._rebuildPlayerSprite();
                Sound.buttonClick();
                return;
            }
            // 오른쪽 화살표
            if (Collision.pointInRect(click.x, click.y, 250, y + 5, 30, 22)) {
                this.customization[key] = (this.customization[key] + 1) % maxOpt;
                // 성별 변경 시 hair/face/body 연동
                if (key === 'gender') {
                    const gOpt = GENDER_OPTIONS[this.customization.gender];
                    this.customization.hair = gOpt.hairDefault;
                    this.customization.face = gOpt.faceDefault;
                    this.customization.body = gOpt.bodyDefault;
                }
                this._rebuildPlayerSprite();
                Sound.buttonClick();
                return;
            }
        }

        // OK 버튼
        if (Collision.pointInRect(click.x, click.y, this.WIDTH / 2 - 40, 390, 80, 35)) {
            this._saveCustomization();
            Sound.buttonClick();
            this.state = GameState.TITLE;
            this.input.clearClicks();
        }
    }

    // === 프롤로그 ===
    _startPrologue() {
        this.state = GameState.PROLOGUE;
        this.prologueScene = 0;
        this.prologueCharIndex = 0;
        this.prologueTimer = 0;
        this.input.clearClicks();
    }

    updatePrologue(dt) {
        const scene = PROLOGUE_SCENES[this.prologueScene];
        if (!scene) {
            this.state = GameState.STAGE_SELECT;
            this.input.clearClicks();
            return;
        }

        this.prologueTimer += dt;

        // 타이핑 효과
        const targetLen = scene.text.length;
        if (this.prologueCharIndex < targetLen) {
            if (this.prologueTimer >= this.prologueTypingSpeed) {
                this.prologueTimer -= this.prologueTypingSpeed;
                this.prologueCharIndex++;
            }
        }

        // 클릭/터치 처리
        const click = this.input.getClick();
        if (click || this.input.consumeConfirm()) {
            if (this.prologueCharIndex < targetLen) {
                // 타이핑 중이면 즉시 표시
                this.prologueCharIndex = targetLen;
            } else {
                // 다음 씬
                this.prologueScene++;
                this.prologueCharIndex = 0;
                this.prologueTimer = 0;
                if (this.prologueScene >= PROLOGUE_SCENES.length) {
                    this.state = GameState.STAGE_SELECT;
                    this.input.clearClicks();
                }
            }
        }
    }

    // === 스테이지 선택 ===
    updateStageSelect() {
        const click = this.input.getClick();
        if (!click) return;
        if (this._checkSoundToggle(click)) return;

        // 뒤로 버튼
        if (Collision.pointInRect(click.x, click.y, 10, this.HEIGHT - 40, 60, 30)) {
            Sound.buttonClick();
            this.state = GameState.TITLE;
            this.input.clearClicks();
            return;
        }

        const gridX = 25, gridY = 100, cellW = 132, cellH = 58, gap = 6;
        for (let i = 0; i < 10; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const cx = gridX + col * (cellW + gap), cy = gridY + row * (cellH + gap);
            if (Collision.pointInRect(click.x, click.y, cx, cy, cellW, cellH) && this.isStageUnlocked(i)) {
                Sound.buttonClick();
                this.startStage(i);
                return;
            }
        }
    }

    // === 스테이지 인트로 ===
    updateStageIntro(dt) {
        this.introTimer += dt;
        if (this.introTimer >= 2000) {
            this.state = GameState.PLAYING;
            Sound.playBGM(this.currentStage);
        }
        // 클릭으로 스킵
        const click = this.input.getClick();
        if (click && this.introTimer > 500) {
            this.state = GameState.PLAYING;
            Sound.playBGM(this.currentStage);
        }
    }

    // === 메인 플레이 ===
    updatePlaying(dt) {
        const stage = STAGES[this.currentStage];
        const dtSec = dt / 1000;

        // 1. 스테이지 타이머
        this.stageTimer -= dt;
        if (this.stageTimer <= 0) {
            this._stageClear();
            return;
        }

        // 2. 플레이어 이동
        let dx = 0, dy = 0;
        if (this.input.isLeft()) dx -= 1;
        if (this.input.isRight()) dx += 1;
        if (this.input.isUp()) dy -= 1;
        if (this.input.isDown()) dy += 1;

        // 대각선 정규화
        if (dx !== 0 && dy !== 0) {
            const norm = 1 / Math.sqrt(2);
            dx *= norm;
            dy *= norm;
        }

        // 이동 방향에 따라 바라보는 방향 갱신
        if (dy < 0) this.player.direction = 'back';
        else if (dy > 0) this.player.direction = 'front';
        else if (dx < 0) this.player.direction = 'left';
        else if (dx > 0) this.player.direction = 'right';
        // dx=0, dy=0이면 마지막 방향 유지

        this.player.x += dx * this.player.speed * dtSec;
        this.player.y += dy * this.player.speed * dtSec;

        // 아레나 제한
        this.player.x = Math.max(this.arenaLeft, Math.min(this.arenaLeft + this.arenaWidth - this.player.width, this.player.x));
        this.player.y = Math.max(this.arenaTop, Math.min(this.arenaTop + this.arenaHeight - this.player.height, this.player.y));

        // 걷기 애니메이션
        if (dx !== 0 || dy !== 0) {
            this.player.frameTimer += dt;
            if (this.player.frameTimer > 180) {
                this.player.frameTimer -= 180;
                this.player.frame = (this.player.frame + 1) % 3;
            }
        } else {
            this.player.frame = 0;
            this.player.frameTimer = 0;
        }

        // 3. 무적 타이머
        if (this.player.invincibleTimer > 0) {
            this.player.invincibleTimer -= dt;
        }

        // 4. 스킬 시스템 업데이트
        this.skillSystem.update(dt);

        // 5. 스킬 입력 체크
        if (this.input.consumeSkill1()) {
            if (this.skillSystem.activateBonggu()) {
                Sound.skillActivate();
                Sound.bongguBark();
                this.projectileSystem.clearAll();
                this._addFloatingText(this.player.x, this.player.y - 20, '봉구 출동!', '#FFD700', 1500);
            }
        }
        if (this.input.consumeSkill2()) {
            if (this.skillSystem.activateOsoi()) {
                Sound.skillActivate();
                this.player.invincibleTimer = 3000;
                this._addFloatingText(this.player.x, this.player.y - 20, '오소이 무적!', '#88DDFF', 1500);
            }
        }

        // 6. 투사체 스폰
        for (let i = 0; i < this.bullies.length; i++) {
            const bully = this.bullies[i];
            bully.spawnTimer += dt;

            if (bully.spawnTimer >= stage.spawnInterval) {
                bully.spawnTimer -= stage.spawnInterval;

                // 던지기 프레임
                bully.frame = 1;
                setTimeout(() => { if (bully) bully.frame = 0; }, 300);

                // 투사체 타입 랜덤 선택
                const types = stage.projectileTypes;
                const type = types[Math.floor(Math.random() * types.length)];

                // 불리 위치에서 플레이어를 향해 발사
                const bx = bully.x + bully.width / 2;
                const by = bully.y + bully.height / 2;
                const tx = this.player.x + this.player.width / 2;
                const ty = this.player.y + this.player.height / 2;

                this.projectileSystem.spawnProjectile(
                    { x: bx, y: by },
                    { x: tx, y: ty },
                    type,
                    stage.projectileSpeed
                );

                // 버스트 던지기 (8-10스테이지)
                if (stage.burstThrows && Math.random() < 0.3) {
                    setTimeout(() => {
                        const t2 = types[Math.floor(Math.random() * types.length)];
                        this.projectileSystem.spawnProjectile(
                            { x: bx, y: by },
                            { x: tx + (Math.random() - 0.5) * 40, y: ty + (Math.random() - 0.5) * 40 },
                            t2,
                            stage.projectileSpeed * 0.9
                        );
                    }, 200);
                }

                // 불리 멘트 랜덤 표시
                if (Math.random() < 0.25) {
                    bully.currentTaunt = BULLY_TAUNTS[Math.floor(Math.random() * BULLY_TAUNTS.length)];
                    bully.tauntTimer = 2000;
                }
            }

            // 멘트 타이머 감소
            if (bully.tauntTimer > 0) {
                bully.tauntTimer -= dt;
                if (bully.tauntTimer <= 0) {
                    bully.currentTaunt = '';
                }
            }
        }

        // 7. 투사체 업데이트
        this.projectileSystem.updateAll(dt);

        // 8. 충돌 체크
        const projectiles = this.projectileSystem.projectiles;
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];

            // 피격 체크
            if (Collision.check(this.player, p)) {
                if (this.player.invincibleTimer <= 0 && !this.skillSystem.isOsoiActive()) {
                    // 피격!
                    this.player.hp -= 1;
                    this.player.invincibleTimer = 1000;
                    Sound.hit();
                    this._addFloatingText(this.player.x, this.player.y - 10, 'HIT!', '#FF4444', 800);
                    projectiles.splice(i, 1);

                    if (this.player.hp <= 0) {
                        this.state = GameState.GAME_OVER;
                        this.gameOverTimer = 0;
                        Sound.gameOver();
                        return;
                    }
                    continue;
                } else {
                    // 무적 중이면 투사체 그냥 통과
                    projectiles.splice(i, 1);
                    continue;
                }
            }

            // 니어미스 체크
            if (!p.nearMissChecked && Collision.checkNearMiss(this.player, p)) {
                p.nearMissChecked = true;
                this.player.nearMissCount++;
                this.player.score += 50;
                Sound.dodge();

                // 오타쿠 멘트
                const quote = MINO_QUOTES[Math.floor(Math.random() * MINO_QUOTES.length)];
                this._addFloatingText(
                    this.player.x + (Math.random() - 0.5) * 30,
                    this.player.y - 15 - Math.random() * 20,
                    quote,
                    '#FFDD44',
                    1200
                );
            }
        }

        // 9. 천사 친구 랜덤 스폰
        if (!this.angel && Math.random() < stage.angelChance * dtSec) {
            Sound.angelAppear();
            this.angel = {
                x: 30 + Math.random() * (this.WIDTH - 90),
                y: -30,
                width: 14 * this.SP,
                height: 14 * this.SP,
                frame: 0,
                frameTimer: 0,
                vy: 30,
                lifeTimer: 3000,
            };
        }

        // 천사 업데이트
        if (this.angel) {
            this.angel.frameTimer += dt;
            if (this.angel.frameTimer > 300) {
                this.angel.frameTimer -= 300;
                this.angel.frame = (this.angel.frame + 1) % 2;
            }
            this.angel.y += this.angel.vy * dtSec;
            this.angel.lifeTimer -= dt;

            // 별 드롭
            if (!this.angelStar && this.angel.lifeTimer < 2000) {
                this.angelStar = {
                    x: this.angel.x + this.angel.width / 2 - 8,
                    y: this.angel.y + this.angel.height,
                    width: 8 * this.SP,
                    height: 8 * this.SP,
                    frame: 0,
                    frameTimer: 0,
                    vy: 40,
                };
            }

            if (this.angel.lifeTimer <= 0 || this.angel.y > this.HEIGHT) {
                this.angel = null;
            }
        }

        // 별 아이템 업데이트
        if (this.angelStar) {
            this.angelStar.y += this.angelStar.vy * dtSec;
            this.angelStar.frameTimer += dt;
            if (this.angelStar.frameTimer > 200) {
                this.angelStar.frameTimer -= 200;
                this.angelStar.frame = (this.angelStar.frame + 1) % 2;
            }

            if (Collision.check(this.player, this.angelStar)) {
                this.player.score += 200;
                Sound.starGet();
                this._addFloatingText(this.angelStar.x, this.angelStar.y - 10, '+200', '#FFD700', 1000);
                this.angelStar = null;
            } else if (this.angelStar && this.angelStar.y > this.HEIGHT + 20) {
                this.angelStar = null;
            }
        }

        // 10. 플로팅 텍스트 업데이트
        this._updateFloatingTexts(dt);

        // 시간 보너스 점수 (1초당 10점)
        this.player.score += 10 * dtSec;

        this.input.getClick(); // 소비
    }

    // === 스테이지 클리어 ===
    _stageClear() {
        this.state = GameState.STAGE_CLEAR;
        this.clearTimer = 0;
        Sound.stageClear();
        Sound.stopBGM();

        if (!this.clearedStages.includes(this.currentStage)) {
            this.clearedStages.push(this.currentStage);
            this._saveProgress();
        }

        const finalScore = Math.floor(this.player ? this.player.score : 0);
        this.stageScores[this.currentStage] = finalScore;

        // 리더보드 제출
        this.leaderboard.submitScore(this.currentStage, this.playerName, finalScore, this.customization);
        this.leaderboard.getLeaderboard(this.currentStage).then(lb => { this.cachedLeaderboard = lb; });
        this.cachedLeaderboard = this.leaderboard._getLocal(this.currentStage);
    }

    updateStageClear(dt) {
        this.clearTimer += dt;
        if (this.clearTimer > 1500) {
            const c = this.input.getClick();
            if (c) {
                if (this.currentStage < 9 && Collision.pointInRect(c.x, c.y, this.WIDTH / 2 - 80, 375, 70, 35)) {
                    this.startStage(this.currentStage + 1);
                } else if (this.currentStage === 9 && Collision.pointInRect(c.x, c.y, this.WIDTH / 2 - 80, 375, 70, 35)) {
                    this._startEnding();
                } else if (Collision.pointInRect(c.x, c.y, this.WIDTH / 2 + 10, 375, 70, 35)) {
                    this.state = GameState.STAGE_SELECT;
                    this.input.clearClicks();
                }
            } else if (this.input.consumeConfirm()) {
                if (this.currentStage < 9) this.startStage(this.currentStage + 1);
                else this._startEnding();
            }
        }
    }

    // === 게임 오버 ===
    updateGameOver(dt) {
        this.gameOverTimer += dt;
        Sound.stopBGM();
        if (this.gameOverTimer > 1000) {
            const c = this.input.getClick();
            if (c) {
                if (Collision.pointInRect(c.x, c.y, this.WIDTH / 2 - 80, 310, 70, 35)) {
                    this.startStage(this.currentStage);
                } else if (Collision.pointInRect(c.x, c.y, this.WIDTH / 2 + 10, 310, 70, 35)) {
                    this.state = GameState.STAGE_SELECT;
                    this.input.clearClicks();
                }
            } else if (this.input.consumeConfirm()) {
                this.startStage(this.currentStage);
            }
        }
    }

    // === 엔딩 ===
    _startEnding() {
        this.state = GameState.ENDING;
        this.endingTimer = 0;
        this.endingPhase = 0;
        this.endingScrollY = 0;
        const totalScore = this.stageScores.reduce((sum, s) => sum + (s || 0), 0);
        this.leaderboard.submitHallOfFame(this.playerName, totalScore, this.customization);
        this.leaderboard.getHallOfFame().then(lb => { this.cachedHallOfFame = lb; });
        this.cachedHallOfFame = this.leaderboard._getTotalLocal();
        Sound.stageClear();
    }

    updateEnding(dt) {
        this.endingTimer += dt;

        if (this.endingPhase < ENDING_SCENES.length) {
            // 엔딩 씬 순차 표시
            const scene = ENDING_SCENES[this.endingPhase];
            if (this.endingTimer > scene.duration) {
                this.endingPhase++;
                this.endingTimer = 0;
            }
            const c = this.input.getClick();
            if (c) {
                this.endingPhase++;
                this.endingTimer = 0;
            }
        } else if (this.endingPhase === ENDING_SCENES.length) {
            // 크레딧 스크롤
            this.endingScrollY += dt * 0.03;
            const c = this.input.getClick();
            if ((c && this.endingTimer > 2000) || this.endingTimer > 15000) {
                this.endingPhase++;
                this.endingTimer = 0;
            }
        } else {
            // 명예의 전당으로
            this.state = GameState.HALL_OF_FAME;
            this.endingTimer = 0;
        }
    }

    // === 명예의 전당 ===
    updateHallOfFame(dt) {
        this.endingTimer += dt;
        if (this.endingTimer > 1500) {
            const c = this.input.getClick();
            if (c) {
                this.state = GameState.TITLE;
                this.titleBlink = 0;
                this.stageScores = [];
                this.input.clearClicks();
            }
        }
    }

    // === 랭킹 뷰 ===
    _openRankingView() {
        this.state = GameState.RANKING_VIEW;
        this.rankingViewTab = 0;
        this.rankingViewData = [];
        this.leaderboard.getLeaderboard(0).then(d => { this.rankingViewData = d; });
        this.rankingViewData = this.leaderboard._getLocal(0);
        this.input.clearClicks();
    }

    updateRankingView() {
        const click = this.input.getClick();
        if (!click) return;

        // 뒤로
        if (Collision.pointInRect(click.x, click.y, 10, this.HEIGHT - 40, 60, 30)) {
            Sound.buttonClick();
            this.state = GameState.TITLE;
            this.input.clearClicks();
            return;
        }

        // 탭 전환 (좌우 화살표)
        if (Collision.pointInRect(click.x, click.y, 20, 55, 30, 25)) {
            this.rankingViewTab = (this.rankingViewTab - 1 + 11) % 11;
            this._fetchRankingTab();
            Sound.buttonClick();
        }
        if (Collision.pointInRect(click.x, click.y, this.WIDTH - 50, 55, 30, 25)) {
            this.rankingViewTab = (this.rankingViewTab + 1) % 11;
            this._fetchRankingTab();
            Sound.buttonClick();
        }
    }

    _fetchRankingTab() {
        if (this.rankingViewTab < 10) {
            this.leaderboard.getLeaderboard(this.rankingViewTab).then(d => { this.rankingViewData = d; });
            this.rankingViewData = this.leaderboard._getLocal(this.rankingViewTab);
        } else {
            this.leaderboard.getHallOfFame().then(d => { this.rankingViewData = d; });
            this.rankingViewData = this.leaderboard._getTotalLocal();
        }
    }

    // === 사운드 토글 ===
    _checkSoundToggle(click) {
        if (Collision.pointInRect(click.x, click.y, this.WIDTH - 40, 5, 35, 22)) {
            Sound.init(); Sound.toggle();
            return true;
        }
        return false;
    }

    // === 플로팅 텍스트 ===
    _addFloatingText(x, y, text, color, duration) {
        this.floatingTexts.push({
            x, y, text, color,
            alpha: 1,
            duration: duration || 1000,
            elapsed: 0,
        });
    }

    _updateFloatingTexts(dt) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.elapsed += dt;
            ft.y -= 30 * (dt / 1000); // 위로 떠오름
            ft.alpha = 1 - ft.elapsed / ft.duration;
            if (ft.elapsed >= ft.duration) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    // ============================================================
    // 렌더링
    // ============================================================
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        switch (this.state) {
            case GameState.NAME_INPUT: this.renderNameInput(ctx); break;
            case GameState.TITLE: this.renderTitle(ctx); break;
            case GameState.CHARACTER_CUSTOMIZE: this.renderCustomize(ctx); break;
            case GameState.PROLOGUE: this.renderPrologue(ctx); break;
            case GameState.STAGE_SELECT: this.renderStageSelect(ctx); break;
            case GameState.STAGE_INTRO: this.renderStageIntro(ctx); break;
            case GameState.PLAYING: this.renderPlaying(ctx); break;
            case GameState.GAME_OVER: this.renderGameOver(ctx); break;
            case GameState.STAGE_CLEAR: this.renderStageClear(ctx); break;
            case GameState.ENDING: this.renderEnding(ctx); break;
            case GameState.HALL_OF_FAME: this.renderHallOfFame(ctx); break;
            case GameState.RANKING_VIEW: this.renderRankingView(ctx); break;
        }
    }

    // --- 이름 입력 렌더 ---
    renderNameInput(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // 타이틀
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('이름을 입력하세요', this.WIDTH / 2, 80);

        // 입력된 이름
        ctx.fillStyle = '#333355';
        ctx.fillRect(this.WIDTH / 2 - 80, 120, 160, 40);
        ctx.strokeStyle = '#6677AA';
        ctx.strokeRect(this.WIDTH / 2 - 80, 120, 160, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(this.nameChars.join('') + (Math.floor(Date.now() / 500) % 2 ? '_' : ''), this.WIDTH / 2, 147);

        // 알파벳 그리드
        const cols = 7, cellW = 38, cellH = 32, startX = 15, startY = 200;
        ctx.font = 'bold 14px monospace';
        for (let i = 0; i < 26; i++) {
            const col = i % cols, row = Math.floor(i / cols);
            const cx = startX + col * cellW, cy = startY + row * cellH;
            ctx.fillStyle = '#2A2A4A';
            ctx.fillRect(cx, cy, cellW - 4, cellH - 4);
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(String.fromCharCode(65 + i), cx + (cellW - 4) / 2, cy + 22);
        }

        // 백스페이스
        ctx.fillStyle = '#553333';
        ctx.fillRect(15, 370, 80, 32);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('< DEL', 55, 391);

        // OK
        ctx.fillStyle = this.nameChars.length >= 2 ? '#335533' : '#333333';
        ctx.fillRect(220, 370, 80, 32);
        ctx.fillStyle = this.nameChars.length >= 2 ? '#FFFFFF' : '#666666';
        ctx.fillText('OK >', 260, 391);

        ctx.textAlign = 'left';
    }

    // --- 타이틀 렌더 ---
    renderTitle(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // 캐릭터 표시
        if (this.minoFrontFrames && this.minoFrontFrames[0]) {
            const frame = this.minoFrontFrames[0];
            ctx.drawImage(frame, this.WIDTH / 2 - frame.width / 2, 60);
        }

        // 타이틀 텍스트
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('미노, 모든 것을 피한다!', this.WIDTH / 2, 190);

        ctx.fillStyle = '#AAAAAA';
        ctx.font = '10px monospace';
        ctx.fillText('MINO DODGES EVERYTHING', this.WIDTH / 2, 210);

        // 플레이어 이름
        ctx.fillStyle = '#88AADD';
        ctx.font = '12px monospace';
        ctx.fillText('Player: ' + this.playerName, this.WIDTH / 2, 235);

        // 버튼들
        const btnW = 100, btnH = 28;
        const cx = this.WIDTH / 2 - btnW / 2;
        const buttons = [
            { y: 250, text: 'START', color: '#445566' },
            { y: 285, text: 'RANKING', color: '#445566' },
            { y: 320, text: 'CUSTOMIZE', color: '#445566' },
            { y: 355, text: 'STORY', color: '#445566' },
        ];

        ctx.font = 'bold 12px monospace';
        for (const btn of buttons) {
            ctx.fillStyle = btn.color;
            ctx.fillRect(cx, btn.y, btnW, btnH);
            ctx.strokeStyle = '#667788';
            ctx.strokeRect(cx, btn.y, btnW, btnH);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(btn.text, this.WIDTH / 2, btn.y + 18);
        }

        // 깜빡이는 안내 텍스트
        if (Math.floor(this.titleBlink / 500) % 2 === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '10px monospace';
            ctx.fillText('Tap or Press Enter', this.WIDTH / 2, 400);
        }

        // 사운드 토글
        this._renderSoundToggle(ctx);

        ctx.textAlign = 'left';
    }

    // --- 커스터마이즈 렌더 ---
    renderCustomize(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('캐릭터 꾸미기', this.WIDTH / 2, 30);

        // 프리뷰 (정면 프레임 사용, 없으면 뒷모습 폴백)
        const previewFrames = this.playerFrontFrames || this.playerFrames;
        if (previewFrames && previewFrames[0]) {
            const frame = previewFrames[0];
            const previewScale = 4;
            const pw = MAIN_CHARACTER.width * previewScale;
            const ph = MAIN_CHARACTER.height * previewScale;
            // 스케일된 프리뷰를 그리기
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(frame, 0, 0, frame.width, frame.height,
                this.WIDTH / 2 - pw / 2, 40, pw, ph);
        }

        // 카테고리 리스트
        const categories = CUSTOMIZATION_CATEGORIES;
        const catY = 150;
        const catH = 35;

        ctx.font = '11px monospace';
        for (let i = 0; i < categories.length; i++) {
            const y = catY + i * catH;
            const cat = categories[i];
            const key = cat.key;
            const val = this.customization[key] || 0;
            const optName = cat.options[val].name;

            // 카테고리명
            ctx.fillStyle = '#AAAACC';
            ctx.textAlign = 'left';
            ctx.fillText(cat.name, 20, y + 18);

            // 현재 값
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(optName, 200, y + 18);

            // 좌우 화살표
            ctx.fillStyle = '#445566';
            ctx.fillRect(130, y + 5, 30, 22);
            ctx.fillRect(250, y + 5, 30, 22);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('<', 145, y + 20);
            ctx.fillText('>', 265, y + 20);
        }

        // OK 버튼
        ctx.fillStyle = '#335533';
        ctx.fillRect(this.WIDTH / 2 - 40, 390, 80, 35);
        ctx.strokeStyle = '#55AA55';
        ctx.strokeRect(this.WIDTH / 2 - 40, 390, 80, 35);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OK', this.WIDTH / 2, 413);

        ctx.textAlign = 'left';
    }

    // --- 프롤로그 렌더 ---
    renderPrologue(ctx) {
        const scene = PROLOGUE_SCENES[this.prologueScene];
        if (!scene) return;

        ctx.fillStyle = scene.bgColor || scene.bg || '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // 도트 일러스트가 있으면 렌더
        if (scene.illustration) {
            const illust = scene.illustration;
            const scale = 4;
            const iw = illust.width * scale;
            const ih = illust.height * scale;
            const ix = (this.WIDTH - iw) / 2;
            const iy = 40;

            // 캐시된 프리렌더 사용
            if (!this._prologueIllustCache) this._prologueIllustCache = {};
            if (!this._prologueIllustCache[this.prologueScene]) {
                this._prologueIllustCache[this.prologueScene] =
                    SpriteRenderer.prerenderSprite(illust, scale)[0];
            }
            const illustCanvas = this._prologueIllustCache[this.prologueScene];
            if (illustCanvas) {
                ctx.drawImage(illustCanvas, ix, iy);
            }
        } else {
            // 일러스트 없으면 미노 캐릭터 표시
            if (this.minoFrontFrames && this.minoFrontFrames[0]) {
                ctx.drawImage(this.minoFrontFrames[0], this.WIDTH / 2 - 30, 100);
            }
        }

        // 텍스트 (타이핑 효과)
        const displayText = scene.text.substring(0, this.prologueCharIndex);
        const lines = displayText.split('\n');

        ctx.textAlign = 'center';

        // 텍스트 배경 반투명 박스
        const textY = scene.illustration ? 200 : 280;
        if (displayText.length > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(10, textY - 18, this.WIDTH - 20, lines.length * 24 + 16);
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '13px monospace';

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], this.WIDTH / 2, textY + i * 24);
        }

        // 안내
        if (this.prologueCharIndex >= scene.text.length) {
            if (Math.floor(Date.now() / 500) % 2 === 0) {
                ctx.fillStyle = '#888888';
                ctx.font = '10px monospace';
                ctx.fillText('탭하여 계속...', this.WIDTH / 2, 420);
            }
        }

        // 씬 번호
        ctx.fillStyle = '#555555';
        ctx.font = '10px monospace';
        ctx.fillText((this.prologueScene + 1) + '/' + PROLOGUE_SCENES.length, this.WIDTH / 2, this.HEIGHT - 20);

        ctx.textAlign = 'left';
    }

    // --- 스테이지 선택 렌더 ---
    renderStageSelect(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('스테이지 선택', this.WIDTH / 2, 40);

        ctx.fillStyle = '#88AADD';
        ctx.font = '11px monospace';
        ctx.fillText('Player: ' + this.playerName, this.WIDTH / 2, 65);

        const gridX = 25, gridY = 100, cellW = 132, cellH = 58, gap = 6;

        for (let i = 0; i < 10; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const cx = gridX + col * (cellW + gap), cy = gridY + row * (cellH + gap);
            const unlocked = this.isStageUnlocked(i);
            const cleared = this.clearedStages.includes(i);

            ctx.fillStyle = unlocked ? (cleared ? '#2A4A2A' : '#2A2A4A') : '#222222';
            ctx.fillRect(cx, cy, cellW, cellH);
            ctx.strokeStyle = unlocked ? (cleared ? '#55AA55' : '#5566AA') : '#333333';
            ctx.strokeRect(cx, cy, cellW, cellH);

            if (unlocked) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(STAGES[i].name, cx + cellW / 2, cy + 20);
                ctx.fillStyle = '#AAAAAA';
                ctx.font = '10px monospace';
                ctx.fillText(STAGES[i].subtitle, cx + cellW / 2, cy + 38);
                if (cleared) {
                    ctx.fillStyle = '#55FF55';
                    ctx.font = '9px monospace';
                    ctx.fillText('CLEAR', cx + cellW / 2, cy + 52);
                }
            } else {
                // 자물쇠
                if (this.lockCanvas) {
                    ctx.drawImage(this.lockCanvas, cx + cellW / 2 - 8, cy + cellH / 2 - 10);
                }
            }
        }

        // 뒤로
        ctx.fillStyle = '#553333';
        ctx.fillRect(10, this.HEIGHT - 40, 60, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('< BACK', 40, this.HEIGHT - 21);

        this._renderSoundToggle(ctx);
        ctx.textAlign = 'left';
    }

    // --- 스테이지 인트로 렌더 ---
    renderStageIntro(ctx) {
        // 어두운 배경으로 텍스트 대비 확보
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const stage = STAGES[this.currentStage];
        const alpha = Math.min(1, this.introTimer / 500);

        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 스테이지 이름 — 큰 노란 글씨 + 외곽선
        drawOutlinedText(ctx, stage.name, this.WIDTH / 2, this.HEIGHT / 2 - 20,
            '#FFD700', '#000000', 'bold 20px monospace');

        // 서브타이틀 — 흰색 + 외곽선
        drawOutlinedText(ctx, stage.subtitle, this.WIDTH / 2, this.HEIGHT / 2 + 15,
            '#FFFFFF', '#000000', 'bold 14px monospace');

        // "준비하세요..." — 밝은 초록 + 깜빡임
        const blinkAlpha = (Math.sin(Date.now() / 300) + 1) / 2;
        ctx.globalAlpha = alpha * (0.4 + blinkAlpha * 0.6);
        drawOutlinedText(ctx, '준비하세요...', this.WIDTH / 2, this.HEIGHT / 2 + 50,
            '#44FF88', '#000000', 'bold 12px monospace');

        ctx.globalAlpha = 1;
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }

    // --- 메인 플레이 렌더 ---
    renderPlaying(ctx) {
        // 교실 배경
        if (this.classroomBg) {
            ctx.drawImage(this.classroomBg, 0, 0);
        } else {
            ctx.fillStyle = '#2A2A3A';
            ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
            // 아레나 바닥 타일
            ctx.fillStyle = '#C8B896';
            ctx.fillRect(this.arenaLeft, this.arenaTop, this.arenaWidth, this.arenaHeight);
            if (this.floorTile) {
                const tw = this.floorTile.width;
                const th = this.floorTile.height;
                for (let ty = this.arenaTop; ty < this.arenaTop + this.arenaHeight; ty += th) {
                    for (let tx = this.arenaLeft; tx < this.arenaLeft + this.arenaWidth; tx += tw) {
                        ctx.drawImage(this.floorTile, tx, ty);
                    }
                }
            }
        }

        // 아레나 테두리
        ctx.strokeStyle = '#666644';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.arenaLeft, this.arenaTop, this.arenaWidth, this.arenaHeight);
        ctx.lineWidth = 1;

        // 불리 렌더
        for (const bully of this.bullies) {
            const frames = this.bullyFrames[bully.typeIdx];
            if (frames && frames[bully.frame]) {
                ctx.drawImage(frames[bully.frame], bully.x, bully.y);
            }

            // 말풍선
            if (bully.currentTaunt && bully.tauntTimer > 0) {
                this._renderSpeechBubble(ctx, bully.x + bully.width / 2, bully.y - 5, bully.currentTaunt);
            }
        }

        // 투사체 렌더
        for (const p of this.projectileSystem.projectiles) {
            const frames = this.projectileFrames[p.type];
            if (frames) {
                const frameIdx = p.frame % frames.length;
                ctx.drawImage(frames[frameIdx], p.x, p.y);
            }
        }

        // 천사 렌더
        if (this.angel && this.angelFrames) {
            ctx.drawImage(this.angelFrames[this.angel.frame], this.angel.x, this.angel.y);
        }

        // 별 아이템 렌더
        if (this.angelStar && this.starFrames) {
            ctx.drawImage(this.starFrames[this.angelStar.frame], this.angelStar.x, this.angelStar.y);
        }

        // 플레이어 렌더 (방향에 따라 프레임 선택)
        if (this.player && this.playerFrames) {
            let dirFrames;
            switch (this.player.direction) {
                case 'front': dirFrames = this.playerFrontFrames; break;
                case 'back':  dirFrames = this.playerFrames; break;
                case 'left':  dirFrames = this.playerLeftFrames; break;
                case 'right': dirFrames = this.playerRightFrames; break;
                default:      dirFrames = this.playerFrontFrames; break;
            }
            // 해당 방향 프레임이 없으면 기본 프레임 폴백
            const activeFrames = dirFrames || this.playerFrames;

            // 무적 깜빡임
            const isInvincible = this.player.invincibleTimer > 0 || this.skillSystem.isOsoiActive();
            if (!isInvincible || Math.floor(Date.now() / 100) % 2 === 0) {
                ctx.drawImage(activeFrames[this.player.frame % activeFrames.length], this.player.x, this.player.y);
            }

            // 무적 오라 이펙트
            if (this.skillSystem.isOsoiActive() && this.auraFrames) {
                const auraFrame = Math.floor(Date.now() / 200) % this.auraFrames.length;
                ctx.globalAlpha = 0.4;
                ctx.drawImage(this.auraFrames[auraFrame],
                    this.player.x + this.player.width / 2 - this.auraFrames[0].width / 2,
                    this.player.y + this.player.height / 2 - this.auraFrames[0].height / 2);
                ctx.globalAlpha = 1;
            }
        }

        // 봉구 애니메이션
        if (this.skillSystem.isBongguActive() && this.bongguFrames) {
            const bongguFrame = Math.floor(Date.now() / 150) % this.bongguFrames.length;
            const bongguProgress = 1 - (this.skillSystem.bongguTimer / this.skillSystem.bongguDuration);
            const bx = -32 + (this.WIDTH + 64) * bongguProgress;
            const by = this.HEIGHT / 2 - 12;
            ctx.drawImage(this.bongguFrames[bongguFrame], bx, by);
        }

        // 플로팅 텍스트
        this._renderFloatingTexts(ctx);

        // HUD
        this._renderHUD(ctx);
    }

    // --- HUD 렌더 ---
    _renderHUD(ctx) {
        const stage = STAGES[this.currentStage];

        // 상단 HUD 배경 바 — 텍스트 가독성 확보
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.WIDTH, 38);

        // HP 하트
        for (let i = 0; i < this.player.maxHp; i++) {
            const hx = 5 + i * 20;
            if (i < this.player.hp) {
                if (this.heartCanvas) ctx.drawImage(this.heartCanvas, hx, 5);
            } else {
                if (this.heartEmptyCanvas) ctx.drawImage(this.heartEmptyCanvas, hx, 5);
            }
        }

        // 스테이지 이름 — 중앙 상단, 흰색 bold + 외곽선
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawOutlinedText(ctx, stage.name, this.WIDTH / 2, 12,
            '#FFFFFF', '#000000', 'bold 11px monospace');

        // 타이머 — 스테이지 이름 아래, 노란색 bold 큰 글씨
        const timeLeft = Math.max(0, Math.ceil(this.stageTimer / 1000));
        const timerColor = timeLeft <= 5 ? '#FF4444' : '#FFEE44';
        drawOutlinedText(ctx, timeLeft + 's', this.WIDTH / 2, 28,
            timerColor, '#000000', 'bold 14px monospace');

        // SCORE — 사운드 토글 왼쪽에 배치 (잘림 방지)
        ctx.textAlign = 'right';
        drawOutlinedText(ctx, 'SCORE: ' + Math.floor(this.player.score), this.WIDTH - 45, 12,
            '#FFEE44', '#000000', 'bold 10px monospace');

        // 니어미스 카운트
        drawOutlinedText(ctx, 'DODGE: ' + this.player.nearMissCount, this.WIDTH - 45, 28,
            '#88FF88', '#000000', 'bold 9px monospace');

        // 하단 HUD 배경 바 — 스킬 버튼 가독성 확보
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, this.HEIGHT - 78, this.WIDTH, 78);

        // 스킬 게이지 — 중앙 하단, 더 넓고 밝은 색상
        const gaugeX = 70;
        const gaugeY = this.HEIGHT - 24;
        const gaugeW = 180;
        const gaugeH = 12;
        const gaugePct = this.skillSystem.getGaugePercent();

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);
        ctx.fillStyle = gaugePct >= 0.6 ? '#44EE44' : (gaugePct >= 0.4 ? '#EEEE44' : '#EE4444');
        ctx.fillRect(gaugeX, gaugeY, gaugeW * gaugePct, gaugeH);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);

        // SP 텍스트 — 게이지 위
        ctx.textAlign = 'center';
        drawOutlinedText(ctx, 'SP: ' + Math.floor(this.skillSystem.gauge), gaugeX + gaugeW / 2, gaugeY - 5,
            '#FFFFFF', '#000000', 'bold 9px monospace');

        // 스킬 버튼 (좌하: 봉구 Q, 우하: 오소이 E) — 크기 키움
        const btnSize = 40;

        // 봉구 버튼 — 밝은 파란 배경, 흰 글씨, 테두리
        const b1x = 5, b1y = this.HEIGHT - 74;
        const canBonggu = this.skillSystem.gauge >= this.skillSystem.bongguCost;
        ctx.fillStyle = canBonggu ? '#CC6633' : '#3a2a2a';
        ctx.fillRect(b1x, b1y, btnSize, btnSize);
        ctx.strokeStyle = canBonggu ? '#FFAA66' : '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(b1x, b1y, btnSize, btnSize);
        ctx.lineWidth = 1;
        ctx.textAlign = 'center';
        drawOutlinedText(ctx, '봉구', b1x + btnSize / 2, b1y + 14,
            canBonggu ? '#FFFFFF' : '#888888', '#000000', 'bold 10px monospace');
        drawOutlinedText(ctx, '[Q]', b1x + btnSize / 2, b1y + 28,
            canBonggu ? '#FFEE88' : '#666666', '#000000', 'bold 9px monospace');
        ctx.fillStyle = canBonggu ? '#FFCC44' : '#555555';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('60SP', b1x + btnSize / 2, b1y + 38);

        // 오소이 버튼 — 밝은 보라 배경, 흰 글씨, 테두리
        const b2x = this.WIDTH - btnSize - 5, b2y = this.HEIGHT - 74;
        const canOsoi = this.skillSystem.gauge >= this.skillSystem.osoiCost;
        ctx.fillStyle = canOsoi ? '#3355AA' : '#2a2a3a';
        ctx.fillRect(b2x, b2y, btnSize, btnSize);
        ctx.strokeStyle = canOsoi ? '#66AAFF' : '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(b2x, b2y, btnSize, btnSize);
        ctx.lineWidth = 1;
        drawOutlinedText(ctx, '오소이', b2x + btnSize / 2, b2y + 14,
            canOsoi ? '#FFFFFF' : '#888888', '#000000', 'bold 10px monospace');
        drawOutlinedText(ctx, '[E]', b2x + btnSize / 2, b2y + 28,
            canOsoi ? '#88DDFF' : '#666666', '#000000', 'bold 9px monospace');
        ctx.fillStyle = canOsoi ? '#66CCFF' : '#555555';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('40SP', b2x + btnSize / 2, b2y + 38);

        // 사운드 토글
        this._renderSoundToggle(ctx);

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }

    // --- 말풍선 렌더 (가독성 개선) ---
    _renderSpeechBubble(ctx, x, y, text) {
        ctx.save();
        ctx.font = 'bold 9px monospace';
        const tw = ctx.measureText(text).width + 12;
        const th = 18;
        const bx = x - tw / 2;
        const by = y - th - 8;

        // 말풍선 본체 — 흰색 배경 + 검은 테두리
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 2;

        // 둥근 사각형
        const r = 4;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + tw - r, by);
        ctx.quadraticCurveTo(bx + tw, by, bx + tw, by + r);
        ctx.lineTo(bx + tw, by + th - r);
        ctx.quadraticCurveTo(bx + tw, by + th, bx + tw - r, by + th);
        // 꼬리 (삼각형)
        ctx.lineTo(x + 5, by + th);
        ctx.lineTo(x, by + th + 6);
        ctx.lineTo(x - 5, by + th);
        ctx.lineTo(bx + r, by + th);
        ctx.quadraticCurveTo(bx, by + th, bx, by + th - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 텍스트 — 검은색
        ctx.fillStyle = '#111111';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, by + th / 2);
        ctx.restore();
    }

    // --- 플로팅 텍스트 렌더 (외곽선 + 크기 개선) ---
    _renderFloatingTexts(ctx) {
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawOutlinedText(ctx, ft.text, ft.x + 20, ft.y,
                ft.color || '#FFEE44', '#000000', 'bold 12px monospace');
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }

    // --- 게임 오버 렌더 ---
    renderGameOver(ctx) {
        // 플레이 화면 위에 오버레이
        this.renderPlaying(ctx);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('GAME OVER', this.WIDTH / 2, this.HEIGHT / 2 - 40);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.fillText('Score: ' + Math.floor(this.player.score), this.WIDTH / 2, this.HEIGHT / 2);
        ctx.fillText('Dodges: ' + this.player.nearMissCount, this.WIDTH / 2, this.HEIGHT / 2 + 25);

        if (this.gameOverTimer > 1000) {
            // RETRY
            ctx.fillStyle = '#445566';
            ctx.fillRect(this.WIDTH / 2 - 80, 310, 70, 35);
            ctx.strokeStyle = '#667788';
            ctx.strokeRect(this.WIDTH / 2 - 80, 310, 70, 35);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('RETRY', this.WIDTH / 2 - 45, 332);

            // STAGE SELECT
            ctx.fillStyle = '#445566';
            ctx.fillRect(this.WIDTH / 2 + 10, 310, 70, 35);
            ctx.strokeStyle = '#667788';
            ctx.strokeRect(this.WIDTH / 2 + 10, 310, 70, 35);
            ctx.fillText('SELECT', this.WIDTH / 2 + 45, 332);
        }

        ctx.textAlign = 'left';
    }

    // --- 스테이지 클리어 렌더 ---
    renderStageClear(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#55FF55';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('STAGE CLEAR!', this.WIDTH / 2, 80);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(STAGES[this.currentStage].name, this.WIDTH / 2, 120);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.fillText('Score: ' + Math.floor(this.player.score), this.WIDTH / 2, 160);
        ctx.fillText('Dodges: ' + this.player.nearMissCount, this.WIDTH / 2, 185);

        // 리더보드 표시
        if (this.cachedLeaderboard.length > 0) {
            ctx.fillStyle = '#AAAAAA';
            ctx.font = '10px monospace';
            ctx.fillText('- LEADERBOARD -', this.WIDTH / 2, 220);

            const maxShow = Math.min(5, this.cachedLeaderboard.length);
            for (let i = 0; i < maxShow; i++) {
                const entry = this.cachedLeaderboard[i];
                ctx.fillStyle = '#CCCCCC';
                ctx.font = '10px monospace';
                const name = entry.name || 'UNKNOWN';
                const score = entry.score || 0;
                ctx.fillText((i + 1) + '. ' + name + ' - ' + score, this.WIDTH / 2, 240 + i * 18);
            }
        }

        if (this.clearTimer > 1500) {
            const nextText = this.currentStage < 9 ? 'NEXT' : 'ENDING';
            ctx.fillStyle = '#445566';
            ctx.fillRect(this.WIDTH / 2 - 80, 375, 70, 35);
            ctx.strokeStyle = '#667788';
            ctx.strokeRect(this.WIDTH / 2 - 80, 375, 70, 35);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(nextText, this.WIDTH / 2 - 45, 397);

            ctx.fillStyle = '#445566';
            ctx.fillRect(this.WIDTH / 2 + 10, 375, 70, 35);
            ctx.strokeStyle = '#667788';
            ctx.strokeRect(this.WIDTH / 2 + 10, 375, 70, 35);
            ctx.fillText('SELECT', this.WIDTH / 2 + 45, 397);
        }

        ctx.textAlign = 'left';
    }

    // --- 엔딩 렌더 ---
    renderEnding(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        if (this.endingPhase < ENDING_SCENES.length) {
            // 엔딩 씬 텍스트
            const scene = ENDING_SCENES[this.endingPhase];
            const alpha = Math.min(1, this.endingTimer / 500);
            ctx.globalAlpha = alpha;

            // 미노 캐릭터
            if (this.minoFrontFrames && this.minoFrontFrames[0]) {
                ctx.drawImage(this.minoFrontFrames[0], this.WIDTH / 2 - 30, 120);
            }

            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '13px monospace';
            const lines = scene.text.split('\n');
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], this.WIDTH / 2, 280 + i * 24);
            }

            ctx.globalAlpha = 1;
        } else if (this.endingPhase === ENDING_SCENES.length) {
            // 크레딧 스크롤
            ctx.textAlign = 'center';
            let creditY = this.HEIGHT - this.endingScrollY;

            for (const credit of CREDITS) {
                switch (credit.type) {
                    case 'title':
                        ctx.fillStyle = '#FFD700';
                        ctx.font = 'bold 16px monospace';
                        ctx.fillText(credit.text, this.WIDTH / 2, creditY);
                        creditY += 30;
                        break;
                    case 'role':
                        ctx.fillStyle = '#88AADD';
                        ctx.font = '11px monospace';
                        ctx.fillText(credit.text, this.WIDTH / 2, creditY);
                        creditY += 18;
                        break;
                    case 'name':
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = '12px monospace';
                        ctx.fillText(credit.text, this.WIDTH / 2, creditY);
                        creditY += 20;
                        break;
                    case 'spacer':
                        creditY += 20;
                        break;
                }
            }

            // 스킵 안내
            ctx.fillStyle = '#666666';
            ctx.font = '9px monospace';
            ctx.fillText('탭하여 건너뛰기', this.WIDTH / 2, this.HEIGHT - 20);
        }

        ctx.textAlign = 'left';
    }

    // --- 명예의 전당 렌더 ---
    renderHallOfFame(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('HALL OF FAME', this.WIDTH / 2, 50);

        // 토탈 스코어
        const totalScore = this.stageScores.reduce((sum, s) => sum + (s || 0), 0);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Total Score: ' + totalScore, this.WIDTH / 2, 85);

        // 리더보드
        if (this.cachedHallOfFame.length > 0) {
            ctx.fillStyle = '#AAAAAA';
            ctx.font = '10px monospace';
            ctx.fillText('- TOP PLAYERS -', this.WIDTH / 2, 120);

            const maxShow = Math.min(10, this.cachedHallOfFame.length);
            for (let i = 0; i < maxShow; i++) {
                const entry = this.cachedHallOfFame[i];
                ctx.fillStyle = i === 0 ? '#FFD700' : (i === 1 ? '#CCCCCC' : (i === 2 ? '#CC8844' : '#999999'));
                ctx.font = '10px monospace';
                const name = entry.name || 'UNKNOWN';
                const score = entry.totalScore || 0;
                ctx.fillText((i + 1) + '. ' + name + ' - ' + score, this.WIDTH / 2, 145 + i * 22);
            }
        }

        if (this.endingTimer > 1500) {
            ctx.fillStyle = '#888888';
            ctx.font = '10px monospace';
            ctx.fillText('탭하여 타이틀로', this.WIDTH / 2, this.HEIGHT - 40);
        }

        ctx.textAlign = 'left';
    }

    // --- 랭킹 뷰 렌더 ---
    renderRankingView(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('RANKING', this.WIDTH / 2, 30);

        // 탭 표시
        const tabName = this.rankingViewTab < 10
            ? STAGES[this.rankingViewTab].name
            : 'TOTAL';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(tabName, this.WIDTH / 2, 65);

        // 좌우 화살표
        ctx.fillStyle = '#445566';
        ctx.fillRect(20, 55, 30, 20);
        ctx.fillRect(this.WIDTH - 50, 55, 30, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('<', 35, 70);
        ctx.fillText('>', this.WIDTH - 35, 70);

        // 리더보드 데이터
        if (this.rankingViewData.length > 0) {
            const maxShow = Math.min(15, this.rankingViewData.length);
            for (let i = 0; i < maxShow; i++) {
                const entry = this.rankingViewData[i];
                const name = entry.name || 'UNKNOWN';
                const score = entry.score || entry.totalScore || 0;
                ctx.fillStyle = i === 0 ? '#FFD700' : (i < 3 ? '#CCCCCC' : '#999999');
                ctx.font = '10px monospace';
                ctx.fillText((i + 1) + '. ' + name + '  ' + score, this.WIDTH / 2, 100 + i * 20);
            }
        } else {
            ctx.fillStyle = '#666666';
            ctx.font = '11px monospace';
            ctx.fillText('기록 없음', this.WIDTH / 2, 180);
        }

        // 뒤로
        ctx.fillStyle = '#553333';
        ctx.fillRect(10, this.HEIGHT - 40, 60, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('< BACK', 40, this.HEIGHT - 21);

        ctx.textAlign = 'left';
    }

    // --- 사운드 토글 버튼 렌더 ---
    _renderSoundToggle(ctx) {
        const x = this.WIDTH - 38, y = 6, w = 33, h = 20;
        ctx.fillStyle = Sound.enabled ? '#225522' : '#552222';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = Sound.enabled ? '#44AA44' : '#AA4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawOutlinedText(ctx, Sound.enabled ? 'SND' : 'MUTE', x + w / 2, y + h / 2,
            '#FFFFFF', '#000000', 'bold 8px monospace');
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }
}
