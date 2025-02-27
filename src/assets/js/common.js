// * DOMContentLoaded 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
	const select = (selector) => document.querySelector(selector);
	const selectAll = (selector) => document.querySelectorAll(selector);
	// 요소 선택
	const btnReset = select(".btn-reset");
	const tabHeaderItems = selectAll(".tab-header .radio-label");
	const inputs = {
		tab1: {
			dilutionRatio: select("#dilutionRatio"),
			waterVolume: select("#waterVolume"),
		},
		tab2: {
			dilutionRatio: select("#dilutionRatio2"),
			totalVolume: select("#totalCapacity"),
		},
	};
	// * 리셋 버튼 및 탭 헤더 클릭 이벤트 등록
	const addEventListeners = (elements, event, handler) => {
		elements.forEach((element) => element.addEventListener(event, handler));
	};
	addEventListeners([btnReset, ...tabHeaderItems], "click", resetAll);
	document.addEventListener("click", handleDilutionClick);

	// * .quick-area 스크롤 이벤트 등록
	quickAreas.forEach((quickArea) => {
		updateQuickAreaScrollState(quickArea);
		quickArea.addEventListener("scroll", () => updateQuickAreaScrollState(quickArea));
	});
	window.addEventListener("resize", () => {
		quickAreas.forEach(updateQuickAreaScrollState);
	});
	// * 공통 클릭 이벤트 등록
	document.addEventListener("click", event => {
		if (event.target.closest("[data-open-modal]")) {
			openModal(event.target.closest("[data-open-modal]")); // 모달 열기 버튼 클릭 시 모달 열기
		} else if (event.target.closest(".btn-modal-close")) {
			closeModal(event.target.closest(".btn-modal-close")); // 모달 닫기 버튼 클릭 시 모달 닫기
		} else if (event.target.closest(".btn-reset")) {
			resetAll(); // 리셋 버튼 클릭 시 전체 리셋
		}
	});
	// * 탭 변경 이벤트 등록
	const tabRadio = document.querySelector("#contents-tab1");
	tabRadio.addEventListener('change', showTab);
	// * 탭별 입력 이벤트 등록 함수
	const registerInputEventsTab = (inputs, calculateFunction, btnReset) => {
		Object.values(inputs).forEach(input => {
			input.addEventListener("input", () => {
				calculateFunction();
				updateResetButtonState();
			});
		});
		btnReset.addEventListener("click", resetAll);
	};
	// * 탭별 입력 이벤트 등록
	registerInputEventsTab(inputs.tab1, calculateChemicalVolume, btnReset);
	registerInputEventsTab(inputs.tab2, calculateTotalVolume, btnReset);
	// * 빠른 용량 추가 버튼 클릭 이벤트 등록
	document.querySelectorAll('.btn-dilution-ratio, .btn-capacity-ratio').forEach(button =>
		button.addEventListener('click', () => quickRatioButtonClick(button))
	);
	showTab();
});

// ! quick-area 스크롤 상태 업데이트 함수
const updateQuickAreaScrollState = (quickArea) => {
	const quickAreaParent = quickArea.parentElement;
	const isScrollable = quickArea.scrollWidth > quickArea.clientWidth;
	const isScrolledToEnd = quickArea.scrollWidth - quickArea.scrollLeft <= quickArea.clientWidth;
	quickAreaParent.classList.toggle("hide-after", !isScrollable || isScrolledToEnd);
};
const quickAreas = document.querySelectorAll(".quick-area .inner");

// ! 빠른 용량 추가 함수
const quickRatioButtonClick = button => {
	const tabElement = button.closest('.tab-body');
	if (!tabElement) return;
	const tabId = tabElement.dataset.tab;
	const isDilutionButton = button.classList.contains('btn-dilution-ratio');
	const inputSelector = getInputSelector(tabId, isDilutionButton);
	const inputElement = document.querySelector(inputSelector);
	if (!inputElement) return;
	updateInputValue(inputElement, button.dataset.value);
	updateResetButtonState();
	tabId === 'tab1' ? calculateChemicalVolume() : calculateTotalVolume();
};
const getInputSelector = (tabId, isDilutionButton) => {
	const selectors = {
		tab1: isDilutionButton ? '#dilutionRatio' : '#waterVolume',
		tab2: isDilutionButton ? '#dilutionRatio2' : '#totalCapacity'
	};
	return selectors[tabId];
};
const updateInputValue = (inputElement, value) => {
	const numericValue = parseFloat(value.replace(/,/g, ''));
	const currentValue = parseFloat(inputElement.value.replace(/,/g, '')) || 0;
	inputElement.value = formatUtils.addCommasToNumber(currentValue + numericValue);
};

