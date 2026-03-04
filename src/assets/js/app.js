import { UIManager } from './modules/UIManager.js';

/**
 * 앱 초기화 (엔트리 포인트)
 */
document.addEventListener("DOMContentLoaded", () => {
	new UIManager();
});
