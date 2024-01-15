document.addEventListener("DOMContentLoaded", () => {
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

	registerInputEventsTab(inputsTab1, calculateChemicalVolume, btnReset);
	registerInputEventsTab(inputsTab2, calculateTotalVolume, btnReset);

	btnReset.addEventListener("click", resetAll);
	tabHeaderItem.addEventListener("click", resetAll);

	document.querySelector('.btn-modal-close').addEventListener('click', toggleModal);
	document.querySelector('.btn-information').addEventListener('click', toggleModal);

	document.addEventListener('click', (event) => {
		if (event.target.matches('#tab1 .btn-reset') || event.target.matches('#tab2 .btn-reset')) {
			resetAll();
		}
	});

	tabRadio.addEventListener('change', showTab);

	function registerInputEventsTab(inputs, calculateFunction, btnReset) {
		Object.values(inputs).forEach(input => {
			input.addEventListener("input", handleInput);
			input.addEventListener("input", updateResetButtonState);
		});

		btnReset.addEventListener("click", resetAll);

		function handleInput() {
			calculateFunction();
		}
	}

});

function updateResetButtonState() {
	const tab1Inputs = [document.querySelector("#dilutionRatio"), document.querySelector("#waterVolume")];
	const tab2Inputs = [document.querySelector("#dilutionRatio2"), document.querySelector("#totalCapacity")];
	const tab1ResetButton = document.querySelector("#tab1 .btn-reset");
	const tab2ResetButton = document.querySelector("#tab2 .btn-reset");

	tab1ResetButton.disabled = !tab1Inputs.some(input => input.value.trim() !== "");
	tab2ResetButton.disabled = !tab2Inputs.some(input => input.value.trim() !== "");
}

function toggleModal() {
	const modal = document.querySelector('.modal');
	const body = document.body;
	modal.classList.toggle('active');
	body.classList.toggle('stop-scroll');
}

function resetAll() {
	resetAllTab1();
	resetAllTab2();
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
}

function resetAllTab1() {
	const inputs = ["#dilutionRatio", "#waterVolume"];
	const bars = ["#tab1 .total-bar", "#tab1 .chemical-bar"];
	const texts = ["#tab1 .chemical-ratio", "#tab1 .total-ratio"];
	const results = ["#tab1 .chemical-result", "#tab1 .water-result"];
	const resets = ["#tab1 .btn-reset"];

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

function resetAllTab2() {
	const inputs = ["#dilutionRatio2", "#totalCapacity"];
	const bars = ["#tab2 .chemical-bar", "#tab2 .chemical-bar2", "#tab2 .water-bar"];
	const texts = ["#tab2 .total-ratio", "#tab2 .chemical-ratio"];
	const results = ["#tab2 .chemical-result", "#tab2 .total-result"];
	const resets = ["#tab2 .btn-reset"];

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

function isNumber(value) {
	return !isNaN(value) && isFinite(value);
}

function formatInput(element) {
	const value = element.value.replace(/,/g, '');
	element.value = value.toLocaleString();
}

function formatNumberWithCommas(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.querySelector("#dilutionRatio").addEventListener('input', (e) => {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});

document.querySelector("#waterVolume").addEventListener('input', (e) => {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});

document.querySelector("#dilutionRatio2").addEventListener('input', (e) => {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});

document.querySelector("#totalCapacity").addEventListener('input', (e) => {
	let value = parseFloat(e.target.value.replace(/,/g, ''));
	if (!isNaN(value)) {
		e.target.value = formatNumberWithCommas(value);
	}
});

const tabRadio = document.querySelector("#contents-tab1");
const tabs = {
	tab1: document.querySelector("#tab1"),
	tab2: document.querySelector("#tab2"),
};
const tabLine = document.querySelector(".tab-line");

tabRadio.addEventListener('change', showTab);

function showTab() {
	const tabToShow = tabRadio.checked ? tabs.tab1 : tabs.tab2;
	const tabToHide = tabRadio.checked ? tabs.tab2 : tabs.tab1;

	tabToShow.style.display = "flex";
	tabToHide.style.display = "none";
	tabLine.style.transform = tabRadio.checked ? "translateX(0%)" : "translateX(100%)";

	window.scrollTo({
		top: 0,
		behavior: 'smooth' // 부드러운 스크롤 효과를 위해 추가
	});
}

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
	document.querySelector("#tab1 .total-ratio").innerText = `(전체 용량 - ${formattedTotalVolume}ml)`;
	document.querySelector("#tab1 .chemical-result").innerText = `${formattedRoundedChemicalVolume}ml`;
	document.querySelector('#tab1 .water-result').innerText = `${formattedWaterVolume}ml`;
}

function displayGraphTab1(waterVolume, chemicalVolume) {
	const totalPercentage = 100;
	const chemicalPercentage = (chemicalVolume / waterVolume) * 100;

	document.querySelector("#tab1 .total-bar").style.height = '0%';
	document.querySelector("#tab1 .chemical-bar").style.height = '0%';

	setTimeout(() => {
		document.querySelector("#tab1 .total-bar").style.height = totalPercentage + '%';
		document.querySelector("#tab1 .chemical-bar").style.height = chemicalPercentage + '%';
	}, 100)
}

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
