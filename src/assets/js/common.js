function isNumber(value) {
	return !isNaN(parseFloat(value)) && isFinite(value);
}

// 입력 필드의 값을 확인하고 버튼의 disabled 상태를 업데이트하는 함수
function updateButtonState() {
	const dilutionRatioValue = document.querySelector("#dilutionRatio").value.trim();
	const waterVolumeValue = document.querySelector("#waterVolume").value.trim();
	const calculateButton = document.querySelector(".btn-calculate"); // 버튼의 ID를 기반으로 선택

	// 두 입력 필드의 값이 모두 존재하는지 확인
	if (dilutionRatioValue && waterVolumeValue) {
		calculateButton.removeAttribute("disabled"); // disabled 속성 제거
	} else {
		calculateButton.setAttribute("disabled", "disabled"); // disabled 속성 추가
	}
}

// 각 입력 필드에 input 이벤트 리스너 추가
document.querySelector("#dilutionRatio").addEventListener('input', function () {
	updateButtonState(); // 입력 필드 값 변경 시 버튼 상태 업데이트
});

document.querySelector("#waterVolume").addEventListener('input', function () {
	updateButtonState(); // 입력 필드 값 변경 시 버튼 상태 업데이트
});

// 페이지 로드 시 초기 버튼 상태 업데이트
window.onload = function () {
	updateButtonState();
};

function displayGraph(waterVolume, chemicalVolume) {
	// 물의 양을 100%로 설정
	const waterPercentage = 100;
	// 케미컬 양에 따른 % 계산
	const chemicalPercentage = (chemicalVolume / waterVolume) * 100;

	// 그래프 바의 높이 설정
	document.querySelector("#waterBar").style.height = `${waterPercentage}%`;
	document.querySelector("#chemicalBar").style.height = `${chemicalPercentage}%`;
}

function calculateChemicalVolume() {
	const dilutionRatio = parseFloat(document.querySelector("#dilutionRatio").value.replace(/,/g, ''));
	const waterVolume = parseFloat(document.querySelector("#waterVolume").value.replace(/,/g, ''));

	if (!isNumber(dilutionRatio) || !isNumber(waterVolume) || dilutionRatio <= 0 || waterVolume <= 0) {
		alert("올바른 숫자를 입력하세요.");
		return;
	}

	// 케미컬의 용량 계산
	const chemicalVolume = waterVolume / dilutionRatio;

	// 소수점 첫째자리까지 반올림
	const roundedChemicalVolume = Math.round(chemicalVolume * 10) / 10;

	// 결과값을 숫자로 변환한 후 3자리마다 쉼표 추가하여 표시
	const formattedRoundedChemicalVolume = roundedChemicalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedWaterVolume = waterVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });

	// 그래프 표시
	displayGraph(waterVolume, roundedChemicalVolume);

	document.querySelector(".chemical-result").innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('.water-result').innerText = `${formattedWaterVolume}ml`;
}

// 숫자에 3자리마다 쉼표를 추가하는 함수
function formatNumberWithCommas(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
