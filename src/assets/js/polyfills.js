// CSS Custom Properties (CSS 변수) 폴리필
(function () {
	if (!window.CSS || !window.CSS.supports || !window.CSS.supports('--a', 0)) {
		const style = document.createElement('style');
		style.textContent = `
      :root {
        --globalnav-background: rgba(255, 255, 255, 0.6);
        --base-color: #111;
        --base-color-sub: #999;
        --bg-opacity: #1919194d;
        --bg-contents: #fff;
        --bg-contents-rgb: 255, 255, 255;
        --bg-check-input: #000;
        --bg-check-input-label: #fff;
        --graph-border: #eee;
        --graph-bg-gradient1: #fafafa;
        --graph-bg-gradient2: transparent;
        --btn: #151515;
        --btn-text: #fff;
        --bg-form: transparent;
        --bg-form-inner: #fafafa;
        --placeholder: #d1d1d1;
        --copyright: #aaa;
        --line-color: #ff2119;
        --bg-tab: #fafafa;
        --tab-default-text: #aaa;
        --tab-active-text: #fff;
        --tab-line: #1f1f1f;
        --bg-modal: 3, 3, 3;
        --bg-modal-content: #fff;
        --modal-text: #111;
        --notice-text: #666;
        --quick-line: #fff;
        --bg-input: #f9f9f9;
        --border-input: #e1e1e1;
        --input-placeholder: #999;
        --input-text: #151515;
        --bg-quick: #aaa;
        --etc: #888;
        --product-line: #e1e1e1;
        --btn-dilution-line: #e1e1e1;
        --btn-dilution-bg: #fff;
        --btn-dilution-hover: #1f1f1f;
        --alert-color: #151515;
        --alert-title: #151515;
        --alert-text: #4e4e4e;
        --alert-border: rgba(214, 214, 214, 0.25);
      }
    `;
		document.head.appendChild(style);
	}
})();

// backdrop-filter 폴리필
(function () {
	if (!CSS.supports('backdrop-filter', 'blur(1px)')) {
		const style = document.createElement('style');
		style.textContent = `
      .modal {
        background-color: rgba(var(--bg-modal), 0.8) !important;
      }
      .header {
        background-color: rgba(var(--bg-contents-rgb), 0.8) !important;
      }
      .selected-brand-alert .inner {
        background-color: rgba(var(--bg-contents-rgb), 0.8) !important;
      }
    `;
		document.head.appendChild(style);
	}
})();

// gap 속성 폴리필
(function () {
	if (!CSS.supports('gap', '1px')) {
		const style = document.createElement('style');
		style.textContent = `
      .form {
        margin: -1px;
      }
      .form dl {
        margin: 1px;
      }
      .btn-area {
        margin: -2px;
      }
      .btn-area button {
        margin: 2px;
      }
      .graph-container {
        margin: -20px;
      }
      .graph-container > * {
        margin: 20px;
      }
      .quick-area .inner {
        margin: -4px;
      }
      .quick-area .inner > * {
        margin: 4px;
      }
    `;
		document.head.appendChild(style);
	}
})(); 
