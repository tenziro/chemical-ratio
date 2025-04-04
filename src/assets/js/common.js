// * DOMContentLoaded 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
	// DOM 요소 선택 유틸리티 함수
	const select = selector => document.querySelector(selector);
	const selectAll = selector => document.querySelectorAll(selector);

	// 주요 DOM 요소 캐싱
	const elements = {
		btnReset: select(".btn-reset"),
		tabHeaderItems: selectAll(".tab-header .radio-label"),
		tabRadio: select("#contents-tab1"),
		inputs: {
			tab1: {
				dilutionRatio: select("#dilutionRatio"),
				waterVolume: select("#waterVolume")
			},
			tab2: {
				dilutionRatio: select("#dilutionRatio2"),
				totalVolume: select("#totalCapacity")
			}
		}
	};

	// 이벤트 리스너 등록 유틸리티 함수
	const addEventListeners = (elements, event, handler) => {
		elements.forEach(element => element.addEventListener(event, handler));
	};

	// 탭별 입력 이벤트 등록 함수
	const registerTabInputEvents = (inputs, calculateFn) => {
		Object.values(inputs).forEach(input => {
			input.addEventListener("input", () => {
				calculateFn();
				updateResetButtonState();
			});
		});
	};

	// 이벤트 리스너 등록
	addEventListeners([elements.btnReset, ...elements.tabHeaderItems], "click", resetAll);
	document.addEventListener("click", handleDilutionClick);

	// quick-area 스크롤 이벤트 처리
	quickAreas.forEach(quickArea => {
		updateQuickAreaScrollState(quickArea);
		quickArea.addEventListener("scroll", () => updateQuickAreaScrollState(quickArea));
	});

	// 전역 클릭 이벤트 위임 처리
	document.addEventListener("click", event => {
		const target = event.target;
		const modalTrigger = target.closest("[data-open-modal]");
		const closeBtn = target.closest(".btn-modal-close");
		const resetBtn = target.closest(".btn-reset");

		if (modalTrigger) openModal(modalTrigger);
		else if (closeBtn) closeModal(closeBtn);
		else if (resetBtn) resetAll();
	});

	// 탭 관련 이벤트 등록
	elements.tabRadio.addEventListener("change", showTab);
	registerTabInputEvents(elements.inputs.tab1, calculateChemicalVolume);
	registerTabInputEvents(elements.inputs.tab2, calculateTotalVolume);

	// 빠른 용량 버튼 이벤트 등록
	selectAll(".btn-dilution-ratio, .btn-capacity-ratio")
		.forEach(btn => btn.addEventListener("click", () => quickRatioButtonClick(btn)));

	// 초기화
	window.addEventListener("resize", () => quickAreas.forEach(updateQuickAreaScrollState));
	showTab();
	installModal();
});

// ! quick-area 스크롤 상태 업데이트 함수
const updateQuickAreaScrollState = (quickArea) => {
	if (!quickArea) return;

	const quickAreaParent = quickArea.parentElement;
	if (!quickAreaParent) return;

	const { scrollWidth, clientWidth, scrollLeft } = quickArea;
	const isScrollable = scrollWidth > clientWidth;
	const isScrolledToEnd = scrollWidth - scrollLeft <= clientWidth;

	quickAreaParent.classList.toggle("hide-after", !isScrollable || isScrolledToEnd);
};

// quick-area 요소들 선택
const quickAreas = Array.from(document.querySelectorAll(".quick-area .inner")).filter(Boolean);

// ! 빠른 용량 추가 함수
// 빠른 용량 버튼 클릭 처리 함수
const quickRatioButtonClick = button => {
	// 탭 요소 확인 및 유효성 검사
	const tabElement = button.closest('.tab-body');
	if (!tabElement?.dataset?.tab) return;

	// 버튼 타입과 탭 ID 확인
	const { tab: tabId } = tabElement.dataset;
	const isDilutionButton = button.classList.contains('btn-dilution-ratio');
	const buttonValue = button.dataset?.value;
	if (!buttonValue) return;

	// 입력 필드 선택 및 유효성 검사 
	const inputSelector = getInputSelector(tabId, isDilutionButton);
	const inputElement = document.querySelector(inputSelector);
	if (!inputElement) return;

	// 입력값 업데이트 및 상태 갱신
	updateInputValue(inputElement, buttonValue);
	updateResetButtonState();

	// 계산 함수 실행
	const calculateFn = {
		tab1: calculateChemicalVolume,
		tab2: calculateTotalVolume
	}[tabId];

	if (calculateFn) calculateFn();
};

