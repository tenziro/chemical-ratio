document.addEventListener("DOMContentLoaded", function () {
	// 탭 헤더와 리셋 버튼 등을 가져오기
	const tabHeaderItem = document.querySelector(".tab-header .radio-label");
	const btnReset = document.querySelector(".btn-reset");

	// 탭1 입력 필드와 탭2 입력 필드 구조 정의
	const inputsTab1 = {
		dilutionRatio: document.querySelector("#dilutionRatio"),
		waterVolume: document.querySelector("#waterVolume"),
	};

	const inputsTab2 = {
		dilutionRatio2: document.querySelector("#dilutionRatio2"),
		totalVolume: document.querySelector("#totalCapacity"),
	};

	// 입력 이벤트 등록 함수 호출
	registerInputEventsTab(inputsTab1, calculateChemicalVolume, btnReset);
	registerInputEventsTab(inputsTab2, calculateTotalVolume, btnReset);

	// 리셋 버튼 및 탭 헤더 클릭 이벤트 등록
	btnReset.addEventListener("click", resetAll);
	tabHeaderItem.addEventListener("click", resetAll);

	// 모달 열기/닫기 이벤트 등록
	document.querySelector('.btn-modal-close').addEventListener('click', toggleModal);
	document.querySelector('.btn-information').addEventListener('click', toggleModal);

	// 탭1, 탭2 리셋 버튼 클릭 이벤트 등록
	document.addEventListener('click', function (event) {
		if (event.target.matches('#tab1 .btn-reset') || event.target.matches('#tab2 .btn-reset')) {
			resetAll();
		}
	});

	// 탭 변경 이벤트 등록
	tabRadio.addEventListener('change', showTab);

	// 입력 필드 이벤트 등록 함수
	function registerInputEventsTab(inputs, calculateFunction, btnReset) {
		Object.values(inputs).forEach(input => {
			input.addEventListener("input", handleInput);
			input.addEventListener("input", updateResetButtonState);
		});

		btnReset.addEventListener("click", resetAll);

		// 입력 값 변경 시 계산 함수 호출
		function handleInput() {
			calculateFunction();
		}
	}
});

// 리셋 버튼 상태 업데이트 함수
function updateResetButtonState() {
	// 탭1과 탭2의 입력 필드 및 리셋 버튼 선택
	const tab1Inputs = [document.querySelector("#dilutionRatio"), document.querySelector("#waterVolume")];
	const tab2Inputs = [document.querySelector("#dilutionRatio2"), document.querySelector("#totalCapacity")];
	const tab1ResetButton = document.querySelector("#tab1 .btn-reset");
	const tab2ResetButton = document.querySelector("#tab2 .btn-reset");

	// 리셋 버튼 비활성화 조건 확인 및 적용
	tab1ResetButton.disabled = !tab1Inputs.some(input => input.value.trim() !== "");
	tab2ResetButton.disabled = !tab2Inputs.some(input => input.value.trim() !== "");
}

// 모달 열기/닫기 함수
function toggleModal() {
	const modal = document.querySelector('.modal');
	modal.classList.toggle('active');
}

// 전체 리셋 함수
function resetAll() {
	resetAllTab1();
	resetAllTab2();
}

// 탭1 리셋 함수
function resetAllTab1() {
	// 탭1 입력 필드, 바, 텍스트, 결과, 리셋 버튼 선택
	const inputs = ["#dilutionRatio", "#waterVolume"];
	const bars = ["#tab1 .total-bar", "#tab1 .chemical-bar"];
	const texts = ["#tab1 .chemical-ratio", "#tab1 .water-ratio"];
	const results = ["#tab1 .chemical-result", "#tab1 .total-result"];
	const resets = ["#tab1 .btn-reset"];

	// 선택된 요소들 초기화
	inputs.forEach(selector => {
		document.querySelector(selector).value = "";
	});

	bars.forEach(selector => {
		document.querySelector(selector).style.height = '0%';
	});

	texts.forEach(selector => {
		document.querySelector(selector).innerText = ``;
	});

	results.forEach(selector => {
		document.querySelector(selector).innerText = '0ml';
	});

	resets.forEach(selector => {
		document.querySelector(selector).disabled = true;
	});
}

