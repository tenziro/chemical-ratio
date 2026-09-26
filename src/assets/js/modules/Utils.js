/**
 * 유틸리티 함수
 */
export class Utils {
	static select(selector, parent = document) {
		return parent.querySelector(selector);
	}

	static selectAll(selector, parent = document) {
		return parent.querySelectorAll(selector);
	}

	static formatNumber(num) {
		return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
	}

	static addCommas(num) {
		return num.toLocaleString('en-US');
	}

	static removeCommas(str) {
		return String(str).replace(/,/g, '');
	}

	static isValidNumber(value) {
		return typeof value === 'number' && isFinite(value);
	}

	static getNumericValue(selector) {
		const input = Utils.select(selector);
		if (!input) return null;
		const value = parseFloat(Utils.removeCommas(input.value));
		return isNaN(value) ? null : value;
	}

	/**
	 * 모바일/터치 디바이스 여부를 판단합니다.
	 * iPadOS 13+ Safari가 데스크톱 UA로 위장하는 케이스까지 포괄하기 위해
	 * 포인터 타입과 maxTouchPoints 힌트를 함께 사용합니다.
	 */
	static isMobile() {
		if (/iphone|ipad|ipod|android/i.test(navigator.userAgent)) return true;
		const touchLike = navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent);
		return touchLike || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
	}

	static isStandalone() {
		return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
	}

	static prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	static escapeHtml(str) {
		if (str == null) return '';
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	/**
	 * localStorage 안전 래퍼 — 사생활 모드·쿠키 차단 시 throw되는 것을 방지합니다.
	 */
	static storageGet(key) {
		try {
			return localStorage.getItem(key);
		} catch (_) {
			return null;
		}
	}

	static storageSet(key, value) {
		try {
			localStorage.setItem(key, value);
			return true;
		} catch (_) {
			return false;
		}
	}
}