// !입력 필드 선택자 반환 함수 
const getInputSelector = (tabId, isDilutionButton) => {
	// 입력 필드 매핑 객체를 상수로 분리하여 재사용성 향상
	const INPUT_SELECTORS = {
		tab1: {
			dilution: '#dilutionRatio',
			volume: '#waterVolume'
		},
		tab2: {
			dilution: '#dilutionRatio2',
			volume: '#totalCapacity'
		}
	};

	// 옵셔널 체이닝으로 안전한 접근
	const tabInputs = INPUT_SELECTORS[tabId]?.dilution;
	if (!tabInputs) return null;

	return isDilutionButton ? INPUT_SELECTORS[tabId].dilution : INPUT_SELECTORS[tabId].volume;
};

// !입력값 업데이트 함수
const updateInputValue = (inputElement, value) => {
	if (!inputElement || value === undefined) return;

	try {
		// 숫자 변환 및 유효성 검사
		const numericValue = parseFloat(formatUtils.removeCommas(value));
		const currentValue = parseFloat(formatUtils.removeCommas(inputElement.value)) || 0;

		if (isNaN(numericValue) || isNaN(currentValue)) {
			throw new Error('유효하지 않은 숫자 형식입니다.');
		}

		// 합산 및 포맷팅
		const newValue = currentValue + numericValue;
		inputElement.value = formatUtils.addCommasToNumber(newValue);
	} catch (error) {
		console.error('입력값 업데이트 중 오류 발생:', error);
	}
};

// ! 리셋 버튼 활성화 함수
const isAnyInputFilled = (inputs) => {
	if (!inputs?.length) return false;
	return [...inputs].some(input => input.value?.trim() !== "");
};

const updateResetButtonState = () => {
	document.querySelectorAll(".btn-reset").forEach(button => {
		const tabContainer = button.closest("[data-tab]");
		if (!tabContainer) return;

		const inputs = document.querySelectorAll(`[data-tab='${tabContainer.dataset.tab}'] input`);
		button.disabled = !isAnyInputFilled(inputs);
	});
};
// ! 모달창 제어 함수
// 스크롤 잠금 상태 관리
const updateBodyScrollLock = isActive => {
	document.body.classList.toggle("hidden-scroll", isActive);
};

// 모달 상태 토글 처리
const toggleModal = (modal, isOpen) => {
	if (!modal) return;

	modal.classList.toggle("active", isOpen);
	updateBodyScrollLock(isOpen);
};

// 모달 열기 처리
const openModal = async (button) => {
	const modalType = button.dataset.openModal;
	const modal = document.querySelector(`.modal[data-modal-type="${modalType}"]`);

	if (!modal) return;

	toggleModal(modal, true);

	// 검색 모달 특수 처리
	if (modalType === 'search') {
		const nodataElement = document.querySelector('#nodata');
		const productList = document.querySelector('.product-list');

		if (nodataElement) nodataElement.classList.remove('active');
		if (productList) productList.style.display = 'block';

		await loadData();
	}
};