// ! 리셋 버튼 활성화 함수
const isAnyInputFilled = (inputs) => [...inputs].some(input => input.value.trim() !== "");
const updateResetButtonState = () => {
	document.querySelectorAll(".btn-reset").forEach(button => {
		const inputs = document.querySelectorAll(`[data-tab='${button.closest("[data-tab]").dataset.tab}'] input`);
		button.disabled = !isAnyInputFilled(inputs);
	});
};
// ! 모달창 제어 함수
const updateBodyScrollLock = isActive => {
	document.body.classList.toggle("stop-scroll", isActive);
};
const toggleModal = (modal, isOpen) => {
	if (modal) {
		modal.classList.toggle("active", isOpen);
		updateBodyScrollLock(isOpen);
	}
};
const openModal = async (button) => {
	const modalType = button.dataset.openModal;
	const modal = document.querySelector(`.modal[data-modal-type="${modalType}"]`);
	if (modalType === 'search') {
		document.querySelector('#nodata').classList.remove('active');
		document.querySelector('.product-list').style.display = 'block';
		await loadData();
	}
	toggleModal(modal, true);
};
const closeModal = button => {
	const modal = button.closest(".modal");
	toggleModal(modal, false);
	if (modal.dataset.modalType === 'search') {
		document.querySelector('#searchInput').value = '';
		document.querySelector('.product-list').scrollTop = 0;
	}
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
};

