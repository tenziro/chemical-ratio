// * DOMContentLoaded 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
	// * 요소 선택
	const tabHeaderItem = document.querySelector(".tab-header .radio-label");
	const btnReset = document.querySelector(".btn-reset");

	const inputsTab1 = {
		dilutionRatio: document.querySelector("#dilutionRatio"),
		waterVolume: document.querySelector("#waterVolume"),
	};

	const inputsTab2 = {
		dilutionRatio2: document.querySelector("#dilutionRatio2"),
		totalVolume: document.querySelector("#totalCapacity"),
	};

	// * .quick-area 스크롤 이벤트 등록
	document.querySelectorAll('.quick-area .inner').forEach(quickArea => {
		const quickAreaParent = quickArea.parentElement;
		const checkScroll = () => {
			if (quickArea.scrollWidth <= quickArea.clientWidth) {
				quickAreaParent.classList.add('hide-after');
			} else {
				quickAreaParent.classList.remove('hide-after');
			}
		};
		checkScroll();
		quickArea.addEventListener('scroll', () => {
			if (quickArea.scrollWidth - quickArea.scrollLeft <= quickArea.clientWidth) {
				quickAreaParent.classList.add('hide-after');
			} else {
				quickAreaParent.classList.remove('hide-after');
			}
		});
		window.addEventListener('resize', checkScroll);
	});

	// * 리셋 버튼 클릭 이벤트 등록
	btnReset.addEventListener("click", resetAll);
	tabHeaderItem.addEventListener("click", resetAll);

	// * 모달 닫기 버튼 클릭 이벤트 등록
	document.querySelector('.btn-modal-close').addEventListener('click', toggleModal);
	document.querySelector('.btn-information').addEventListener('click', toggleModal);

	// * 문서 클릭 이벤트 등록
	document.addEventListener('click', event => {
		if (event.target.matches('#tab1 .btn-reset') || event.target.matches('#tab2 .btn-reset')) {
			resetAll();
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
	document.querySelectorAll('.btn-dilution-ratio').forEach(button => {
		button.addEventListener('click', () => {
			const tabElement = button.closest('.tab-body');
			if (!tabElement) return;
			const tabId = tabElement.id;
			const inputSelector = tabId === 'tab1' ? '#dilutionRatio' : '#dilutionRatio2';
			const dilutionRatioInput = document.querySelector(inputSelector);
			const value = parseFloat(button.getAttribute('data-value').replace(/,/g, ''));
			const currentValue = parseFloat(dilutionRatioInput.value.replace(/,/g, '')) || 0;
			dilutionRatioInput.value = formatNumberWithCommas(currentValue + value);
			updateResetButtonState();
			if (tabId === 'tab1') {
				calculateChemicalVolume();
			} else {
				calculateTotalVolume();
			}
		});
	});

	// * 빠른 용량 추가 버튼 클릭 이벤트 등록
	document.querySelectorAll('.btn-capacity-ratio').forEach(button => {
		button.addEventListener('click', () => {
			const tabElement = button.closest('.tab-body');
			if (!tabElement) return;
			const tabId = tabElement.id;
			const inputSelector = tabId === 'tab1' ? '#waterVolume' : '#totalCapacity';
			const dilutionRatioInput = document.querySelector(inputSelector);
			const value = parseFloat(button.getAttribute('data-value').replace(/,/g, ''));
			const currentValue = parseFloat(dilutionRatioInput.value.replace(/,/g, '')) || 0;
			dilutionRatioInput.value = formatNumberWithCommas(currentValue + value);
			updateResetButtonState();
			if (tabId === 'tab1') {
				calculateChemicalVolume();
			} else {
				calculateTotalVolume();
			}
		});
	});
});

// ! 리셋 버튼 활성화 함수
const updateResetButtonState = () => {
	const tab1Inputs = [document.querySelector("#dilutionRatio"), document.querySelector("#waterVolume")];
	const tab2Inputs = [document.querySelector("#dilutionRatio2"), document.querySelector("#totalCapacity")];
	const tab1ResetButton = document.querySelector("#tab1 .btn-reset");
	const tab2ResetButton = document.querySelector("#tab2 .btn-reset");

	tab1ResetButton.disabled = !tab1Inputs.some(input => input.value.trim() !== "");
	tab2ResetButton.disabled = !tab2Inputs.some(input => input.value.trim() !== "");
};

// ! 모달창 제어 함수
const toggleModal = () => {
	const modal = document.querySelector('.modal');
	const body = document.body;
	modal.classList.toggle('active');
	body.classList.toggle('stop-scroll');
};

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
	resetAllTab1();
	resetAllTab2();
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
};

// ! 탭별 리셋 함수
const resetTab = (tabId, inputSelectors, barSelectors, textSelectors, resultSelectors, resetSelectors) => {
	inputSelectors.forEach(selector => {
		document.querySelector(selector).value = "";
	});

	barSelectors.forEach(selector => {
		document.querySelector(selector).style.height = '0%';
	});

	textSelectors.forEach(selector => {
		document.querySelector(selector).innerText = '';
	});

	resultSelectors.forEach(selector => {
		document.querySelector(selector).innerText = '0ml';
	});

	resetSelectors.forEach(selector => {
		document.querySelector(selector).disabled = true;
	});
};

