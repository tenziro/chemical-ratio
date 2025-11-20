/**
 * (R)atio - 세차용품 희석비 계산기
 * 모듈성, 가독성, 재사용성을 높이기 위해 리팩토링됨.
 */

/**
 * 설정 및 상수
 */
const Config = {
	Selectors: {
		Tabs: {
			HeaderItems: ".tab-header .radio-label",
			Radio: "#contents-tab1",
			Bodies: ".tab-body",
			Line: ".tab-line",
			Radios: 'input[name="calculation"]'
		},
		Inputs: {
			Tab1: {
				Dilution: "#dilutionRatio",
				Volume: "#waterVolume",
				Container: "[data-tab='tab1']"
			},
			Tab2: {
				Dilution: "#dilutionRatio2",
				Volume: "#totalCapacity",
				Container: "[data-tab='tab2']"
			}
		},
		Buttons: {
			Reset: ".btn-reset",
			QuickRatio: ".btn-dilution-ratio, .btn-capacity-ratio",
			ModalClose: ".btn-modal-close",
			Search: ".btn-search",
			Info: ".btn-information",
			ModalDilution: ".btn-modal-dilution"
		},
		Modals: {
			Trigger: "[data-open-modal]",
			Container: ".modal",
			Search: {
				Id: "searchModal",
				Input: "#searchInput",
				List: ".product-list",
				NoData: "#nodata",
				Loading: "#result-data"
			},
			Install: {
				Type: "install"
			}
		},
		QuickArea: {
			Container: ".quick-area",
			Inner: ".inner"
		},
		Graph: {
			Bar: ".graph-bg > div",
			Text: ".graph-item dl dt span:last-child",
			Result: ".graph-item dl dd"
		},
		Alert: {
			Box: ".selected-brand-alert"
		}
	},
	Data: {
		Url: "src/data/data.json",
		StorageKey: "productData",
		InstallPromptKey: "hideInstallModalUntil",
		ExpirationTime: 24 * 60 * 60 * 1000 // 24시간
	},
	Animation: {
		Duration: 1000,
		Ease: "cubic-bezier(0.06, 0.38, 0.13, 1)",
		AlertDuration: 3000,
		AlertFade: 500
	},
	Constants: {
		TabIds: { Tab1: 'tab1', Tab2: 'tab2' },
		Modes: { Water: 'water', Total: 'total' }
	}
};

/**
 * 유틸리티 함수
 */
class Utils {
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

/**
 * 계산기 로직
 * 희석 계산을 위한 순수 로직
 */
class Calculator {
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

/**
 * 데이터 관리자
 * 데이터 가져오기 및 저장 처리
 */
class DataManager {
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

/**
 * UI 관리자
 * DOM 조작 및 이벤트 처리
 */
class UIManager {
	constructor () {
		this.init();
	}

	/**
	 * UI 관리자를 초기화합니다.
	 */
	init() {
		this.cacheElements();
		this.bindEvents();
		this.setupTabs();
		this.checkInstallModal();

		// 초기 설정
		window.addEventListener("resize", () => this.updateQuickAreaScroll());
		this.updateQuickAreaScroll();
	}

	/**
	 * 주요 DOM 요소를 캐싱합니다.
	 */
	cacheElements() {
		this.elements = {
			tabRadios: Utils.selectAll(Config.Selectors.Tabs.Radios),
			tabLine: Utils.select(Config.Selectors.Tabs.Line),
			tabs: Utils.selectAll(Config.Selectors.Tabs.Bodies),
			resetBtns: Utils.selectAll(Config.Selectors.Buttons.Reset),
			quickAreas: Utils.selectAll(`${Config.Selectors.QuickArea.Container} ${Config.Selectors.QuickArea.Inner}`),
			inputs: Utils.selectAll("input[type='tel']"),
			modals: Utils.selectAll(Config.Selectors.Modals.Container),
			alertBox: Utils.select(Config.Selectors.Alert.Box)
		};
	}

	/**
	 * 이벤트 리스너를 바인딩합니다.
	 */
	bindEvents() {
		// 전역 클릭 위임
		document.addEventListener("click", (e) => this.handleGlobalClick(e));

		// 입력 포맷팅 및 계산
		this.elements.inputs.forEach(input => {
			input.addEventListener("input", (e) => this.handleInput(e));
		});

		// 탭 전환
		this.elements.tabRadios.forEach(radio => {
			radio.addEventListener("change", () => this.handleTabChange());
		});

		// 퀵 영역 스크롤
		this.elements.quickAreas.forEach(area => {
			area.addEventListener("scroll", () => this.updateQuickAreaScrollState(area));
		});

		// 검색 입력
		const searchInput = Utils.select(Config.Selectors.Modals.Search.Input);
		if (searchInput) {
			searchInput.addEventListener("keyup", (e) => {
				if (e.key === 'Enter') this.handleSearch(e.target.value);
			});
		}
	}

