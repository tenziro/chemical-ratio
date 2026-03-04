/**
 * 유틸리티 함수
 */
export class Utils {
	/**
	 * DOM 요소를 선택합니다.
	 * @param {string} selector - CSS 선택자
	 * @param {Element} parent - 검색할 부모 요소 (기본값: document)
	 * @returns {Element} 선택된 요소
	 */
	static select(selector, parent = document) {
		return parent.querySelector(selector);
	}

	/**
	 * 모든 DOM 요소를 선택합니다.
	 * @param {string} selector - CSS 선택자
	 * @param {Element} parent - 검색할 부모 요소 (기본값: document)
	 * @returns {NodeList} 선택된 요소 목록
	 */
	static selectAll(selector, parent = document) {
		return parent.querySelectorAll(selector);
	}

	/**
	 * 숫자를 포맷팅합니다 (최대 소수점 1자리).
	 * @param {number} num - 포맷팅할 숫자
	 * @returns {string} 포맷팅된 문자열
	 */
	static formatNumber(num) {
		return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
	}

	/**
	 * 숫자에 천 단위 콤마를 추가합니다.
	 * @param {number} num - 포맷팅할 숫자
	 * @returns {string} 콤마가 추가된 문자열
	 */
	static addCommas(num) {
		return num.toLocaleString('en-US');
	}

	/**
	 * 문자열에서 콤마를 제거합니다.
	 * @param {string} str - 콤마를 제거할 문자열
	 * @returns {string} 콤마가 제거된 문자열
	 */
	static removeCommas(str) {
		return str.replace(/,/g, '');
	}

	/**
	 * 유효한 숫자인지 확인합니다.
	 * @param {any} value - 확인할 값
	 * @returns {boolean} 유효한 숫자 여부
	 */
	static isValidNumber(value) {
		return typeof value === 'number' && isFinite(value);
	}

	/**
	 * 입력 필드에서 숫자 값을 가져옵니다.
	 * @param {string} selector - 입력 필드 선택자
	 * @returns {number|null} 숫자 값 또는 null
	 */
	static getNumericValue(selector) {
		const input = Utils.select(selector);
		if (!input) return null;
		const value = parseFloat(Utils.removeCommas(input.value));
		return isNaN(value) ? null : value;
	}

	/**
	 * 모바일 디바이스인지 확인합니다.
	 * @returns {boolean} 모바일 여부
	 */
	static isMobile() {
		return /iphone|ipad|android/i.test(navigator.userAgent);
	}

	/**
	 * PWA 스탠드얼론 모드인지 확인합니다.
	 * @returns {boolean} 스탠드얼론 모드 여부
	 */
	static isStandalone() {
		return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
	}

	/**
	 * HTML 문자열을 이스케이프하여 XSS를 방지합니다.
	 * @param {string} str - 입력 문자열
	 * @returns {string} 이스케이프된 문자열
	 */
	static escapeHtml(str) {
		if (!str) return '';
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}
}
