// * DOMContentLoaded 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
	// 요소 선택 함수 생성
	const select = (selector) => document.querySelector(selector);
	// 요소 선택
	const tabHeaderItem = select(".tab-header .radio-label");
	const btnReset = select(".btn-reset");
	const inputsTab1 = {
		dilutionRatio: select("#dilutionRatio"),
		waterVolume: select("#waterVolume"),
	};
	const inputsTab2 = {
		dilutionRatio2: select("#dilutionRatio2"),
		totalVolume: select("#totalCapacity"),
	};
	// * .quick-area 스크롤 이벤트 등록
	document.querySelectorAll('.quick-area .inner').forEach(quickArea => {
		const quickAreaParent = quickArea.parentElement;
		const updateScrollState = () => {
			const isScrolledToEnd = quickArea.scrollWidth - quickArea.scrollLeft <= quickArea.clientWidth;
			quickAreaParent.classList.toggle('hide-after', quickArea.scrollWidth <= quickArea.clientWidth || isScrolledToEnd);
		};
		updateScrollState();
		quickArea.addEventListener('scroll', updateScrollState);
		window.addEventListener('resize', updateScrollState);
	});

	// * 리셋 버튼 클릭 이벤트 등록
	btnReset.addEventListener("click", resetAll);
	tabHeaderItem.addEventListener("click", resetAll);

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
	registerInputEventsTab(inputsTab1, calculateChemicalVolume, btnReset);
	registerInputEventsTab(inputsTab2, calculateTotalVolume, btnReset);

	// * 빠른 용량 추가 버튼 클릭 이벤트 등록
	document.querySelectorAll('.btn-dilution-ratio, .btn-capacity-ratio').forEach(button => {
		button.addEventListener('click', () => {
			const tabElement = button.closest('.tab-body');
			if (!tabElement) return;
			const tabId = tabElement.getAttribute('data-tab');
			const isDilutionButton = button.classList.contains('btn-dilution-ratio');
			const inputSelector = isDilutionButton
				? (tabId === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2')
				: (tabId === 'tab1' ? '#waterVolume' : '#totalCapacity');
			const inputElement = document.querySelector(inputSelector);
			if (!inputElement) return;
			const value = parseFloat(button.getAttribute('data-value').replace(/,/g, ''));
			const currentValue = parseFloat(inputElement.value.replace(/,/g, '')) || 0;
			inputElement.value = formatUtils.addCommasToNumber(currentValue + value);
			updateResetButtonState();
			if (tabId === 'tab1') {
				calculateChemicalVolume();
				wcs.event('CLICK', 'QUICK_TAB1_DILUTION_RATIO');
			} else {
				calculateTotalVolume();
				wcs.event('CLICK', 'QUICK_TAB2_DILUTION_RATIO');
			}
		});
	});
	showTab();
});

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
		wcs.event('MODAL', 'OPEN_SEARCH');
	} else {
		wcs.event('MODAL', 'OPEN_INFORMATION');
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
const loadData = async () => {
	try {
		const loadingMsg = document.querySelector('.modal[data-modal-type="search"] #result-data');
		loadingMsg.classList.add('active');
		const response = await fetch('src/data/data.json');
		if (!response.ok) throw new Error('Network response was not ok');
		const data = await response.json();
		localStorage.setItem('productData', JSON.stringify(data));
		displayProductList(data);
		loadingMsg.classList.remove('active');
		document.querySelector('.product-list').scrollTop = 0; // 스크롤을 top 0으로 이동
	} catch (error) {
		console.error('Failed to fetch data:', error);
	}
};

// ! 제품 리스트 표시 함수
const displayProductList = (data) => {
	const productListContainer = document.querySelector('.modal[data-modal-type="search"] .product-list');
	productListContainer.innerHTML = data.map(product => {
		const dilutionButtons = Array.isArray(product.dilution)
			? product.dilution.map((d, i) => `<button type="button" class="btn-modal-dilution" data-value="${d}"><strong>1:${d}</strong> <span>(${product.etc[i]})</span></button>`).join('')
			: `<button type="button" class="btn-modal-dilution" data-value="${product.dilution}"><strong>1:${product.dilution}</strong><span>(${product.etc})</span></button>`;
		return `
			<div class="product-item">
				<p class="brand ${product.label}"><span><strong>${product.brand}</strong> - ${product.product}</span></p>
				<div class="dilution-buttons">${dilutionButtons}</div>
			</div>
		`;
	}).join('');
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
}
// ! 전체 리셋 함수
const resetAll = () => {
	resetAllTabs.tab1();
	resetAllTabs.tab2();
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
	wcs.event('CLICK', 'RESET');
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
const showTab = () => {
	const isTab1Checked = document.querySelector("#contents-tab1").checked;
	tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === (isTab1Checked ? "tab1" : "tab2")));
	tabLine.style.transform = `translateX(${isTab1Checked ? 0 : 100}%)`;
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
document.addEventListener('click', (e) => {
	if (e.target.closest('.btn-modal-dilution')) {
		const dilutionValue = e.target.closest('.btn-modal-dilution').dataset.value;
		const activeTab = document.querySelector('.tab-body.active');
		const inputSelector = activeTab.dataset.tab === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2';
		document.querySelector(inputSelector).value = dilutionValue;
		updateResetButtonState();
		closeModal(e.target);
		wcs.event('CLICK', 'DILUTION_RATIO');
	}
});