	/**
	 * 전역 클릭 이벤트를 처리합니다 (위임 패턴).
	 * @param {Event} e - 클릭 이벤트 객체
	 */
	handleGlobalClick(e) {
		const target = e.target;

		// 모달 열기
		const modalTrigger = target.closest(Config.Selectors.Modals.Trigger);
		if (modalTrigger) {
			this.openModal(modalTrigger.dataset.openModal);
			return;
		}

		// 모달 닫기
		const closeBtn = target.closest(Config.Selectors.Buttons.ModalClose);
		if (closeBtn) {
			this.closeModal(closeBtn.closest(Config.Selectors.Modals.Container));
			return;
		}

		// 초기화
		const resetBtn = target.closest(Config.Selectors.Buttons.Reset);
		if (resetBtn) {
			this.resetAll();
			return;
		}

		// 빠른 비율 버튼
		const quickBtn = target.closest(Config.Selectors.Buttons.QuickRatio);
		if (quickBtn) {
			this.handleQuickRatioClick(quickBtn);
			return;
		}

		// 모달 내 희석비 선택
		const dilutionBtn = target.closest(Config.Selectors.Buttons.ModalDilution);
		if (dilutionBtn) {
			this.handleDilutionSelect(dilutionBtn);
			return;
		}
	}

	/**
	 * 탭 초기 설정을 수행합니다.
	 */
	setupTabs() {
		this.handleTabChange();
	}

	/**
	 * 탭 변경 시 UI를 업데이트합니다.
	 */
	handleTabChange() {
		const activeTabId = this.getCurrentTabId();

		this.elements.tabs.forEach(tab => {
			tab.classList.toggle("active", tab.dataset.tab === activeTabId);
		});

		if (this.elements.tabLine) {
			this.elements.tabLine.style.transform = `translateX(${activeTabId === Config.Constants.TabIds.Tab1 ? 0 : 100}%)`;
		}

		this.resetQuickAreaScroll();
		this.resetAll();
	}

	/**
	 * 현재 활성화된 탭 ID를 반환합니다.
	 * @returns {string} 'tab1' 또는 'tab2'
	 */
	getCurrentTabId() {
		return Utils.select(Config.Selectors.Tabs.Radio).checked ? Config.Constants.TabIds.Tab1 : Config.Constants.TabIds.Tab2;
	}

	/**
	 * 입력 필드 변경 이벤트를 처리합니다.
	 * @param {Event} e - 입력 이벤트 객체
	 */
	handleInput(e) {
		const input = e.target;
		let value = Utils.removeCommas(input.value);
		const num = Number(value);

		if (num < 1 && value !== "") {
			input.value = "";
		} else if (Utils.isValidNumber(num)) {
			input.value = Utils.addCommas(num);
		}

		this.updateCalculation();
		this.updateResetButtonState();
	}

	/**
	 * 현재 입력값에 따라 계산을 수행하고 결과를 업데이트합니다.
	 */
	updateCalculation() {
		const tabId = this.getCurrentTabId();
		const isTab1 = tabId === Config.Constants.TabIds.Tab1;

		const selectors = isTab1 ? Config.Selectors.Inputs.Tab1 : Config.Selectors.Inputs.Tab2;
		const ratio = Utils.getNumericValue(selectors.Dilution);
		const volume = Utils.getNumericValue(selectors.Volume);

		if (ratio === null || volume === null) return;

		const result = Calculator.calculate(isTab1 ? Config.Constants.Modes.Water : Config.Constants.Modes.Total, ratio, volume);
		this.renderResults(tabId, result, ratio);
	}

