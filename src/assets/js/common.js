// * 페이지가 로드될 때 또는 DOM이 준비되었을 때 실행될 초기 함수
document.addEventListener("DOMContentLoaded", function () {
	const dilutionRatioInput = document.querySelector("#dilutionRatio");
	const waterVolumeInput = document.querySelector("#waterVolume");
	const dilutionRatio2Input = document.querySelector("#dilutionRatio2");
	const totalVolumeInput = document.querySelector("#totalCapacity");
	const tabHeaderItem = document.querySelector(".tab-header .radio-label");
	const btnReset = document.querySelector(".btn-reset");

	registerInputEvents(dilutionRatioInput, waterVolumeInput, dilutionRatio2Input, totalVolumeInput, btnReset);
	btnReset.addEventListener("click", resetAll);
	tabHeaderItem.addEventListener("click", resetAll);

	// .btn-modal-close를 클릭하면 .modal에서 .active를 제거한다.
	document.querySelector('.btn-modal-close').addEventListener('click', function () {
		const modal = document.querySelector('.modal');
		modal.classList.remove('active');
	});

	// .btn-information을 클릭하면 .modal에 .active를 추가한다.
	document.querySelector('.btn-information').addEventListener('click', function () {
		const modal = document.querySelector('.modal');
		modal.classList.add('active');
	});
});

function registerInputEvents(dilutionRatioInput, waterVolumeInput, dilutionRatio2Input, totalVolumeInput, btnReset) {
	dilutionRatioInput.addEventListener("input", handleInput);
	waterVolumeInput.addEventListener("input", handleInput);
	dilutionRatio2Input.addEventListener("input", handleInput);
	totalVolumeInput.addEventListener("input", handleInput);

	[dilutionRatioInput, waterVolumeInput, dilutionRatio2Input, totalVolumeInput].forEach(input => {
		input.addEventListener("input", updateResetButtonState);
	});
}

function handleInput() {
	calculateChemicalVolume();
}

function updateResetButtonState() {
	const hasValue = [document.querySelector("#dilutionRatio").value, document.querySelector("#waterVolume").value, document.querySelector("#dilutionRatio2").value, document.querySelector("#totalCapacity").value].some(value => value.trim() !== "");
	document.querySelector(".btn-reset").disabled = !hasValue;
}

function resetAll() {
	const inputs = ["#dilutionRatio", "#waterVolume", "#dilutionRatio2", "#totalCapacity"];
	const bars = ["#tab1 .total-bar", "#tab1 .chemical-bar", "#tab2 .chemical-bar", "#tab2 .chemical-bar2", "#tab2 .water-bar"];

	inputs.forEach(selector => {
		document.querySelector(selector).value = "";
	});

	bars.forEach(selector => {
		document.querySelector(selector).style.height = '0%';
	});

	document.querySelector("#tab1 .chemical-result").innerText = "0ml";
	document.querySelector('#tab1 .total-result').innerText = "0ml";
	document.querySelector("#tab1 .chemical-ratio").innerText = ``;
	document.querySelector("#tab1 .water-ratio").innerText = ``;
	document.querySelector('#tab2 .total-ratio').innerText = ``;
	document.querySelector("#tab2 .chemical-ratio").innerText = ``;
	document.querySelector('#tab2 .chemical-result').innerText = '0ml';
	document.querySelector('#tab2 .total-result').innerText = '0ml';
	document.querySelector('#tab2 .chemical-bar').style.height = '0%';
	document.querySelector('#tab2 .chemical-bar2').style.height = '0%';
	document.querySelector('#tab2 .water-bar').style.height = '0%';
	document.querySelector(".btn-reset").disabled = true;
}

// * 숫자 확인 함수
function isNumber(value) {
	return !isNaN(value) && isFinite(value);
}

// * 물 그래프 그리기
function displayGraph(waterVolume, chemicalVolume) {
	// 물의 양을 100%로 설정
	const totalPercentage = 100;
	// 케미컬 양에 따른 % 계산
	const chemicalPercentage = (chemicalVolume / waterVolume) * 100;

	// 그래프 바의 높이 초기화
	document.querySelector("#tab1 .total-bar").style.height = '0%';
	document.querySelector("#tab1 .chemical-bar").style.height = '0%';

	// 높이 값을 다시 설정
	setTimeout(() => {
		document.querySelector("#tab1 .total-bar").style.height = `${totalPercentage}%`;
		document.querySelector("#tab1 .chemical-bar").style.height = `${chemicalPercentage}%`;
	}, 100)
}

// * 입력 필드에 콤마 추가 및 계산
function formatInput(element) {
	const value = element.value.replace(/,/g, '');
	element.value = value.toLocaleString();  // 콤마 추가
	calculateChemicalVolume();  // 값이 변경될 때마다 자동으로 계산
}

