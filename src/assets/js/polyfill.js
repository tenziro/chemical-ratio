// iOS 12.5.7 호환성을 위한 폴리필

// dvh 단위 폴리필
(function () {
	function updateViewportHeight() {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}

	updateViewportHeight();
	window.addEventListener('resize', updateViewportHeight);
	window.addEventListener('orientationchange', updateViewportHeight);
})();

// backdrop-filter 폴리필
(function () {
	if (!CSS.supports('backdrop-filter', 'blur(1px)')) {
		const elements = document.querySelectorAll('[style*="backdrop-filter"]');
		elements.forEach(element => {
			const computedStyle = window.getComputedStyle(element);
			const bgColor = computedStyle.backgroundColor;
			element.style.backgroundColor = bgColor;
		});
	}
})();

// gap 속성 폴리필
(function () {
	if (!CSS.supports('gap', '1px')) {
		const elements = document.querySelectorAll('[style*="gap"]');
		elements.forEach(element => {
			const computedStyle = window.getComputedStyle(element);
			const gap = computedStyle.gap;
			if (gap) {
				const [rowGap, columnGap] = gap.split(' ');
				element.style.margin = `-${rowGap} -${columnGap || rowGap}`;
				Array.from(element.children).forEach(child => {
					child.style.margin = `${rowGap} ${columnGap || rowGap}`;
				});
			}
		});
	}
})();

// env() 함수 폴리필
(function () {
	if (!CSS.supports('env(safe-area-inset-top)')) {
		const style = document.createElement('style');
		style.textContent = `
      :root {
        --sat: 0px;
        --sar: 0px;
        --sab: 0px;
        --sal: 0px;
      }
    `;
		document.head.appendChild(style);
	}
})();

// display-mode: standalone 폴리필
(function () {
	if (!window.matchMedia('(display-mode: standalone)').matches) {
		const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
		if (isStandalone) {
			document.documentElement.classList.add('standalone');
		}
	}
})(); 