// 탭2 리셋 함수
function resetAllTab2() {
	// 탭2 입력 필드, 바, 텍스트, 결과, 리셋 버튼 선택
	const inputs = ["#dilutionRatio2", "#totalCapacity"];
	const bars = ["#tab2 .chemical-bar", "#tab2 .chemical-bar2", "#tab2 .water-bar"];
	const texts = ["#tab2 .total-ratio", "#tab2 .chemical-ratio"];
	const results = ["#tab2 .chemical-result", "#tab2 .total-result"];
	const resets = ["#tab2 .btn-reset"];

	// 선택된 요소들 초기화
	inputs.forEach(selector => {
		document.querySelector(selector).value = "";
	});

	bars.forEach(selector => {
		document.querySelector(selector).style.height = '0%';
	});

	texts.forEach(selector => {
		document.querySelector(selector).innerText = ``;
	});

	results.forEach(selector => {
		document.querySelector(selector).innerText = '0ml';
	});

	resets.forEach(selector => {
		document.querySelector(selector).disabled = true;
	});
}

// 숫자 확인 함수
function isNumber(value) {
	return !isNaN(value) && isFinite(value);
}

// 입력 필드에 콤마 추가 및 계산 함수
function formatInput(element) {
	const value = element.value.replace(/,/g, '');
	element.value = value.toLocaleString();
	calculateChemicalVolume();
}

// 숫자에 3자리마다 쉼표를 추가하는 함수
function formatNumberWithCommas(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 숫자 표시
document.querySelector("#dilutionRatio").addEventListener('input', function (e) {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});
document.querySelector("#waterVolume").addEventListener('input', function (e) {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});
document.querySelector("#dilutionRatio2").addEventListener('input', function (e) {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});
document.querySelector("#totalCapacity").addEventListener('input', function (e) {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});

// 탭 관련 코드
const tabRadio = document.querySelector("#contents-tab1");
const tabs = {
	tab1: document.querySelector("#tab1"),
	tab2: document.querySelector("#tab2"),
};
const tabLine = document.querySelector(".tab-line");

tabRadio.addEventListener('change', showTab);

// 탭 전환 함수
function showTab() {
	const tabToShow = tabRadio.checked ? tabs.tab1 : tabs.tab2;
	const tabToHide = tabRadio.checked ? tabs.tab2 : tabs.tab1;

	tabToShow.style.display = "flex";
	tabToHide.style.display = "none";
	tabLine.style.transform = tabRadio.checked ? "translateX(0%)" : "translateX(100%)";
}

// 탭1 케미컬 용량 계산 함수
function calculateChemicalVolume() {
	const dilutionRatioInput = document.querySelector("#dilutionRatio");
	const waterVolumeInput = document.querySelector("#waterVolume");

	const dilutionRatioValue = parseFloat(dilutionRatioInput.value.replace(/,/g, ''));
	const waterVolumeValue = parseFloat(waterVolumeInput.value.replace(/,/g, ''));

	if (isNaN(dilutionRatioValue)) {
		dilutionRatioInput.value = "";
	}

	if (isNaN(waterVolumeValue)) {
		waterVolumeInput.value = "";
	}

	if (!dilutionRatioInput.value || !waterVolumeInput.value) {
		return;
	}

	const chemicalVolume = waterVolumeValue / dilutionRatioValue;
	const totalVolume = chemicalVolume + waterVolumeValue;

	const roundedChemicalVolume = Math.round(chemicalVolume * 10) / 10;

	const formattedRoundedChemicalInput = dilutionRatioValue.toLocaleString('en-US', { maximumFractionDigits: 1 })
	const formattedRoundedChemicalVolume = roundedChemicalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedWaterVolume = waterVolumeValue.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedTotalVolume = totalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });

	displayGraphTab1(waterVolumeValue, roundedChemicalVolume);
	document.querySelector("#tab1 .chemical-ratio").innerText = `(희석비 - 1:${formattedRoundedChemicalInput})`;
	document.querySelector("#tab1 .water-ratio").innerText = `(물 용량 - ${formattedWaterVolume}ml)`;
	document.querySelector("#tab1 .chemical-result").innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('#tab1 .total-result').innerText = `${formattedTotalVolume}ml`;
}

