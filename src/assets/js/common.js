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
			Radios: 'input[name="calculation"]' // HTML과 일치하도록 선택자 수정
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
			Info: ".btn-information"
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
			Bar: ".graph-bg > div", // 일반 선택자
			Text: ".graph-item dl dt span:last-child",
			Result: ".graph-item dl dd"
		}
	},
	Data: {
		Url: "src/data/data.json",
		StorageKey: "productData",
		InstallPromptKey: "hideInstallModalUntil"
	},
	Animation: {
		Duration: 1000,
		Ease: "cubic-bezier(0.06, 0.38, 0.13, 1)"
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
	 * 이벤트 리스너를 추가합니다.
	 * @param {Element} element - 이벤트를 추가할 요소
	 * @param {string} event - 이벤트 이름
	 * @param {Function} handler - 이벤트 핸들러
	 */
	static addEvent(element, event, handler) {
		if (element) {
			element.addEventListener(event, handler);
		}
	}

	/**
	 * 여러 요소에 이벤트 리스너를 추가합니다.
	 * @param {NodeList|Array} elements - 이벤트를 추가할 요소 목록
	 * @param {string} event - 이벤트 이름
	 * @param {Function} handler - 이벤트 핸들러
	 */
	static addEventAll(elements, event, handler) {
		elements.forEach(el => el.addEventListener(event, handler));
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
}

/**
 * 계산기 로직
 * 희석 계산을 위한 순수 로직
 */
class Calculator {
	/**
	 * 물 용량 기준으로 케미컬 용량을 계산합니다.
	 * @param {number} dilutionRatio - 희석비
	 * @param {number} waterVolume - 물 용량
	 * @returns {Object} 계산된 결과 (케미컬, 물, 전체)
	 */
	static calculateChemical(dilutionRatio, waterVolume) {
		if (!dilutionRatio || !waterVolume) return { chemical: 0, water: 0, total: 0 };

		const chemical = waterVolume / dilutionRatio;
		const total = chemical + waterVolume;

		return {
			chemical: this.sanitize(chemical),
			water: this.sanitize(waterVolume),
			total: this.sanitize(total)
		};
	}

	/**
	 * 전체 용량 기준으로 케미컬 용량을 계산합니다.
	 * @param {number} dilutionRatio - 희석비
	 * @param {number} totalVolume - 전체 용량
	 * @returns {Object} 계산된 결과 (케미컬, 물, 전체)
	 */
	static calculateTotal(dilutionRatio, totalVolume) {
		if (!dilutionRatio || !totalVolume) return { chemical: 0, water: 0, total: 0 };

		const chemical = totalVolume / (dilutionRatio + 1);
		const water = totalVolume - chemical;

		return {
			chemical: this.sanitize(chemical),
			water: this.sanitize(waterVolume), // 물 용량이어야 함
			total: this.sanitize(totalVolume)
		};
	}

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

		if (mode === 'water') { // 탭 1: 물 용량 기준
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
	 * @returns {Promise<Array>} 데이터 배열
	 */
	static async loadData() {
		let data = JSON.parse(localStorage.getItem(Config.Data.StorageKey));
		if (!data) {
			data = await this.fetchData();
			localStorage.setItem(Config.Data.StorageKey, JSON.stringify(data));
		}
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
			item.product.toLowerCase().includes(lowerTerm)
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

		// HTML의 인라인 onclick을 지원하기 위해 showTab을 전역으로 노출
		window.showTab = () => this.handleTabChange();
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
			modals: Utils.selectAll(Config.Selectors.Modals.Container)
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
		const dilutionBtn = target.closest('.btn-modal-dilution');
		if (dilutionBtn) {
			this.handleDilutionSelect(dilutionBtn);
			return;
		}
	}

	/**
	 * 탭 초기 설정을 수행합니다.
	 */
	setupTabs() {
		// 로드 시 올바른 탭이 표시되도록 확인
		this.handleTabChange();
	}

	/**
	 * 탭 변경 시 UI를 업데이트합니다.
	 */
	/**
	 * 탭 변경 시 UI를 업데이트합니다.
	 */
	handleTabChange() {
		const activeTabId = Utils.select("#contents-tab1").checked ? "tab1" : "tab2";

		this.elements.tabs.forEach(tab => {
			tab.classList.toggle("active", tab.dataset.tab === activeTabId);
		});

		if (this.elements.tabLine) {
			this.elements.tabLine.style.transform = `translateX(${activeTabId === "tab1" ? 0 : 100}%)`;
		}

		this.resetQuickAreaScroll();
		this.resetAll();
		// 사용자 상호작용에 의해 트리거된 경우에만 상단으로 스크롤? 
		// 원본 코드는 항상 스크롤했음.
		// window.scrollTo({ top: 0, behavior: "smooth" });
	}

	/**
	 * 현재 활성화된 탭 ID를 반환합니다.
	 * @returns {string} 'tab1' 또는 'tab2'
	 */
	getCurrentTabId() {
		return Utils.select("#contents-tab1").checked ? "tab1" : "tab2";
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
		const isTab1 = tabId === "tab1";

		const selectors = isTab1 ? Config.Selectors.Inputs.Tab1 : Config.Selectors.Inputs.Tab2;
		const ratio = Utils.getNumericValue(selectors.Dilution);
		const volume = Utils.getNumericValue(selectors.Volume);

		if (ratio === null || volume === null) return;

		const result = Calculator.calculate(isTab1 ? 'water' : 'total', ratio, volume);
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
			totalRatioText.innerText = tabId === 'tab1'
				? `(물 용량 - ${Utils.formatNumber(result.water)}ml)`
				: `(전체 용량 - ${Utils.formatNumber(result.total)}ml)`;
		}

		// 숫자 애니메이션
		this.animateNumber(container.querySelector(".chemical-result"), result.chemical);
		this.animateNumber(container.querySelector(tabId === 'tab1' ? ".water-result" : ".total-result"),
			tabId === 'tab1' ? result.water : result.total);

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
		const bars = container.querySelectorAll(".graph-bg > div");
		if (bars.length < 2) return;

		let chemicalPct, otherPct;
		const totalBase = tabId === 'tab1' ? result.water : result.total;

		if (totalBase > 0) {
			const baseChemicalPct = (result.chemical / totalBase) * 100;
			// 시각적 효과를 위해 비율을 조정 (기존 5배 -> 10배로 증가, 낮은 비율도 5배로 증가)
			const adjustedPct = ratio >= 10 ? baseChemicalPct * 200 : baseChemicalPct * 200;
			chemicalPct = Math.min(adjustedPct, 100); // 100%를 넘지 않도록 제한
			otherPct = 100;
		} else {
			chemicalPct = 0;
			otherPct = 0;
		}

		const chemicalBar = container.querySelector(tabId === 'tab1' ? ".chemical-bar" : ".chemical-bar2");
		const otherBar = container.querySelector(tabId === 'tab1' ? ".water-bar" : ".total-bar");

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

		// 애니메이션 효과를 위해 초기화
		element.style.transition = 'none';
		element.style.height = '0%';
		element.offsetHeight; // 리플로우 트리거

		element.style.transition = `height ${Config.Animation.Duration}ms ${Config.Animation.Ease}`;
		element.style.willChange = 'height';

		// 트랜지션이 트리거되도록 requestAnimationFrame 사용
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
		const duration = 1000;

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

		const selectors = tabId === 'tab1' ? Config.Selectors.Inputs.Tab1 : Config.Selectors.Inputs.Tab2;
		const targetSelector = isDilution ? selectors.Dilution : selectors.Volume;
		const input = Utils.select(targetSelector);

		if (input) {
			const currentVal = parseFloat(Utils.removeCommas(input.value)) || 0;
			const addVal = parseFloat(value);
			const newVal = currentVal + addVal;
			input.value = Utils.addCommas(newVal);

			// 이벤트 트리거
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
		const isAtEnd = scrollWidth - scrollLeft <= clientWidth + 1; // 서브픽셀 안전을 위해 +1

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
		Utils.selectAll(".graph-bg > div").forEach(bar => bar.style.height = "0%");
		Utils.selectAll(".graph-item dd").forEach(dd => dd.textContent = "0ml");
		Utils.selectAll(".graph-item dt span:last-child").forEach(span => span.textContent = "");

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
		} else if (type === 'install') {
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
			this.openModal('install');
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
			// 원본 코드에 따른 UX를 위한 인위적 지연
			await new Promise(r => setTimeout(r, 500));

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
			const buttons = Array.isArray(product.dilution)
				? product.dilution.map((d, i) => this.createDilutionBtn(d, product.etc[i])).join('')
				: this.createDilutionBtn(product.dilution, product.etc);

			return `
                <div class="product-item">
                    <p class="brand ${product.label}">
                        <span><strong>${product.brand}</strong> - ${product.product}</span>
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
		return `<button type="button" class="btn-modal-dilution" data-value="${dilution}">
            <strong>1:${dilution}</strong> <span>(${etc})</span>
        </button>`;
	}

	/**
	 * 모달에서 희석비 선택 시 처리를 수행합니다.
	 * @param {Element} button - 선택된 버튼
	 */
	handleDilutionSelect(button) {
		const value = button.dataset.value;
		const tabId = this.getCurrentTabId();
		const selector = tabId === 'tab1' ? Config.Selectors.Inputs.Tab1.Dilution : Config.Selectors.Inputs.Tab2.Dilution;

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
		const alertBox = Utils.select('.selected-brand-alert');
		const brandHtml = button.closest('.product-item').querySelector('.brand').innerHTML;

		if (!alertBox) return;

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

		alertBox.classList.add('active');
		alertBox.style.opacity = '1';

		setTimeout(() => {
			alertBox.style.transition = 'opacity 500ms';
			alertBox.style.opacity = '0';
			setTimeout(() => {
				alertBox.classList.remove('active');
				alertBox.style.transition = '';
			}, 500);
		}, 3000);
	}
}

/**
 * 앱 초기화
 */
document.addEventListener("DOMContentLoaded", () => {
	new UIManager();
});