// ! 탭1 리셋 함수
const resetAllTab1 = () => {
	resetTab("#tab1", ["#dilutionRatio", "#waterVolume"], ["#tab1 .total-bar", "#tab1 .chemical-bar"], ["#tab1 .chemical-ratio", "#tab1 .total-ratio"], ["#tab1 .chemical-result", "#tab1 .water-result"], ["#tab1 .btn-reset"]);
};

// ! 탭2  리셋 함수
const resetAllTab2 = () => {
	resetTab("#tab2", ["#dilutionRatio2", "#totalCapacity"], ["#tab2 .chemical-bar", "#tab2 .chemical-bar2", "#tab2 .water-bar"], ["#tab2 .total-ratio", "#tab2 .chemical-ratio"], ["#tab2 .chemical-result", "#tab2 .total-result"], ["#tab2 .btn-reset"]);
};

// ! 숫자인지 확인하는 함수
const isNumber = value => !isNaN(value) && isFinite(value);

// ! 숫자에 콤마 추가하는 함수
const formatNumberWithCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ! 숫자 포맷팅 함수
const formatNumber = (num) => num.toLocaleString('en-US', { maximumFractionDigits: 1 });

// ! 텍스트 내용 업데이트 함수
const updateTextContent = (selector, text) => {
	document.querySelector(selector).innerText = text;
};

// ! 입력값 포맷팅 핸들러
const formatInputHandler = event => {
	let value = event.target.value.replace(/,/g, '');
	let number = parseFloat(value);
	if (!isNaN(number)) {
		event.target.value = formatNumberWithCommas(number);
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
const tabRadio = document.querySelector("#contents-tab1");
const tabs = {
	tab1: document.querySelector("#tab1"),
	tab2: document.querySelector("#tab2"),
};
const tabLine = document.querySelector(".tab-line");
const showTab = () => {
	const isTab1Checked = tabRadio.checked;
	tabs.tab1.style.display = isTab1Checked ? "flex" : "none";
	tabs.tab2.style.display = isTab1Checked ? "none" : "flex";
	tabLine.style.transform = `translateX(${isTab1Checked ? 0 : 100}%)`;
	resetQuickArea();
	window.scrollTo({ top: 0, behavior: "smooth" });
};
tabRadio.addEventListener("change", showTab);

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
const calculateChemicalVolume = () => {
	const dilutionRatioValue = getInputValue("#dilutionRatio");
	const waterVolumeValue = getInputValue("#waterVolume");

	if (dilutionRatioValue === null || waterVolumeValue === null) return;

	const chemicalVolume = waterVolumeValue / dilutionRatioValue;
	const totalVolume = chemicalVolume + waterVolumeValue;

	displayGraphTab1(waterVolumeValue, chemicalVolume);

	updateTextContent("#tab1 .chemical-ratio", `(희석비 - 1:${formatNumber(dilutionRatioValue)})`);
	updateTextContent("#tab1 .total-ratio", `(전체 용량 - ${formatNumber(totalVolume)}ml)`);
	updateTextContent("#tab1 .chemical-result", `${formatNumber(chemicalVolume)}ml`);
	updateTextContent("#tab1 .water-result", `${formatNumber(waterVolumeValue)}ml`);
};

// ! 전체 용량 계산 함수
const calculateTotalVolume = () => {
	const dilutionRatioValue = getInputValue("#dilutionRatio2");
	const totalVolumeValue = getInputValue("#totalCapacity");

	if (dilutionRatioValue === null || totalVolumeValue === null) return;

	const chemicalAmount = totalVolumeValue / (dilutionRatioValue + 1);
	const waterAmount = totalVolumeValue - chemicalAmount;

	displayGraphTab2(chemicalAmount, totalVolumeValue, waterAmount);

	updateTextContent("#tab2 .chemical-ratio", `(희석비 - 1:${formatNumber(dilutionRatioValue)})`);
	updateTextContent("#tab2 .chemical-result", `${formatNumber(chemicalAmount)}ml`);
	updateTextContent("#tab2 .total-result", `${formatNumber(totalVolumeValue)}ml`);
	updateTextContent("#tab2 .total-ratio", `(물 용량 - ${formatNumber(waterAmount)}ml)`);
};

// ! 탭1 그래프 표시 함수
const displayGraphTab1 = (waterVolume, chemicalVolume) => {
	animateGraph(["#tab1 .total-bar", "#tab1 .chemical-bar"], [100, (chemicalVolume / waterVolume) * 100]);
};

// ! 탭2 그래프 표시 함수
const displayGraphTab2 = (chemicalAmount, totalVolumeValue, waterAmount) => {
	animateGraph(["#tab2 .chemical-bar", "#tab2 .chemical-bar2", "#tab2 .water-bar"],
		[(chemicalAmount / totalVolumeValue) * 100, (chemicalAmount / totalVolumeValue) * 100, (waterAmount / totalVolumeValue) * 100]);
};

