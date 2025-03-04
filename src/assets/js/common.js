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
	installModal();
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
	document.documentElement.classList.toggle("stop-scroll", isActive);
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
	toggleModal(modal, true);
	if (modalType === 'search') {
		document.querySelector('#nodata').classList.remove('active');
		document.querySelector('.product-list').style.display = 'block';
		await loadData();
	}
};
const closeModal = button => {
	const modal = button.closest(".modal");
	const modalType = modal.dataset.modalType;
	toggleModal(modal, false);
	if (modalType === 'search') {
		document.querySelector('#searchInput').value = '';
	} else if (modalType === 'install') {
		const INSTALL_PROMPT_KEY = "hideInstallModalUntil";
		localStorage.setItem(INSTALL_PROMPT_KEY, (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
	}
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
};
// ! install 모달
const installModal = () => {
	const INSTALL_PROMPT_KEY = "hideInstallModalUntil";
	const isIOS = () => /iphone|ipad/i.test(navigator.userAgent);
	const isAndroid = () => /android/i.test(navigator.userAgent);
	const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
	const shouldShowInstallModal = () => {
		const hideUntil = localStorage.getItem(INSTALL_PROMPT_KEY);
		return (isIOS() || isAndroid()) && !isStandalone() && (!hideUntil || Date.now() > parseInt(hideUntil, 10));
	};
	const showInstallModal = () => {
		const modal = document.querySelector('.modal[data-modal-type="install"]');
		toggleModal(modal, true);
	};
	if (shouldShowInstallModal()) {
		showInstallModal();
	}
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
	const productList = document.querySelector('.modal[data-modal-type="search"] .product-list');
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
	tab1: () => resetTab("[data-tab='tab1']", ["#dilutionRatio", "#waterVolume"], [".water-bar", ".chemical-bar"], [".chemical-ratio", ".total-ratio"], [".chemical-result", ".water-result"], [".btn-reset"]),
	tab2: () => resetTab("[data-tab='tab2']", ["#dilutionRatio2", "#totalCapacity"], [".chemical-bar2", ".total-bar"], [".total-ratio", ".chemical-ratio"], [".chemical-result", ".total-result"], [".btn-reset"])
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
	selectors.forEach(selector => document.querySelector(selector).style.height = '0%');
	setTimeout(() => {
		selectors.forEach((selector, index) => {
			document.querySelector(selector).style.height = heights[index] + '%';
		});
	}, 100);
};

// ! 케미컬 용량 계산 함수
const animateNumber = (selector, targetValue) => {
	const element = document.querySelector(selector);
	if (!element || isNaN(targetValue) || targetValue <= 0 || !isFinite(targetValue)) {
		element.textContent = '0ml';
		return;
	}
	let startValue = 0;
	const duration = 620; // 애니메이션 지속 시간 (ms)
	const frameRate = 30;
	const totalFrames = duration / (1000 / frameRate) || 1;
	let currentFrame = 0;
	const easeOut = (progress) => 1 - Math.pow(1 - progress, 3); // 점점 느려지는 효과 (Cubic Ease-Out)
	const updateNumber = () => {
		currentFrame++;
		// 현재 진행 비율 (0 ~ 1)
		const progress = currentFrame / totalFrames;
		// Ease-out 적용
		startValue = targetValue * easeOut(progress);
		if (currentFrame >= totalFrames) {
			element.textContent = `${formatUtils.formatNumber(targetValue)}ml`; // 최종 값 설정
		} else {
			element.textContent = `${formatUtils.formatNumber(Math.floor(startValue))}ml`;
			requestAnimationFrame(updateNumber);
		}
	};
	updateNumber();
};
const calculateVolume = (ratioSelector, volumeSelector, isTotalCalculation = false) => {
	// 입력 필드에서 희석 비율과 용량 값을 가져옴
	const dilutionRatio = getInputValue(ratioSelector);
	const volume = getInputValue(volumeSelector);
	if (dilutionRatio === null || volume === null) return; // 값이 없으면 종료
	// 화학 용액 및 물의 용량 계산
	const chemicalVolume = isTotalCalculation ? volume / (dilutionRatio + 1) : volume / dilutionRatio;
	const waterVolume = isTotalCalculation ? volume - chemicalVolume : volume;
	const totalVolume = chemicalVolume + waterVolume; // 전체 용량 계산
	// 결과값이 ∞일 경우 0으로 설정
	const validChemicalVolume = isFinite(chemicalVolume) ? chemicalVolume : 0;
	const validWaterVolume = isFinite(waterVolume) ? waterVolume : 0;
	const validTotalVolume = isFinite(totalVolume) ? totalVolume : 0;
	// 어떤 탭에서 계산이 수행되는지에 따라 선택자 설정
	const tab = isTotalCalculation ? "[data-tab='tab2']" : "[data-tab='tab1']";
	// 그래프 업데이트
	displayGraph(tab, validChemicalVolume, validTotalVolume, validWaterVolume);
	// 희석 비율 및 전체/물 용량 텍스트 업데이트
	updateTextContent(`${tab} .chemical-ratio`, `(희석비 - 1:${formatUtils.formatNumber(dilutionRatio)})`);
	updateTextContent(`${tab} .total-ratio`, isTotalCalculation
		? `(물 용량 - ${formatUtils.formatNumber(validWaterVolume)}ml)`
		: `(전체 용량 - ${formatUtils.formatNumber(validTotalVolume)}ml)`);
	// 애니메이션을 통한 숫자 변경
	animateNumber(`${tab} .chemical-result`, validChemicalVolume);
	animateNumber(`${tab} .${isTotalCalculation ? "total-result" : "water-result"}`, validWaterVolume);
	if (isTotalCalculation) {
		animateNumber(`${tab} .total-result`, validTotalVolume);
	}
};
const displayGraph = (tab, chemicalAmount, totalVolume, waterAmount) => {
	// 탭에 따라 적절한 그래프 바의 선택자 지정
	const barSelectors = {
		"[data-tab='tab1']": [".water-bar", ".chemical-bar"],
		"[data-tab='tab2']": [".total-bar", ".chemical-bar2"]
	};
	// 탭에 따라 퍼센트 비율 계산
	const dilutionRatioValue = parseFloat(document.querySelector("#dilutionRatio").value.replace(/,/g, ''));
	const dilutionRatioValue2 = parseFloat(document.querySelector("#dilutionRatio2").value.replace(/,/g, ''));
	const percentages = tab === "[data-tab='tab1']"
		? [100, dilutionRatioValue >= 100 ? (chemicalAmount / waterAmount) * 5000 : (chemicalAmount / waterAmount) * 100] // 물 기준으로 퍼센트 계산
		: [(totalVolume / totalVolume) * 100, dilutionRatioValue2 >= 100 ? (chemicalAmount / totalVolume) * 5000 : (chemicalAmount / totalVolume) * 100]; // 전체 용량 기준으로 퍼센트 계산
	// #waterVolume, #totalCapacity의 value가 0이면 .water-bar, .total-bar의 높이를 0으로 설정
	if (waterAmount === 0) {
		percentages[0] = 0;
	}
	if (totalVolume === 0) {
		percentages[0] = 0;
	}
	// 애니메이션을 통한 그래프 업데이트
	animateGraph(barSelectors[tab], percentages);
};
// 각각의 계산 함수 - 특정 요소에서 값을 가져와 calculateVolume 실행
const calculateChemicalVolume = () => calculateVolume("#dilutionRatio", "#waterVolume");
const calculateTotalVolume = () => calculateVolume("#dilutionRatio2", "#totalCapacity", true);

// ! 검색 입력 이벤트 등록
document.querySelector('#searchInput').addEventListener('keypress', async (e) => {
	// 사용자가 입력 필드에서 키를 눌렀을 때 이벤트 리스너 실행
	if (e.key === 'Enter') { // Enter 키가 눌렸을 경우 실행
		// 입력 필드에서 검색어를 가져와 공백을 제거
		const searchTerm = e.target.value.trim();
		// 로컬 스토리지에서 'productData' 키로 저장된 데이터를 가져옴
		let data = JSON.parse(localStorage.getItem('productData'));
		// 로컬 스토리지에 데이터가 없는 경우 데이터를 로드하는 함수 실행
		if (!data) {
			await loadData(); // 데이터 로드 함수 실행 (비동기 처리)
			data = JSON.parse(localStorage.getItem('productData')); // 다시 로컬 스토리지에서 데이터 가져옴
		}
		// 데이터가 배열인지 확인 후 필터링 수행
		if (Array.isArray(data)) {
			const filteredData = filterProductList(searchTerm, data); // 검색어를 기준으로 데이터 필터링
			// 'nodata' 메시지 요소와 제품 목록 요소 선택
			const noDataMsg = document.querySelector('#nodata');
			const itemParent = document.querySelector('.product-list');
			// 'nodata' 메시지 요소가 존재하는 경우 처리
			if (noDataMsg) {
				if (filteredData.length === 0) { // 필터링된 데이터가 없는 경우
					noDataMsg.classList.add('active'); // 'nodata' 메시지 활성화
					itemParent.style.display = 'none'; // 제품 목록 숨김
				} else { // 필터링된 데이터가 존재하는 경우
					noDataMsg.classList.remove('active'); // 'nodata' 메시지 비활성화
					itemParent.style.display = 'block'; // 제품 목록 표시
				}
			}
		}
	}
});

// ! 희석비 버튼 클릭 이벤트 등록
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
	const activeTab = getCheckedTab();
	if (activeTab === 'tab1') {
		calculateChemicalVolume();
	} else {
		calculateTotalVolume();
	}
	// Display the selected brand alert
	const selectedBrandAlert = document.querySelector('.selected-brand-alert');
	const brandElement = button.closest('.product-item').querySelector('.brand');
	if (selectedBrandAlert && brandElement) {
		selectedBrandAlert.innerHTML = `<div class="inner"><i class="ti ti-circle-check"></i><div><p>선택하신 제품은 ${brandElement.innerHTML}이며, </p><p>희석비는 <strong>1:${dilutionValue}</strong>입니다.</p></div></div>`;
		selectedBrandAlert.classList.add('active');
		selectedBrandAlert.style.opacity = '1';
		setTimeout(() => {
			selectedBrandAlert.style.transition = 'opacity 500ms';
			selectedBrandAlert.style.opacity = '0';
			setTimeout(() => {
				selectedBrandAlert.classList.remove('active');
				selectedBrandAlert.style.transition = '';
			}, 500); // 3초 후에 .active 삭제
		}, 2000); // 3초 후에 opacity: 0으로 변경
	}
};
const getActiveTabInputSelector = () => {
	const activeTab = document.querySelector('.tab-body.active');
	if (!activeTab) return null;
	return activeTab.dataset.tab === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2';
};
