// 스킬 시스템
// 게이지 0-100, 시간에 따라 자동 충전
// 봉구: 비용 60, 화면 투사체 전부 제거
// 오소이: 비용 40, 3초 무적

class SkillSystem {
    constructor() {
        this.gauge = 0;
        this.maxGauge = 100;
        this.fillRate = 3.33; // 초당 3.33 충전 (약 30초에 풀)

        // 봉구 스킬
        this.bongguActive = false;
        this.bongguTimer = 0;
        this.bongguDuration = 1500; // 1.5초 애니메이션
        this.bongguCost = 60;

        // 오소이 스킬 (무적)
        this.osoiActive = false;
        this.osoiTimer = 0;
        this.osoiDuration = 3000; // 3초 무적
        this.osoiCost = 40;
    }

    // 매 프레임 업데이트
    update(dt) {
        const dtSec = dt / 1000;

        // 게이지 자동 충전
        if (this.gauge < this.maxGauge) {
            this.gauge = Math.min(this.maxGauge, this.gauge + this.fillRate * dtSec);
        }

        // 봉구 타이머
        if (this.bongguActive) {
            this.bongguTimer -= dt;
            if (this.bongguTimer <= 0) {
                this.bongguActive = false;
                this.bongguTimer = 0;
            }
        }

        // 오소이 타이머
        if (this.osoiActive) {
            this.osoiTimer -= dt;
            if (this.osoiTimer <= 0) {
                this.osoiActive = false;
                this.osoiTimer = 0;
            }
        }
    }

    // 봉구 스킬 발동
    activateBonggu() {
        if (this.gauge < this.bongguCost) return false;
        if (this.bongguActive) return false;

        this.gauge -= this.bongguCost;
        this.bongguActive = true;
        this.bongguTimer = this.bongguDuration;
        return true;
    }

    // 오소이 스킬 발동 (무적)
    activateOsoi() {
        if (this.gauge < this.osoiCost) return false;
        if (this.osoiActive) return false;

        this.gauge -= this.osoiCost;
        this.osoiActive = true;
        this.osoiTimer = this.osoiDuration;
        return true;
    }

    // 봉구 활성 여부
    isBongguActive() {
        return this.bongguActive;
    }

    // 오소이(무적) 활성 여부
    isOsoiActive() {
        return this.osoiActive;
    }

    // 게이지 퍼센트
    getGaugePercent() {
        return this.gauge / this.maxGauge;
    }

    // 리셋
    reset() {
        this.gauge = 0;
        this.bongguActive = false;
        this.bongguTimer = 0;
        this.osoiActive = false;
        this.osoiTimer = 0;
    }
}