// 모달 닫기 처리 
const closeModal = button => {
	const modal = button?.closest(".modal");
	if (!modal) return;

	const modalType = modal.dataset.modalType;
	toggleModal(modal, false);

	// 모달 타입별 후처리
	switch (modalType) {
		case 'search':
			const searchInput = document.querySelector('#searchInput');
			if (searchInput) searchInput.value = '';
			break;
		case 'install':
			const INSTALL_PROMPT_KEY = "hideInstallModalUntil";
			const oneWeekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
			localStorage.setItem(INSTALL_PROMPT_KEY, oneWeekFromNow.toString());
			break;
	}

	// 최상단으로 부드럽게 스크롤
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
};
// ! install 모달
const installModal = () => {
	const INSTALL_PROMPT_KEY = "hideInstallModalUntil";

	// 디바이스 체크 함수
	const checkDevice = {
		isIOS: () => /iphone|ipad/i.test(navigator.userAgent),
		isAndroid: () => /android/i.test(navigator.userAgent),
		isStandalone: () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
	};

	// 모달 표시 여부 확인
	const shouldShowInstallModal = () => {
		if (checkDevice.isStandalone()) return false;

		const hideUntil = localStorage.getItem(INSTALL_PROMPT_KEY);
		const isMobileDevice = checkDevice.isIOS() || checkDevice.isAndroid();
		const isTimeExpired = !hideUntil || Date.now() > parseInt(hideUntil, 10);

		return isMobileDevice && isTimeExpired;
	};

	// 모달 표시
	const showInstallModal = () => {
		const modal = document.querySelector('.modal[data-modal-type="install"]');
		if (modal) toggleModal(modal, true);
	};

	// 조건 충족 시 모달 표시
	shouldShowInstallModal() && showInstallModal();
};


// ! 데이터 로드 함수
/**
 * 주어진 URL에서 데이터를 가져오는 함수
 * @param {string} url - 데이터를 가져올 URL
 * @returns {Promise<any>} 가져온 JSON 데이터
 * @throws {Error} 네트워크 요청 실패 시 에러
 */
const fetchData = async (url) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('네트워크 응답이 정상적이지 않습니다');
		}
		return await response.json();
	} catch (error) {
		console.error('데이터 가져오기 실패:', error);
		throw error;
	}
};

/**
 * 로딩 상태를 토글하는 함수
 * @param {boolean} isLoading - 로딩 상태 여부
 */
const toggleLoading = (isLoading) => {
	const searchModal = document.querySelector('.modal[data-modal-type="search"]');
	const loadingMsg = searchModal.querySelector('#result-data');
	const productList = searchModal.querySelector('.product-list');

	loadingMsg.classList.toggle('active', isLoading);
	productList.style.display = isLoading ? 'none' : 'block';

	if (!isLoading) {
		productList.scrollTop = 0;
	}
};

const loadData = async () => {
	const dataUrl = 'src/data/data.json';
	const productList = document.querySelector('.product-list');
	try {
		toggleLoading(true);
		await new Promise(resolve => setTimeout(resolve, 500));
		const data = await fetchData(dataUrl);
		localStorage.setItem('productData', JSON.stringify(data));
		displayProductList(data);
		productList.scrollTop = 0;
	} catch (error) {
		alert('데이터를 불러오는 데 실패했습니다.');
	} finally {
		toggleLoading(false);
	}
};

// ! 제품 리스트 표시 함수
const createDilutionButton = (dilution, etc) => {
	return `<button type="button" class="btn-modal-dilution" data-value="${dilution}">
		<strong>1:${dilution}</strong> <span>(${etc})</span>
	</button>`;
};

const createDilutionButtons = (dilution, etc) => {
	if (!Array.isArray(dilution)) {
		return createDilutionButton(dilution, etc);
	}
	return dilution.map((d, i) => createDilutionButton(d, etc[i])).join('');
};

const createProductItem = (product) => {
	const dilutionButtons = createDilutionButtons(product.dilution, product.etc);
	return `
		<div class="product-item">
			<p class="brand ${product.label}">
				<span><strong>${product.brand}</strong> - ${product.product}</span>
			</p>
			<div class="dilution-buttons">${dilutionButtons}</div>
		</div>
	`;
};

const displayProductList = (data) => {
	if (!Array.isArray(data)) {
		console.error('데이터가 배열 형식이 아닙니다.');
		return;
	}

	const productListContainer = document.querySelector('.modal[data-modal-type="search"] .product-list');
	if (!productListContainer) {
		console.error('제품 목록 컨테이너를 찾을 수 없습니다.');
		return;
	}

	productListContainer.innerHTML = data.map(createProductItem).join('');
};

// ! 검색 기능
const filterProductList = (searchTerm, data) => {
	const filteredData = data.filter(product =>
		product.brand.includes(searchTerm) || product.product.includes(searchTerm)
	);
	displayProductList(filteredData);
	return filteredData;
};

