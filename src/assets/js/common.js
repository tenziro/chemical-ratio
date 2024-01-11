// * 페이지가 로드될 때 또는 DOM이 준비되었을 때 실행될 초기 함수
document.addEventListener("DOMContentLoaded", function () {
	// input 필드에 change 이벤트 리스너 추가
	document.querySelector("#dilutionRatio").addEventListener("input", calculateChemicalVolume);
	document.querySelector("#waterVolume").addEventListener("input", calculateChemicalVolume);
});

// * 입력된 값으로 계산
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

	// 소수점 첫째자리까지 반올림
	const roundedChemicalVolume = Math.round(chemicalVolume * 10) / 10;

	// 결과값을 숫자로 변환한 후 3자리마다 쉼표 추가하여 표시
	const formattedRoundedChemicalVolume = roundedChemicalVolume.toLocaleString('en-US', { maximumFractionDigits: 1 });
	const formattedWaterVolume = waterVolumeValue.toLocaleString('en-US', { maximumFractionDigits: 1 });

	// 그래프 표시
	displayGraph(waterVolumeValue, roundedChemicalVolume);

	document.querySelector(".chemical-result").innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('.water-result').innerText = `${formattedWaterVolume}ml`;
}

// * 숫자 확인 함수
function isNumber(value) {
	return !isNaN(value) && isFinite(value);
}

// * 물 그래프 그리기
function displayGraph(waterVolume, chemicalVolume) {
	// 물의 양을 100%로 설정
	const waterPercentage = 100;
	// 케미컬 양에 따른 % 계산
	const chemicalPercentage = (chemicalVolume / waterVolume) * 100;

	// 그래프 바의 높이 초기화
	document.querySelector("#waterBar").style.height = '0%';
	document.querySelector("#chemicalBar").style.height = '0%';

	// 높이 값을 다시 설정
	setTimeout(() => {
		document.querySelector("#waterBar").style.height = `${waterPercentage}%`;
		document.querySelector("#chemicalBar").style.height = `${chemicalPercentage}%`;
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

// * 초기화
document.addEventListener("DOMContentLoaded", function () {
	const inputDilutionRatio = document.querySelector("#dilutionRatio");
	const inputWaterVolume = document.querySelector("#waterVolume");
	const btnReset = document.querySelector(".btn-reset");
	// 초기 상태에서 .btn-reset 버튼을 비활성화(disabled)
	btnReset.disabled = true;
	// inputDilutionRatio 또는 inputWaterVolume 값이 변경될 때마다 이벤트 리스너를 추가
	[inputDilutionRatio, inputWaterVolume].forEach(input => {
		input.addEventListener("input", function () {
			// #d 또는 #wa 중 하나라도 값이 존재하면 .btn-reset의 disabled를 제거합니다.
			if (inputDilutionRatio.value.trim() !== "" || inputWaterVolume.value.trim() !== "") {
				btnReset.disabled = false;
			} else {
				btnReset.disabled = true;
			}
		});
	});
	// .btn-reset 버튼을 클릭했을 때 이벤트 리스너를 추가
	btnReset.addEventListener("click", function () {
		// #d와 #wa의 값을 초기화합니다.
		inputDilutionRatio.value = "";
		inputWaterVolume.value = "";
		// .btn-reset을 다시 비활성화(disabled)
		btnReset.disabled = true;
		document.querySelector("#waterBar").style.height = '0%';
		document.querySelector("#chemicalBar").style.height = '0%';
		document.querySelector(".chemical-result").innerText = `0ml`;
		document.querySelector('.water-result').innerText = `0ml`;
	});
});
