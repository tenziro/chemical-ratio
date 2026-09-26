import { Config } from './Config.js';
import { Utils } from './Utils.js';

/**
 * 데이터 관리자
 */
export class DataManager {
	static async fetchData() {
		const response = await fetch(Config.Data.Url);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.json();
	}

	/**
	 * 로컬 스토리지 또는 서버에서 데이터를 로드합니다.
	 * localStorage 사용이 불가능해도 네트워크 경로로 폴백합니다.
	 */
	static async loadData() {
		const stored = Utils.storageGet(Config.Data.StorageKey);
		const now = Date.now();

		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (parsed?.timestamp && now - parsed.timestamp < Config.Data.ExpirationTime) {
					return parsed.data;
				}
			} catch (_) { /* 손상된 캐시는 무시하고 새로 가져옴 */ }
		}

		const data = await this.fetchData();
		Utils.storageSet(Config.Data.StorageKey, JSON.stringify({ timestamp: now, data }));
		return data;
	}

	/**
	 * 브랜드/제품명/라벨/용도(etc) 전방위 검색.
	 */
	static filterData(data, term) {
		const normalized = (term ?? '').trim().toLowerCase();
		if (!normalized) return data;

		return data.filter(item => {
			if (item.brand?.toLowerCase().includes(normalized)) return true;
			if (item.product?.toLowerCase().includes(normalized)) return true;
			if (item.label?.toLowerCase().includes(normalized)) return true;
			if (Array.isArray(item.etc)) {
				return item.etc.some(e => String(e).toLowerCase().includes(normalized));
			}
			return String(item.etc ?? '').toLowerCase().includes(normalized);
		});
	}
}