// ! 빠른 용량 리셋 함수
const resetQuickArea = () => {
	const quickAreas = document.querySelectorAll('.quick-area');
	quickAreas.forEach(quickArea => {
		quickArea.classList.remove('hide-after');
		const inner = quickArea.querySelector('.inner');
		if (inner) {
			inner.scrollLeft = 0; // 가로 스크롤을 0으로 설정
		}
	});
};

// ! 전체 리셋 함수
const resetAll = () => {
	resetAllTabs.tab1();
	resetAllTabs.tab2();
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
};

// ! 탭별 리셋 함수
// 각 탭의 선택자 설정을 객체로 관리
const tabSelectors = {
	tab1: {
		inputs: ["#dilutionRatio", "#waterVolume"],
		bars: [".water-bar", ".chemical-bar"],
		texts: [".chemical-ratio", ".total-ratio"],
		results: [".chemical-result", ".water-result"],
		reset: [".btn-reset"]
	},
	tab2: {
		inputs: ["#dilutionRatio2", "#totalCapacity"],
		bars: [".chemical-bar2", ".total-bar"],
		texts: [".total-ratio", ".chemical-ratio"],
		results: [".chemical-result", ".total-result"],
		reset: [".btn-reset"]
	}
};

// 요소 초기화 함수
const resetElements = (tab, selectors, options = {}) => {
	selectors.forEach(selector => {
		const element = tab.querySelector(selector);
		if (!element) return;

		if (options.value !== undefined) element.value = options.value;
		if (options.height !== undefined) element.style.height = options.height;
		if (options.text !== undefined) element.innerText = options.text;
		if (options.disabled !== undefined) element.disabled = options.disabled;
	});
};

// 탭 초기화 함수 
const resetTab = (tabId) => {
	const tab = document.querySelector(tabId);
	if (!tab) return;

	const config = tabSelectors[tabId.replace(/\[data-tab='(.+)'\]/, '$1')];

	resetElements(tab, config.inputs, { value: "" });
	resetElements(tab, config.bars, { height: "0%" });
	resetElements(tab, config.texts, { text: "" });
	resetElements(tab, config.results, { text: "0ml" });
	resetElements(tab, config.reset, { disabled: true });
};

// 전체 탭 초기화 객체
const resetAllTabs = {
	tab1: () => resetTab("[data-tab='tab1']"),
	tab2: () => resetTab("[data-tab='tab2']")
};

// ! 숫자 관련 유틸리티 함수 모음
const formatUtils = {
	isValidNumber: value => typeof value === 'number' && isFinite(value),
	addCommasToNumber: num => num.toLocaleString('en-US'),
	formatNumber: num => num.toLocaleString('en-US', { maximumFractionDigits: 1 }),
	removeCommas: str => str.replace(/,/g, ''),
};
// ! 텍스트 내용 업데이트 함수
const updateTextContent = (selector, text) => {
	const element = document.querySelector(selector);
	if (element) element.innerText = text;
};
// ! 입력값 포맷팅 핸들러
const formatInputHandler = event => {
	const value = formatUtils.removeCommas(event.target.value);
	const number = Number(value);
	if (formatUtils.isValidNumber(number)) {
		event.target.value = formatUtils.addCommasToNumber(number);
	}
};

// ! 입력 필드에 포맷팅 핸들러 등록
const inputFields = ["dilutionRatio", "waterVolume", "dilutionRatio2", "totalCapacity"];
inputFields.forEach(id => {
	const element = document.querySelector(`#${id}`);
	if (element) {
		element.addEventListener('input', (event) => {
			const value = formatUtils.removeCommas(event.target.value);
			const number = Number(value);
			if (number < 1) {
				event.target.value = '';
			} else if (formatUtils.isValidNumber(number)) {
				event.target.value = formatUtils.addCommasToNumber(number);
			}
		});
	}
});

// ! 탭 전환 함수
const tabs = document.querySelectorAll("[data-tab]");
const tabLine = document.querySelector(".tab-line");
const tabRadios = document.querySelectorAll('input[name="contents-tab"]');
const getCheckedTab = () => document.querySelector("#contents-tab1").checked ? "tab1" : "tab2";
const updateTabs = () => {
	const activeTab = getCheckedTab();
	tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === activeTab));
	tabLine.style.transform = `translateX(${activeTab === "tab1" ? 0 : 100}%)`;
};
const showTab = () => {
	updateTabs();
	resetQuickArea();
	window.scrollTo({ top: 0, behavior: "smooth" });
};
tabRadios.forEach((radio) => radio.addEventListener("change", showTab));