// ! 데이터 로드 함수
const fetchData = async (url) => {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('Network response was not ok');
		return await response.json();
	} catch (error) {
		console.error('Failed to fetch data:', error);
		throw error;
	}
};
const toggleLoading = (isLoading) => {
	const loadingMsg = document.querySelector('.modal[data-modal-type="search"] #result-data');
	loadingMsg.classList.toggle('active', isLoading);
};
const loadData = async () => {
	const dataUrl = 'src/data/data.json';
	const productList = document.querySelector('.product-list');
	try {
		toggleLoading(true);
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
const createDilutionButtons = (dilution, etc) => {
	if (!Array.isArray(dilution)) {
		return `<button type="button" class="btn-modal-dilution" data-value="${dilution}">
			<strong>1:${dilution}</strong> <span>(${etc})</span>
		</button>`;
	}
	return dilution.map((d, i) => `
		<button type="button" class="btn-modal-dilution" data-value="${d}">
			<strong>1:${d}</strong> <span>(${etc[i]})</span>
		</button>
	`).join('');
};
const displayProductList = (data) => {
	const productListContainer = document.querySelector('.modal[data-modal-type="search"] .product-list');
	productListContainer.innerHTML = data.reduce((html, product) => {
		const dilutionButtons = createDilutionButtons(product.dilution, product.etc);
		return html + `
			<div class="product-item">
				<p class="brand ${product.label}">
					<span><strong>${product.brand}</strong> - ${product.product}</span>
				</p>
				<div class="dilution-buttons">${dilutionButtons}</div>
			</div>
		`;
	}, '');
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
const resetTab = (tabId, inputSelectors, barSelectors, textSelectors, resultSelectors, resetSelectors) => {
	const tab = document.querySelector(tabId);
	if (!tab) return;

	for (const selector of inputSelectors) {
		const input = tab.querySelector(selector);
		if (input) input.value = "";
	}

	for (const selector of barSelectors) {
		const bar = tab.querySelector(selector);
		if (bar) bar.style.height = '0%';
	}

	for (const selector of textSelectors) {
		const text = tab.querySelector(selector);
		if (text) text.innerText = '';
	}

	for (const selector of resultSelectors) {
		const result = tab.querySelector(selector);
		if (result) result.innerText = '0ml';
	}

	for (const selector of resetSelectors) {
		const resetBtn = tab.querySelector(selector);
		if (resetBtn) resetBtn.disabled = true;
	}
};
const resetAllTabs = {
	tab1: () => resetTab("[data-tab='tab1']", ["#dilutionRatio", "#waterVolume"], [".total-bar", ".chemical-bar"], [".chemical-ratio", ".total-ratio"], [".chemical-result", ".water-result"], [".btn-reset"]),
	tab2: () => resetTab("[data-tab='tab2']", ["#dilutionRatio2", "#totalCapacity"], [".chemical-bar", ".chemical-bar2", ".water-bar"], [".total-ratio", ".chemical-ratio"], [".chemical-result", ".total-result"], [".btn-reset"])
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
		element.addEventListener('input', formatInputHandler);
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
	selectors.forEach(selector => document.querySelector(selector).style.height = '0%');
	setTimeout(() => {
		selectors.forEach((selector, index) => {
			document.querySelector(selector).style.height = heights[index] + '%';
		});
	}, 100);
};

// ! 케미컬 용량 계산 함수
const calculateVolume = (ratioSelector, volumeSelector, isTotalCalculation = false) => {
	const dilutionRatio = getInputValue(ratioSelector);
	const volume = getInputValue(volumeSelector);
	if (dilutionRatio === null || volume === null) return;

	const chemicalVolume = isTotalCalculation ? volume / (dilutionRatio + 1) : volume / dilutionRatio;
	const waterVolume = isTotalCalculation ? volume - chemicalVolume : volume;
	const totalVolume = chemicalVolume + waterVolume;

	const tab = isTotalCalculation ? "[data-tab='tab2']" : "[data-tab='tab1']";
	displayGraph(tab, chemicalVolume, totalVolume, waterVolume);

	updateTextContent(`${tab} .chemical-ratio`, `(희석비 - 1:${formatUtils.formatNumber(dilutionRatio)})`);
	updateTextContent(`${tab} .total-ratio`, isTotalCalculation
		? `(물 용량 - ${formatUtils.formatNumber(waterVolume)}ml)`
		: `(전체 용량 - ${formatUtils.formatNumber(totalVolume)}ml)`);
	updateTextContent(`${tab} .chemical-result`, `${formatUtils.formatNumber(chemicalVolume)}ml`);
	updateTextContent(`${tab} .${isTotalCalculation ? "total-result" : "water-result"}`, `${formatUtils.formatNumber(waterVolume)}ml`);
};
const displayGraph = (tab, chemicalAmount, totalVolume, waterAmount) => {
	const barSelectors = {
		"[data-tab='tab1']": [".total-bar", ".chemical-bar"],
		"[data-tab='tab2']": [".chemical-bar", ".chemical-bar2", ".water-bar"]
	};
	const percentages = tab === "[data-tab='tab1']"
		? [100, (chemicalAmount / waterAmount) * 100]
		: [(chemicalAmount / totalVolume) * 100, (chemicalAmount / totalVolume) * 100, (waterAmount / totalVolume) * 100];

	animateGraph(barSelectors[tab], percentages);
};
const calculateChemicalVolume = () => calculateVolume("#dilutionRatio", "#waterVolume");
const calculateTotalVolume = () => calculateVolume("#dilutionRatio2", "#totalCapacity", true);

// ! 검색 입력 이벤트 등록
document.querySelector('#searchInput').addEventListener('keypress', async (e) => {
	if (e.key === 'Enter') {
		const searchTerm = e.target.value.trim();
		let data = JSON.parse(localStorage.getItem('productData'));
		if (!data) {
			await loadData();
			data = JSON.parse(localStorage.getItem('productData'));
		}
		if (Array.isArray(data)) {
			const filteredData = filterProductList(searchTerm, data);
			const noDataMsg = document.querySelector('#nodata');
			const itemParent = document.querySelector('.product-list');
			if (noDataMsg) {
				if (filteredData.length === 0) {
					noDataMsg.classList.add('active');
					itemParent.style.display = 'none';
				} else {
					noDataMsg.classList.remove('active');
					itemParent.style.display = 'block';
				}
			}
		}
	}
});

// ! 희석비 버튼 클릭 이벤트 등록
// document.addEventListener('click', (e) => {
// 	if (e.target.closest('.btn-modal-dilution')) {
// 		const dilutionValue = e.target.closest('.btn-modal-dilution').dataset.value;
// 		const activeTab = document.querySelector('.tab-body.active');
// 		const inputSelector = activeTab.dataset.tab === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2';
// 		document.querySelector(inputSelector).value = dilutionValue;
// 		updateResetButtonState();
// 		closeModal(e.target);
// 	}
// });
const handleDilutionClick = (e) => {
	const button = e.target.closest('.btn-modal-dilution');
	if (!button) return;
	const dilutionValue = button.dataset.value;
	const inputSelector = getActiveTabInputSelector();
	if (inputSelector) {
		document.querySelector(inputSelector).value = dilutionValue;
	}
	updateResetButtonState();
	closeModal(button);
};
const getActiveTabInputSelector = () => {
	const activeTab = document.querySelector('.tab-body.active');
	if (!activeTab) return null;
	return activeTab.dataset.tab === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2';
};