	/**
	 * 계산 결과를 화면에 표시합니다.
	 * @param {string} tabId - 탭 ID
	 * @param {Object} result - 계산 결과
	 * @param {number} ratio - 희석비
	 */
	renderResults(tabId, result, ratio) {
		const container = Utils.select(`[data-tab='${tabId}']`);

		// 텍스트 업데이트
		const chemicalRatioText = container.querySelector(".chemical-ratio");
		const totalRatioText = container.querySelector(".total-ratio");

		if (chemicalRatioText) chemicalRatioText.innerText = `(희석비 - 1:${Utils.formatNumber(ratio)})`;
		if (totalRatioText) {
			totalRatioText.innerText = tabId === Config.Constants.TabIds.Tab1
				? `(전체 용량 - ${Utils.formatNumber(result.total)}ml)`
				: `(물 용량 - ${Utils.formatNumber(result.water)}ml)`;
		}

		// 숫자 애니메이션
		this.animateNumber(container.querySelector(".chemical-result"), result.chemical);
		this.animateNumber(container.querySelector(tabId === Config.Constants.TabIds.Tab1 ? ".water-result" : ".total-result"),
			tabId === Config.Constants.TabIds.Tab1 ? result.water : result.total);

		// 그래프 업데이트
		this.updateGraph(container, result, ratio, tabId);
	}

	/**
	 * 그래프 바를 업데이트합니다.
	 * @param {Element} container - 컨테이너 요소
	 * @param {Object} result - 계산 결과
	 * @param {number} ratio - 희석비
	 * @param {string} tabId - 탭 ID
	 */
	updateGraph(container, result, ratio, tabId) {
		const bars = container.querySelectorAll(Config.Selectors.Graph.Bar);
		if (bars.length < 2) return;

		let chemicalPct, otherPct;
		const totalBase = tabId === Config.Constants.TabIds.Tab1 ? result.water : result.total;

		if (totalBase > 0) {
			const baseChemicalPct = (result.chemical / totalBase) * 100;
			// 시각적 효과를 위해 비율을 조정
			const adjustedPct = baseChemicalPct * 200;
			chemicalPct = Math.min(adjustedPct, 100);
			otherPct = 100;
		} else {
			chemicalPct = 0;
			otherPct = 0;
		}

		const chemicalBar = container.querySelector(tabId === Config.Constants.TabIds.Tab1 ? ".chemical-bar" : ".chemical-bar2");
		const otherBar = container.querySelector(tabId === Config.Constants.TabIds.Tab1 ? ".water-bar" : ".total-bar");

		this.animateBar(otherBar, otherPct);
		this.animateBar(chemicalBar, chemicalPct);
	}

	/**
	 * 그래프 바 애니메이션을 실행합니다.
	 * @param {Element} element - 애니메이션할 요소
	 * @param {number} percentage - 목표 높이 퍼센트
	 */
	animateBar(element, percentage) {
		if (!element) return;

		element.style.transition = 'none';
		element.style.height = '0%';
		element.offsetHeight; // 리플로우 트리거

		element.style.transition = `height ${Config.Animation.Duration}ms ${Config.Animation.Ease}`;
		element.style.willChange = 'height';

		requestAnimationFrame(() => {
			element.style.height = `${percentage}%`;
		});
	}

	/**
	 * 숫자 카운팅 애니메이션을 실행합니다.
	 * @param {Element} element - 표시할 요소
	 * @param {number} target - 목표 값
	 */
	animateNumber(element, target) {
		if (!element) return;
		if (target <= 0) {
			element.textContent = "0ml";
			return;
		}

		const start = performance.now();
		const duration = Config.Animation.Duration;

		const animate = (time) => {
			const timeFraction = (time - start) / duration;
			if (timeFraction > 1) {
				element.textContent = `${Utils.formatNumber(target)}ml`;
				return;
			}

			const progress = 1 - Math.pow(1 - timeFraction, 2); // easeOutQuad
			const current = Math.floor(target * progress);
			element.textContent = `${Utils.formatNumber(current)}ml`;
			requestAnimationFrame(animate);
		};

		requestAnimationFrame(animate);
	}

	/**
	 * 빠른 비율 버튼 클릭을 처리합니다.
	 * @param {Element} button - 클릭된 버튼
	 */
	handleQuickRatioClick(button) {
		const value = button.dataset.value;
		if (!value) return;

		const tabBody = button.closest('.tab-body');
		const tabId = tabBody.dataset.tab;
		const isDilution = button.classList.contains('btn-dilution-ratio');

		const selectors = tabId === Config.Constants.TabIds.Tab1 ? Config.Selectors.Inputs.Tab1 : Config.Selectors.Inputs.Tab2;
		const targetSelector = isDilution ? selectors.Dilution : selectors.Volume;
		const input = Utils.select(targetSelector);

		if (input) {
			const currentVal = parseFloat(Utils.removeCommas(input.value)) || 0;
			const addVal = parseFloat(value);
			const newVal = currentVal + addVal;
			input.value = Utils.addCommas(newVal);

			this.updateCalculation();
			this.updateResetButtonState();
		}
	}