// ! 입력값 가져오는 함수
const getInputValue = (selector) => {
	const input = document.querySelector(selector);
	const value = parseFloat(input.value.replace(/,/g, ''));
	if (isNaN(value)) input.value = "";
	return isNaN(value) ? null : value;
};

// ! 그래프 애니메이션 함수
const animateGraph = (selectors, heights) => {
	selectors.forEach(selector => {
		const element = document.querySelector(selector);
		if (element) {
			element.style.transition = 'none';
			element.style.height = '0%';
			element.offsetHeight; // 강제 리플로우
			element.style.transition = 'height 1000ms cubic-bezier(0.06, 0.38, 0.13, 1)';
			element.style.willChange = 'height';
		}
	});

	requestAnimationFrame(() => {
		selectors.forEach((selector, index) => {
			const element = document.querySelector(selector);
			if (element) {
				element.style.height = `${heights[index]}%`;
			}
		});
	});
};

// ! 케미컬 용량 계산 함수
const calculateVolume = (ratioSelector, volumeSelector, isTotalCalculation = false) => {
	const dilutionRatio = getInputValue(ratioSelector);
	const volume = getInputValue(volumeSelector);
	if (dilutionRatio === null || volume === null) return;

	const chemicalVolume = isTotalCalculation ? volume / (dilutionRatio + 1) : volume / dilutionRatio;
	const waterVolume = isTotalCalculation ? volume - chemicalVolume : volume;
	const totalVolume = chemicalVolume + waterVolume;

	const validChemicalVolume = isFinite(chemicalVolume) ? chemicalVolume : 0;
	const validWaterVolume = isFinite(waterVolume) ? waterVolume : 0;
	const validTotalVolume = isFinite(totalVolume) ? totalVolume : 0;

	const tab = isTotalCalculation ? "[data-tab='tab2']" : "[data-tab='tab1']";

	displayGraph(tab, validChemicalVolume, validTotalVolume, validWaterVolume);
	updateTextContent(`${tab} .chemical-ratio`, `(희석비 - 1:${formatUtils.formatNumber(dilutionRatio)})`);
	updateTextContent(`${tab} .total-ratio`, isTotalCalculation
		? `(물 용량 - ${formatUtils.formatNumber(validWaterVolume)}ml)`
		: `(전체 용량 - ${formatUtils.formatNumber(validTotalVolume)}ml)`);

	animateNumber(`${tab} .chemical-result`, validChemicalVolume);
	animateNumber(`${tab} .${isTotalCalculation ? "total-result" : "water-result"}`, validWaterVolume);
	if (isTotalCalculation) {
		animateNumber(`${tab} .total-result`, validTotalVolume);
	}
};

// ! 케미컬 용량 애니메이션 함수
const animateNumber = (selector, targetValue) => {
	const element = document.querySelector(selector);
	if (!element || isNaN(targetValue) || targetValue <= 0 || !isFinite(targetValue)) {
		element.textContent = '0ml';
		return;
	}

	const duration = 1000;
	const startTime = performance.now();
	const easeOutQuad = t => 1 - Math.pow(1 - t, 2);

	const animate = (currentTime) => {
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const currentValue = targetValue * easeOutQuad(progress);

		element.textContent = `${formatUtils.formatNumber(Math.floor(currentValue))}ml`;

		if (progress < 1) {
			requestAnimationFrame(animate);
		} else {
			element.textContent = `${formatUtils.formatNumber(targetValue)}ml`;
		}
	};

	requestAnimationFrame(animate);
};