// * 숫자에 3자리마다 쉼표를 추가하는 함수
function formatNumberWithCommas(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// * 숫자 표시
document.querySelector("#dilutionRatio").addEventListener('input', function (e) {
	// 입력된 값 가져오기
	let value = parseFloat(e.target.value.replace(/,/g, '')); // 쉼표 제거 후 숫자로 변환

	// 입력된 값이 유효한 숫자인지 확인
	if (!isNaN(value)) {
		// 3자리마다 쉼표를 추가하여 화면에 표시
		e.target.value = formatNumberWithCommas(value);
	}
});
document.querySelector("#waterVolume").addEventListener('input', function (e) {
	// 입력된 값 가져오기
	let value = parseFloat(e.target.value.replace(/,/g, '')); // 쉼표 제거 후 숫자로 변환

	// 입력된 값이 유효한 숫자인지 확인
	if (!isNaN(value)) {
		// 3자리마다 쉼표를 추가하여 화면에 표시
		e.target.value = formatNumberWithCommas(value);
	}
});
document.querySelector("#dilutionRatio2").addEventListener('input', function (e) {
	// 입력된 값 가져오기
	let value = parseFloat(e.target.value.replace(/,/g, '')); // 쉼표 제거 후 숫자로 변환

	// 입력된 값이 유효한 숫자인지 확인
	if (!isNaN(value)) {
		// 3자리마다 쉼표를 추가하여 화면에 표시
		e.target.value = formatNumberWithCommas(value);
	}
});
document.querySelector("#totalCapacity").addEventListener('input', function (e) {
	// 입력된 값 가져오기
	let value = parseFloat(e.target.value.replace(/,/g, '')); // 쉼표 제거 후 숫자로 변환

	// 입력된 값이 유효한 숫자인지 확인
	if (!isNaN(value)) {
		// 3자리마다 쉼표를 추가하여 화면에 표시
		e.target.value = formatNumberWithCommas(value);
	}
});

// * tab
const showTab = () => {
	const tabRadio = document.querySelector("#contents-tab1");
	const tab1 = document.querySelector("#tab1");
	const tab2 = document.querySelector("#tab2");
	const tabLine = document.querySelector(".tab-line");

	if (tabRadio.checked) {
		tab1.style.display = "flex";
		tab2.style.display = "none";
		tabLine.style.transform = "translateX(0%)";
	} else {
		tab1.style.display = "none";
		tab2.style.display = "flex";
		tabLine.style.transform = "translateX(100%)";
	}
}

// ! 케미컬 희석비 + 용량, 물 용량 계산
function calculateChemicalVolume() {
	const dilutionRatioInput = document.querySelector("#dilutionRatio");
	const waterVolumeInput = document.querySelector("#waterVolume");

	// 숫자 확인 및 변환
	const dilutionRatioValue = parseFloat(dilutionRatioInput.value.replace(/,/g, ''));
	const waterVolumeValue = parseFloat(waterVolumeInput.value.replace(/,/g, ''));

	// 값이 숫자가 아닌 경우 입력 필드의 값을 비웁니다.
	if (isNaN(dilutionRatioValue)) {
		dilutionRatioInput.value = "";
	}

	if (isNaN(waterVolumeValue)) {
		waterVolumeInput.value = "";
	}

	// 두 입력 필드 중 하나라도 값이 없으면 결과를 출력하지 않습니다.
	if (!dilutionRatioInput.value || !waterVolumeInput.value) {
		return;
	}

	// 케미컬의 용량 계산
	const chemicalVolume = waterVolumeValue / dilutionRatioValue;
	const totalVolume = chemicalVolume + waterVolumeValue;

	// 소수점 첫째자리까지 반올림
	const roundedChemicalVolume = Math.round(chemicalVolume * 10) / 10;

	// 결과값을 숫자로 변환한 후 3자리마다 쉼표 추가하여 표시
	const formattedRoundedChemicalInput = dilutionRatioValue.toLocaleString('en-US', { maximumFractionDigits: 1 })
	const formattedRoundedChemicalVolume = roundedChemicalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedWaterVolume = waterVolumeValue.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedTotalVolume = totalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });

	// 그래프 표시
	displayGraph(waterVolumeValue, roundedChemicalVolume);
	document.querySelector("#tab1 .chemical-ratio").innerText = `(희석비 - 1:${formattedRoundedChemicalInput})`;
	document.querySelector("#tab1 .water-ratio").innerText = `(물 용량 - ${formattedWaterVolume}ml)`;
	document.querySelector("#tab1 .chemical-result").innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('#tab1 .total-result').innerText = `${formattedTotalVolume}ml`;
}

// ! 케미컬 희석비 + 용량, 물 용량 + 전체 용량 계산
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#dilutionRatio2').addEventListener('input', calculateTotalVolume);
	document.querySelector('#totalCapacity').addEventListener('input', calculateTotalVolume);
});

function calculateTotalVolume() {
	const dilutionRatioInput = document.querySelector("#dilutionRatio2");
	const totalVolumeInput = document.querySelector("#totalCapacity");

	const dilutionRatioValue = parseFloat(dilutionRatioInput.value.replace(/,/g, ''));
	const totalVolumeValue = parseFloat(totalVolumeInput.value.replace(/,/g, ''));

	// 값이 숫자가 아닌 경우 입력 필드의 값을 비웁니다.
	if (isNaN(dilutionRatioValue)) {
		dilutionRatioInput.value = "";
	}

	if (isNaN(totalVolumeValue)) {
		totalVolumeInput.value = "";
	}

	// 두 입력 필드 중 하나라도 값이 없으면 결과를 출력하지 않습니다.
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

	document.querySelector("#tab2 .chemical-ratio").innerText = `(희석비 - 1:${formattedRoundedChemicalInput})`;
	document.querySelector('#tab2 .chemical-result').innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('#tab2 .total-result').innerText = `${formattedTotalVolume} ml`;
	document.querySelector('#tab2 .total-ratio').innerText = `(물 용량 - ${formattedWaterVolume} ml)`;

	const graph1ChemicalHeight = (chemicalAmount / totalVolumeValue) * 100;
	document.querySelector('#tab2 .chemical-bar').style.height = graph1ChemicalHeight + '%';

	const graph2ChemicalHeight = (chemicalAmount / totalVolumeValue) * 100;
	const graph2WaterHeight = (waterAmount / totalVolumeValue) * 100;

	document.querySelector('#tab2 .chemical-bar2').style.height = graph2ChemicalHeight + '%';
	document.querySelector('#tab2 .water-bar').style.height = graph2WaterHeight + '%';
}
