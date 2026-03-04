import { Config } from './Config.js';

/**
 * 계산기 로직
 * 희석 계산을 위한 순수 로직
 */
export class Calculator {
	/**
	 * 모드에 따라 용량을 계산합니다.
	 * @param {string} mode - 계산 모드 ('water' 또는 'total')
	 * @param {number} ratio - 희석비
	 * @param {number} volume - 입력 용량
	 * @returns {Object} 계산된 결과
	 */
	static calculate(mode, ratio, volume) {
		if (ratio <= 0 || volume <= 0) return { chemical: 0, water: 0, total: 0 };

		let chemical, water, total;

		if (mode === Config.Constants.Modes.Water) { // 탭 1: 물 용량 기준
			chemical = volume / ratio;
			water = volume;
			total = chemical + water;
		} else { // 탭 2: 전체 용량 기준
			chemical = volume / (ratio + 1);
			water = volume - chemical;
			total = volume;
		}

		return {
			chemical: this.sanitize(chemical),
			water: this.sanitize(water),
			total: this.sanitize(total)
		};
	}

	/**
	 * 숫자를 안전한 값으로 변환합니다 (무한대/NaN 처리).
	 * @param {number} num - 입력 숫자
	 * @returns {number} 안전한 숫자 (유효하지 않으면 0)
	 */
	static sanitize(num) {
		return isFinite(num) ? num : 0;
	}
}