const displayGraph = (tab, chemicalAmount, totalVolume, waterAmount) => {
	const barSelectors = {
		"[data-tab='tab1']": [".water-bar", ".chemical-bar"],
		"[data-tab='tab2']": [".total-bar", ".chemical-bar2"]
	};

	const getDilutionRatio = id => parseFloat(document.querySelector(id).value.replace(/,/g, ''));
	const dilutionRatio = getDilutionRatio("#dilutionRatio");
	const dilutionRatio2 = getDilutionRatio("#dilutionRatio2");

	const calculatePercentage = (amount, total, ratio) => {
		const basePercentage = (amount / total) * 100;
		return ratio >= 10 ? basePercentage * 5 : basePercentage;
	};

	const percentages = tab === "[data-tab='tab1']"
		? [waterAmount > 0 ? 100 : 0, calculatePercentage(chemicalAmount, waterAmount, dilutionRatio)]
		: [totalVolume > 0 ? 100 : 0, calculatePercentage(chemicalAmount, totalVolume, dilutionRatio2)];

	animateGraph(barSelectors[tab], percentages);
};

// 각각의 계산 함수 - 특정 요소에서 값을 가져와 calculateVolume 실행
const calculateChemicalVolume = () => calculateVolume("#dilutionRatio", "#waterVolume");
const calculateTotalVolume = () => calculateVolume("#dilutionRatio2", "#totalCapacity", true);

// ! 검색 입력 이벤트 등록
document.querySelector('#searchInput').addEventListener('keyup', async (e) => {
	// Enter 키가 아닌 경우 즉시 반환
	if (e.key !== 'Enter') return;

	const searchTerm = e.target.value.trim();

	// 로컬 스토리지에서 데이터 가져오기 또는 로드
	let data = JSON.parse(localStorage.getItem('productData'));
	if (!data) {
		await loadData();
		data = JSON.parse(localStorage.getItem('productData'));
	}

	// 데이터가 배열이 아닌 경우 반환
	if (!Array.isArray(data)) return;

	const filteredData = filterProductList(searchTerm, data);
	const noDataMsg = document.querySelector('#nodata');
	const itemParent = document.querySelector('.product-list');

	// noDataMsg가 없는 경우 반환
	if (!noDataMsg) return;

	// 필터링 결과에 따른 UI 업데이트
	const hasResults = filteredData.length > 0;
	noDataMsg.classList.toggle('active', !hasResults);
	itemParent.style.display = hasResults ? 'block' : 'none';
});

// ! 희석비 버튼 클릭 이벤트 등록
const handleDilutionClick = (e) => {
	// 희석비 버튼 요소 찾기
	const button = e.target.closest('.btn-modal-dilution');
	if (!button) return;

	// 희석비 값과 입력 필드 설정
	const dilutionValue = button.dataset.value;
	const inputSelector = getActiveTabInputSelector();
	if (inputSelector) {
		document.querySelector(inputSelector).value = dilutionValue;
	}

	// UI 상태 업데이트
	updateResetButtonState();
	closeModal(button);

	// 활성 탭에 따른 계산 실행
	const activeTab = getCheckedTab();
	const calculateFn = activeTab === 'tab1' ? calculateChemicalVolume : calculateTotalVolume;
	calculateFn();

	// 선택된 브랜드 알림 표시
	showSelectedBrandAlert(button, dilutionValue);
};

// !선택된 브랜드 알림 표시 함수
const showSelectedBrandAlert = (button, dilutionValue) => {
	const selectedBrandAlert = document.querySelector('.selected-brand-alert');
	const brandElement = button.closest('.product-item').querySelector('.brand');

	if (!selectedBrandAlert || !brandElement) return;

	// 알림 내용 설정
	selectedBrandAlert.innerHTML = `
		<div class="inner">
			<i class="ti ti-circle-check"></i>
			<div>
				<span class="text">선택하신 제품은 </span>
				${brandElement.innerHTML}
				<span class="text">이며,</span>
				<em>희석비는 <strong>1:${dilutionValue}</strong>입니다.</em>
			</div>
		</div>
	`;

	// 알림 표시 및 자동 숨김 처리
	selectedBrandAlert.classList.add('active');
	selectedBrandAlert.style.opacity = '1';

	setTimeout(() => {
		selectedBrandAlert.style.transition = 'opacity 500ms';
		selectedBrandAlert.style.opacity = '0';

		setTimeout(() => {
			selectedBrandAlert.classList.remove('active');
			selectedBrandAlert.style.transition = '';
		}, 500);
	}, 3000);
};
const getActiveTabInputSelector = () => {
	const activeTab = document.querySelector('.tab-body.active');
	if (!activeTab) return null;
	return activeTab.dataset.tab === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2';
};