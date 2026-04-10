// 투사체 시스템
// 다양한 이동 패턴: 직선, 포물선, 흔들림

// 투사체 크기 맵
const PROJECTILE_SIZES = {
    'paper_airplane': { w: 10, h: 8 },
    'eraser': { w: 8, h: 8 },
    'chalk': { w: 8, h: 8 },
    'rock': { w: 8, h: 8 },
    'pencil': { w: 8, h: 10 },
    'bread': { w: 10, h: 10 },
    'tissue': { w: 8, h: 8 },
    'cup_ramen': { w: 10, h: 10 },
};

// 이동 패턴 분류
const PROJECTILE_MOVEMENT = {
    'paper_airplane': 'wobble',     // 흔들림형 (sin파)
    'eraser': 'straight',           // 직선형
    'chalk': 'straight',            // 직선형
    'rock': 'straight',             // 직선형
    'pencil': 'straight',           // 직선형 (빠름)
    'bread': 'parabola',            // 포물선형
    'tissue': 'slow_wobble',        // 느린 직선 + 약간 흔들림
    'cup_ramen': 'parabola',        // 포물선형
};

class ProjectileSystem {
    constructor() {
        this.projectiles = [];
    }

    // 투사체 생성
    // bullyPos: 불리 위치 {x, y}
    // targetPos: 목표 위치 {x, y} (보통 플레이어)
    // type: 투사체 종류 문자열
    // speed: 기본 속도
    spawnProjectile(bullyPos, targetPos, type, speed) {
        const size = PROJECTILE_SIZES[type] || { w: 8, h: 8 };
        const SCALE = 2;

        // 방향 벡터 계산
        const dx = targetPos.x - bullyPos.x;
        const dy = targetPos.y - bullyPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;

        // +-15도 랜덤 퍼짐
        const spreadAngle = (Math.random() - 0.5) * (Math.PI / 6); // +-15도
        const baseAngle = Math.atan2(dy, dx);
        const angle = baseAngle + spreadAngle;

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const p = {
            x: bullyPos.x,
            y: bullyPos.y,
            width: size.w * SCALE,
            height: size.h * SCALE,
            vx: vx,
            vy: vy,
            type: type,
            movement: PROJECTILE_MOVEMENT[type] || 'straight',
            speed: speed,
            time: 0,           // 생존 시간
            startX: bullyPos.x,
            startY: bullyPos.y,
            gravity: 0,        // 포물선용
            wobblePhase: Math.random() * Math.PI * 2, // 흔들림 위상
            frame: 0,
            frameTimer: 0,
            nearMissChecked: false, // 니어미스 중복 방지
        };

        this.projectiles.push(p);
        return p;
    }

    // 투사체 업데이트
    updateProjectile(p, dt) {
        const dtSec = dt / 1000;
        p.time += dt;
        p.frameTimer += dt;
        if (p.frameTimer > 200) {
            p.frameTimer -= 200;
            p.frame = (p.frame + 1) % 2;
        }

        switch (p.movement) {
            case 'straight':
                // 직선 이동
                p.x += p.vx * dtSec;
                p.y += p.vy * dtSec;
                break;

            case 'parabola':
                // 포물선 이동 (중력 적용)
                p.gravity += 40 * dtSec; // gravity = 40
                p.x += p.vx * dtSec;
                p.y += p.vy * dtSec + p.gravity * dtSec;
                break;

            case 'wobble':
                // 종이비행기: sin파 흔들림
                p.x += p.vx * dtSec;
                p.y += p.vy * dtSec;
                // 이동 방향에 수직인 방향으로 흔들림
                const wobbleAmp = 15;
                const wobbleFreq = 0.005;
                const perpX = -p.vy / p.speed;
                const perpY = p.vx / p.speed;
                const wobble = Math.sin(p.time * wobbleFreq + p.wobblePhase) * wobbleAmp;
                p.x += perpX * wobble * dtSec * 5;
                p.y += perpY * wobble * dtSec * 5;
                break;

            case 'slow_wobble':
                // 휴지: 느린 직선 + 약간 흔들림
                p.x += p.vx * 0.6 * dtSec;
                p.y += p.vy * 0.6 * dtSec;
                p.x += Math.sin(p.time * 0.003 + p.wobblePhase) * 5 * dtSec;
                break;

            default:
                p.x += p.vx * dtSec;
                p.y += p.vy * dtSec;
                break;
        }
    }

    // 화면 밖 체크
    isOffScreen(p) {
        return p.x < -40 || p.x > 360 || p.y < -40 || p.y > 520;
    }

    // 모든 투사체 업데이트 (화면 밖 제거)
    updateAll(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.updateProjectile(this.projectiles[i], dt);
            if (this.isOffScreen(this.projectiles[i])) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    // 모든 투사체 제거 (봉구 스킬)
    clearAll() {
        this.projectiles = [];
    }

    // 투사체 수
    get count() {
        return this.projectiles.length;
    }
}