	/**
	 * 모든 퀵 영역의 스크롤 상태를 업데이트합니다.
	 */
	updateQuickAreaScroll() {
		this.elements.quickAreas.forEach(area => this.updateQuickAreaScrollState(area));
	}

	/**
	 * 개별 퀵 영역의 스크롤 상태(그림자 표시 등)를 업데이트합니다.
	 * @param {Element} area - 퀵 영역 요소
	 */
	updateQuickAreaScrollState(area) {
		const parent = area.parentElement;
		if (!parent) return;

		const { scrollWidth, clientWidth, scrollLeft } = area;
		const isScrollable = scrollWidth > clientWidth;
		const isAtEnd = scrollWidth - scrollLeft <= clientWidth + 1;

		parent.classList.toggle("hide-after", !isScrollable || isAtEnd);
	}

	/**
	 * 퀵 영역 스크롤을 초기화합니다.
	 */
	resetQuickAreaScroll() {
		this.elements.quickAreas.forEach(area => {
			area.scrollLeft = 0;
			area.parentElement.classList.remove('hide-after');
			this.updateQuickAreaScrollState(area);
		});
	}

	/**
	 * 초기화 버튼의 활성/비활성 상태를 업데이트합니다.
	 */
	updateResetButtonState() {
		this.elements.resetBtns.forEach(btn => {
			const tab = btn.closest("[data-tab]");
			const inputs = tab.querySelectorAll("input");
			const hasValue = Array.from(inputs).some(input => input.value.trim() !== "");
			btn.disabled = !hasValue;
		});
	}

	/**
	 * 모든 입력과 결과를 초기화합니다.
	 */
	resetAll() {
		this.elements.inputs.forEach(input => input.value = "");

		// 그래프 및 텍스트 초기화
		Utils.selectAll(Config.Selectors.Graph.Bar).forEach(bar => bar.style.height = "0%");
		Utils.selectAll(Config.Selectors.Graph.Result).forEach(dd => dd.textContent = "0ml");
		Utils.selectAll(Config.Selectors.Graph.Text).forEach(span => span.textContent = "");

		this.updateResetButtonState();
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	/**
	 * 모달을 엽니다.
	 * @param {string} type - 모달 타입 ('search', 'install' 등)
	 */
	openModal(type) {
		const modal = Utils.select(`.modal[data-modal-type="${type}"]`);
		if (modal) {
			modal.classList.add("active");
			document.body.classList.add("hidden-scroll");

			if (type === 'search') {
				this.initSearchModal();
			}
		}
	}

	/**
	 * 모달을 닫습니다.
	 * @param {Element} modal - 닫을 모달 요소
	 */
	closeModal(modal) {
		if (!modal) return;
		modal.classList.remove("active");
		document.body.classList.remove("hidden-scroll");

		const type = modal.dataset.modalType;
		if (type === 'search') {
			const input = Utils.select(Config.Selectors.Modals.Search.Input);
			if (input) input.value = '';
		} else if (type === Config.Selectors.Modals.Install.Type) {
			this.deferInstallPrompt();
		}
	}

	/**
	 * 설치 유도 모달 표시 여부를 확인하고 표시합니다.
	 */
	checkInstallModal() {
		if (Utils.isStandalone()) return;
		if (!Utils.isMobile()) return;

		const hideUntil = localStorage.getItem(Config.Data.InstallPromptKey);
		if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
			this.openModal(Config.Selectors.Modals.Install.Type);
		}
	}

	/**
	 * 설치 유도 모달 표시를 일주일간 연기합니다.
	 */
	deferInstallPrompt() {
		const oneWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
		localStorage.setItem(Config.Data.InstallPromptKey, oneWeek.toString());
	}

	/**
	 * 검색 모달을 초기화하고 데이터를 로드합니다.
	 */
	async initSearchModal() {
		const list = Utils.select(Config.Selectors.Modals.Search.List);
		const loading = Utils.select(Config.Selectors.Modals.Search.Loading);
		const noData = Utils.select(Config.Selectors.Modals.Search.NoData);

		if (noData) noData.classList.remove('active');
		if (list) list.style.display = 'none';
		if (loading) loading.classList.add('active');

		try {
			await new Promise(r => setTimeout(r, Config.Animation.AlertFade)); // 인위적 지연

			const data = await DataManager.loadData();
			this.renderProductList(data);
		} catch (e) {
			alert('데이터를 불러오는데 실패했습니다.');
		} finally {
			if (loading) loading.classList.remove('active');
			if (list) list.style.display = 'block';
		}
	}