// 탭1 물 그래프 표시 함수
function displayGraphTab1(waterVolume, chemicalVolume) {
	const totalPercentage = 100;
	const chemicalPercentage = (chemicalVolume / waterVolume) * 100;

	document.querySelector("#tab1 .total-bar").style.height = '0%';
	document.querySelector("#tab1 .chemical-bar").style.height = '0%';

	setTimeout(() => {
		document.querySelector("#tab1 .total-bar").style.height = `${totalPercentage}%`;
		document.querySelector("#tab1 .chemical-bar").style.height = `${chemicalPercentage}%`;
	}, 100)
}

// 탭2 전체 용량 계산 함수
function calculateTotalVolume() {
	const dilutionRatioInput = document.querySelector("#dilutionRatio2");
	const totalVolumeInput = document.querySelector("#totalCapacity");

	const dilutionRatioValue = parseFloat(dilutionRatioInput.value.replace(/,/g, ''));
	const totalVolumeValue = parseFloat(totalVolumeInput.value.replace(/,/g, ''));

	if (isNaN(dilutionRatioValue)) {
		dilutionRatioInput.value = "";
	}

	if (isNaN(totalVolumeValue)) {
		totalVolumeInput.value = "";
	}

	if (!dilutionRatioInput.value || !totalVolumeInput.value) {
		return;
	}

	const chemicalAmount = totalVolumeValue / (dilutionRatioValue + 1);
	const waterAmount = totalVolumeValue - chemicalAmount;

	const roundedChemicalVolume = Math.round(chemicalAmount * 10) / 10;

	const formattedRoundedChemicalInput = dilutionRatioValue.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedRoundedChemicalVolume = roundedChemicalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedTotalVolume = totalVolumeValue.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedWaterVolume = waterAmount.toLocaleString('en-US', { maximumFractionDigits: 1 });

	displayGraphTab2(chemicalAmount, totalVolumeValue, waterAmount);

	document.querySelector("#tab2 .chemical-ratio").innerText = `(희석비 - 1:${formattedRoundedChemicalInput})`;
	document.querySelector('#tab2 .chemical-result').innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('#tab2 .total-result').innerText = `${formattedTotalVolume}ml`;
	document.querySelector('#tab2 .total-ratio').innerText = `(물 용량 - ${formattedWaterVolume}ml)`;
}

// 탭2 물 그래프 표시 함수
function displayGraphTab2(chemicalAmount, totalVolumeValue, waterAmount) {
	const graph1ChemicalHeight = (chemicalAmount / totalVolumeValue) * 100;
	const graph2ChemicalHeight = (chemicalAmount / totalVolumeValue) * 100;
	const graph2WaterHeight = (waterAmount / totalVolumeValue) * 100;

	document.querySelector("#tab2 .chemical-bar").style.height = '0%';
	document.querySelector("#tab2 .chemical-bar2").style.height = '0%';
	document.querySelector("#tab2 .water-bar").style.height = '0%';

	setTimeout(() => {
		document.querySelector('#tab2 .chemical-bar').style.height = graph1ChemicalHeight + '%';
		document.querySelector('#tab2 .chemical-bar2').style.height = graph2ChemicalHeight + '%';
		document.querySelector('#tab2 .water-bar').style.height = graph2WaterHeight + '%';
	}, 100)
}
