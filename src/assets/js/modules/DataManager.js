import { Config } from './Config.js';

/**
 * 데이터 관리자
 * 데이터 가져오기 및 저장 처리
 */
export class DataManager {
	/**
	 * 서버에서 데이터를 가져옵니다.
	 * @returns {Promise<Array>} 데이터 배열
	 */
	static async fetchData() {
		try {
			const response = await fetch(Config.Data.Url);
			if (!response.ok) throw new Error('Network response was not ok');
			return await response.json();
		} catch (error) {
			console.error('Failed to fetch data:', error);
			throw error;
		}
	}

	/**
	 * 로컬 스토리지 또는 서버에서 데이터를 로드합니다.
	 * 만료 시간을 체크하여 데이터 갱신을 수행합니다.
	 * @returns {Promise<Array>} 데이터 배열
	 */
	static async loadData() {
		const storedData = localStorage.getItem(Config.Data.StorageKey);
		const now = Date.now();

		if (storedData) {
			try {
				const parsed = JSON.parse(storedData);
				// 데이터 구조가 { timestamp: number, data: Array } 형태라고 가정하거나
				// 하위 호환성을 위해 체크
				if (parsed.timestamp && (now - parsed.timestamp < Config.Data.ExpirationTime)) {
					return parsed.data;
				}
			} catch (e) {
				console.warn("Data parsing error, fetching new data.");
			}
		}

		// 데이터가 없거나 만료되었거나 파싱 오류 시 새로 가져옴
		const data = await this.fetchData();
		const storageItem = {
			timestamp: now,
			data: data
		};
		localStorage.setItem(Config.Data.StorageKey, JSON.stringify(storageItem));
		return data;
	}

	/**
	 * 검색어로 데이터를 필터링합니다.
	 * @param {Array} data - 전체 데이터
	 * @param {string} term - 검색어
	 * @returns {Array} 필터링된 데이터
	 */
	static filterData(data, term) {
		if (!term) return data;
		const lowerTerm = term.toLowerCase();
		return data.filter(item =>
			item.brand.toLowerCase().includes(lowerTerm) ||
			item.product.toLowerCase().includes(lowerTerm) ||
			(item.label && item.label.toLowerCase().includes(lowerTerm))
		);
	}
}
