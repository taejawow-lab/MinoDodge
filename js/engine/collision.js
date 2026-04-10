// 충돌 감지
// AABB 히트박스 (60% 축소) + 니어미스 감지

const Collision = {
    // 히트박스 비율 - 작을수록 관대함
    HITBOX_RATIO: 0.6,

    // 엔티티의 히트박스 계산 (중앙 기준, 축소된 크기)
    getHitbox(entity, ratio) {
        const r = ratio || this.HITBOX_RATIO;
        const w = entity.width * r;
        const h = entity.height * r;
        const offsetX = (entity.width - w) / 2;
        const offsetY = (entity.height - h) / 2;
        return {
            x: entity.x + offsetX,
            y: entity.y + offsetY,
            width: w,
            height: h
        };
    },

    // 두 엔티티 간 AABB 충돌 체크
    check(entityA, entityB, ratio) {
        const a = this.getHitbox(entityA, ratio);
        const b = this.getHitbox(entityB, ratio);
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    },

    // 니어미스 감지 (히트박스 1.5배 범위 통과)
    // 투사체가 플레이어 근처를 지나갈 때 true
    checkNearMiss(player, projectile, nearRatio) {
        const r = nearRatio || 1.5;
        // 넓은 범위로 체크
        const isNear = this.check(player, projectile, r);
        // 실제 충돌은 아닌지 확인
        const isHit = this.check(player, projectile);
        return isNear && !isHit;
    },

    // 포인트가 사각형 안에 있는지 체크 (UI 클릭용)
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
};
