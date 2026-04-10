// 스프라이트 렌더러 엔진
// 팔레트 인덱싱 방식 스프라이트 시스템, 성능을 위해 프리렌더링

const SpriteRenderer = {
    // 캔버스에 직접 스프라이트 그리기 (프리렌더링용)
    drawSprite(ctx, sprite, frameIndex, x, y, scale) {
        const frame = sprite.frames[frameIndex % sprite.frames.length];
        for (let row = 0; row < sprite.height; row++) {
            const line = frame[row];
            if (!line) continue;
            for (let col = 0; col < sprite.width; col++) {
                const ch = line[col];
                if (!ch || ch === '0') continue;
                const paletteIndex = parseInt(ch, 16);
                if (paletteIndex === 0 || !sprite.palette[paletteIndex]) continue;
                ctx.fillStyle = sprite.palette[paletteIndex];
                ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
            }
        }
    },

    // 모든 프레임을 오프스크린 캔버스로 프리렌더링
    prerenderSprite(sprite, scale) {
        return sprite.frames.map(frame => {
            const offscreen = document.createElement('canvas');
            offscreen.width = sprite.width * scale;
            offscreen.height = sprite.height * scale;
            const octx = offscreen.getContext('2d');
            octx.imageSmoothingEnabled = false;
            for (let row = 0; row < sprite.height; row++) {
                const line = frame[row];
                if (!line) continue;
                for (let col = 0; col < sprite.width; col++) {
                    const ch = line[col];
                    if (!ch || ch === '0') continue;
                    const paletteIndex = parseInt(ch, 16);
                    if (paletteIndex === 0 || !sprite.palette[paletteIndex]) continue;
                    octx.fillStyle = sprite.palette[paletteIndex];
                    octx.fillRect(col * scale, row * scale, scale, scale);
                }
            }
            return offscreen;
        });
    },

    // 색상 오버라이드를 적용한 프리렌더링 (변형 캐릭터용)
    prerenderSpriteWithColors(sprite, scale, colorOverrides) {
        const modifiedPalette = [...sprite.palette];
        for (const [index, color] of Object.entries(colorOverrides)) {
            modifiedPalette[parseInt(index)] = color;
        }
        const modifiedSprite = { ...sprite, palette: modifiedPalette };
        return this.prerenderSprite(modifiedSprite, scale);
    }
};

// 스프라이트 애니메이터 클래스
class SpriteAnimator {
    constructor(prerenderedFrames, frameDuration) {
        this.frames = prerenderedFrames;
        this.frameDuration = frameDuration; // 프레임당 ms
        this.elapsed = 0;
        this.currentFrame = 0;
    }

    update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.frameDuration) {
            this.elapsed -= this.frameDuration;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.frames[this.currentFrame], x, y);
    }

    reset() {
        this.elapsed = 0;
        this.currentFrame = 0;
    }
}