	/**
	 * 검색어 입력 처리를 수행합니다.
	 * @param {string} term - 검색어
	 */
	async handleSearch(term) {
		const data = await DataManager.loadData();
		const filtered = DataManager.filterData(data, term);
		this.renderProductList(filtered);

		const noData = Utils.select(Config.Selectors.Modals.Search.NoData);
		const list = Utils.select(Config.Selectors.Modals.Search.List);

		const hasResults = filtered.length > 0;
		if (noData) noData.classList.toggle('active', !hasResults);
		if (list) list.style.display = hasResults ? 'block' : 'none';
	}

	/**
	 * 제품 목록을 렌더링합니다.
	 * @param {Array} data - 표시할 제품 데이터 배열
	 */
	renderProductList(data) {
		const list = Utils.select(Config.Selectors.Modals.Search.List);
		if (!list) return;

		list.innerHTML = data.map(product => {
			// XSS 방지를 위해 이스케이프 처리
			const brand = Utils.escapeHtml(product.brand);
			const prodName = Utils.escapeHtml(product.product);
			const label = Utils.escapeHtml(product.label);

			const buttons = Array.isArray(product.dilution)
				? product.dilution.map((d, i) => this.createDilutionBtn(d, product.etc[i])).join('')
				: this.createDilutionBtn(product.dilution, product.etc);

			return `
                <div class="product-item">
                    <p class="brand ${label}">
                        <span><strong>${brand}</strong> - ${prodName}</span>
                    </p>
                    <div class="dilution-buttons">${buttons}</div>
                </div>
            `;
		}).join('');
	}

	/**
	 * 희석비 버튼 HTML을 생성합니다.
	 * @param {number} dilution - 희석비
	 * @param {string} etc - 추가 정보
	 * @returns {string} 버튼 HTML 문자열
	 */
	createDilutionBtn(dilution, etc) {
		const safeEtc = Utils.escapeHtml(etc);
		return `<button type="button" class="btn-modal-dilution" data-value="${dilution}">
            <strong>1:${dilution}</strong> <span>(${safeEtc})</span>
        </button>`;
	}

	/**
	 * 모달에서 희석비 선택 시 처리를 수행합니다.
	 * @param {Element} button - 선택된 버튼
	 */
	handleDilutionSelect(button) {
		const value = button.dataset.value;
		const tabId = this.getCurrentTabId();
		const selector = tabId === Config.Constants.TabIds.Tab1 ? Config.Selectors.Inputs.Tab1.Dilution : Config.Selectors.Inputs.Tab2.Dilution;

		const input = Utils.select(selector);
		if (input) {
			input.value = Utils.addCommas(Number(value));
			this.updateCalculation();
			this.updateResetButtonState();
		}

		this.closeModal(button.closest('.modal'));
		this.showSelectedBrandAlert(button, value);
	}

	/**
	 * 선택된 브랜드 알림을 표시합니다.
	 * @param {Element} button - 선택된 버튼
	 * @param {number} value - 희석비 값
	 */
	showSelectedBrandAlert(button, value) {
		const alertBox = this.elements.alertBox;
		if (!alertBox) return;

		// 기존 타이머가 있다면 취소 (연속 클릭 시 문제 방지)
		if (this.alertTimer) {
			clearTimeout(this.alertTimer);
			alertBox.classList.remove('active');
			alertBox.style.opacity = '0';
		}

		const brandHtml = button.closest('.product-item').querySelector('.brand').innerHTML;

		alertBox.innerHTML = `
            <div class="inner">
                <i class="ti ti-circle-check"></i>
                <div>
                    <span class="text">선택하신 제품은 </span>
                    ${brandHtml}
                    <span class="text">이며,</span>
                    <em>희석비는 <strong>1:${value}</strong>입니다.</em>
                </div>
            </div>
        `;

		// 리플로우를 위해 잠시 대기 후 활성화
		requestAnimationFrame(() => {
			alertBox.classList.add('active');
			alertBox.style.opacity = '1';
		});

		this.alertTimer = setTimeout(() => {
			alertBox.style.transition = `opacity ${Config.Animation.AlertFade}ms`;
			alertBox.style.opacity = '0';

			const onTransitionEnd = () => {
				alertBox.classList.remove('active');
				alertBox.style.transition = '';
				alertBox.removeEventListener('transitionend', onTransitionEnd);
			};
			alertBox.addEventListener('transitionend', onTransitionEnd);
		}, Config.Animation.AlertDuration);
	}
}

/**
 * 앱 초기화
 */
document.addEventListener("DOMContentLoaded", () => {
	new UIManager();
});
