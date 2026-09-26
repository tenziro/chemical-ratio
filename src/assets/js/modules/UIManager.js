import { Config } from './Config.js';
import { Utils } from './Utils.js';
import { Calculator } from './Calculator.js';
import { DataManager } from './DataManager.js';

/**
 * UI 관리자
 * DOM 조작, 이벤트 처리, 상태 동기화
 */
export class UIManager {
	constructor() {
		this.searchDebounceId = null;
		this.numberRaf = new WeakMap();
		this.alertTimer = null;
		this.alertTransitionHandler = null;
		this.lastFocusedBeforeModal = null;
		this.firstCalcDone = !!Utils.storageGet(Config.Data.InstallSeenKey);
		this.init();
	}

	init() {
		this.cacheElements();
		this.syncTabAria();
		this.bindEvents();
		this.handleTabChange({ resetInputs: false });
		this.updateQuickAreaScroll();
	}

	// ---------------------------------------------------------------------
	// 초기 캐싱
	// ---------------------------------------------------------------------
	cacheElements() {
		const containerOf = (tabId) => Utils.select(`[data-tab='${tabId}']`);

		this.elements = {
			tabRadios: Utils.selectAll(Config.Selectors.Tabs.Radios),
			tabLine: Utils.select(Config.Selectors.Tabs.Line),
			tabs: Utils.selectAll(Config.Selectors.Tabs.Bodies),
			resetBtns: Utils.selectAll(Config.Selectors.Buttons.Reset),
			quickAreas: Utils.selectAll(`${Config.Selectors.QuickArea.Container} ${Config.Selectors.QuickArea.Inner}`),
			inputs: Utils.selectAll("input[type='tel']"),
			modals: Utils.selectAll(Config.Selectors.Modals.Container),
			alertBox: Utils.select(Config.Selectors.Alert.Box),
			searchInput: Utils.select(Config.Selectors.Modals.Search.Input)
		};

		const tab1Container = containerOf(Config.Constants.TabIds.Tab1);
		const tab2Container = containerOf(Config.Constants.TabIds.Tab2);

		this.perTab = {
			[Config.Constants.TabIds.Tab1]: {
				container: tab1Container,
				chemicalRatioText: tab1Container?.querySelector('.chemical-ratio'),
				totalRatioText: tab1Container?.querySelector('.total-ratio'),
				chemicalResult: tab1Container?.querySelector('.chemical-result'),
				otherResult: tab1Container?.querySelector('.water-result'),
				chemicalBar: tab1Container?.querySelector('.chemical-bar'),
				otherBar: tab1Container?.querySelector('.water-bar')
			},
			[Config.Constants.TabIds.Tab2]: {
				container: tab2Container,
				chemicalRatioText: tab2Container?.querySelector('.chemical-ratio'),
				totalRatioText: tab2Container?.querySelector('.total-ratio'),
				chemicalResult: tab2Container?.querySelector('.chemical-result'),
				otherResult: tab2Container?.querySelector('.total-result'),
				chemicalBar: tab2Container?.querySelector('.chemical-bar2'),
				otherBar: tab2Container?.querySelector('.total-bar')
			}
		};
	}

	// ---------------------------------------------------------------------
	// 이벤트 바인딩
	// ---------------------------------------------------------------------
	bindEvents() {
		document.addEventListener('click', (e) => this.handleGlobalClick(e));
		document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));

		this.elements.inputs.forEach(input => {
			input.addEventListener('input', (e) => this.handleInput(e));
		});

		this.elements.tabRadios.forEach(radio => {
			radio.addEventListener('change', () => this.handleTabChange({ resetInputs: false }));
		});

		this.elements.quickAreas.forEach(area => {
			area.addEventListener('scroll', () => this.updateQuickAreaScrollState(area));
		});

		if (this.elements.searchInput) {
			// 실시간 필터 (디바운스) + Enter 시 즉시 실행
			this.elements.searchInput.addEventListener('input', (e) => {
				window.clearTimeout(this.searchDebounceId);
				this.searchDebounceId = window.setTimeout(() => this.handleSearch(e.target.value), 120);
			});
			this.elements.searchInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					window.clearTimeout(this.searchDebounceId);
					this.handleSearch(e.target.value);
				}
			});
		}

		// 배경 클릭으로 모달 닫기
		this.elements.modals.forEach(modal => {
			modal.addEventListener('click', (e) => {
				if (e.target === modal) this.closeModal(modal);
			});
		});

		window.addEventListener('resize', () => this.updateQuickAreaScroll());
	}

	handleGlobalClick(e) {
		const target = e.target;

		const modalTrigger = target.closest(Config.Selectors.Modals.Trigger);
		if (modalTrigger) {
			this.openModal(modalTrigger.dataset.openModal, modalTrigger);
			return;
		}

		const closeBtn = target.closest(Config.Selectors.Buttons.ModalClose);
		if (closeBtn) {
			this.closeModal(closeBtn.closest(Config.Selectors.Modals.Container));
			return;
		}

		const alertClose = target.closest(Config.Selectors.Buttons.AlertClose);
		if (alertClose) {
			this.hideBrandAlert();
			return;
		}

		const resetBtn = target.closest(Config.Selectors.Buttons.Reset);
		if (resetBtn) {
			this.resetAll({ scroll: false });
			return;
		}

		const quickBtn = target.closest(Config.Selectors.Buttons.QuickRatio);
		if (quickBtn) {
			this.handleQuickRatioClick(quickBtn);
			return;
		}

		const dilutionBtn = target.closest(Config.Selectors.Buttons.ModalDilution);
		if (dilutionBtn) {
			this.handleDilutionSelect(dilutionBtn);
			return;
		}
	}

	handleGlobalKeydown(e) {
		if (e.key === 'Escape') {
			const openModal = Utils.select(Config.Selectors.Modals.Backdrop);
			if (openModal) {
				this.closeModal(openModal);
				return;
			}
			if (this.elements.alertBox?.classList.contains('active')) {
				this.hideBrandAlert();
			}
		}
	}

	// ---------------------------------------------------------------------
	// 탭
	// ---------------------------------------------------------------------
	handleTabChange({ resetInputs = false } = {}) {
		const activeTabId = this.getCurrentTabId();

		this.elements.tabs.forEach(tab => {
			const active = tab.dataset.tab === activeTabId;
			tab.classList.toggle('active', active);
		});

		this.syncTabAria();

		if (this.elements.tabLine) {
			const offset = activeTabId === Config.Constants.TabIds.Tab1 ? 0 : 100;
			this.elements.tabLine.style.transform = `translateX(${offset}%)`;
		}

		this.resetQuickAreaScroll();
		if (resetInputs) {
			this.resetAll({ scroll: false });
		} else {
			// 입력 유지: 결과만 활성 탭 기준으로 다시 계산
			this.updateCalculation();
			this.updateResetButtonState();
		}
	}

	syncTabAria() {
		const activeTabId = this.getCurrentTabId();
		this.elements.tabRadios.forEach(radio => {
			const controlledId = radio.getAttribute('aria-controls') || radio.id.replace('contents-', '');
			radio.setAttribute('aria-selected', String(controlledId === activeTabId));
		});
		this.elements.tabs.forEach(tab => {
			tab.setAttribute('aria-hidden', String(tab.dataset.tab !== activeTabId));
		});
	}

	getCurrentTabId() {
		const checked = Utils.select(Config.Selectors.Tabs.Checked);
		if (!checked) return Config.Constants.TabIds.Tab1;
		return checked.id === 'contents-tab2' ? Config.Constants.TabIds.Tab2 : Config.Constants.TabIds.Tab1;
	}

	// ---------------------------------------------------------------------
	// 입력 / 계산
	// ---------------------------------------------------------------------
	handleInput(e) {
		const input = e.target;
		const raw = Utils.removeCommas(input.value);

		if (raw === '') {
			input.value = '';
		} else {
			const num = Number(raw);
			if (Number.isNaN(num)) {
				input.value = '';
			} else if (num < 1) {
				input.value = '';
			} else if (Utils.isValidNumber(num)) {
				input.value = Utils.addCommas(num);
			}
		}

		this.updateCalculation();
		this.updateResetButtonState();
	}

	updateCalculation() {
		const tabId = this.getCurrentTabId();
		const isTab1 = tabId === Config.Constants.TabIds.Tab1;
		const selectors = isTab1 ? Config.Selectors.Inputs.Tab1 : Config.Selectors.Inputs.Tab2;
		const ratio = Utils.getNumericValue(selectors.Dilution);
		const volume = Utils.getNumericValue(selectors.Volume);

		if (ratio === null || volume === null) return;

		const mode = isTab1 ? Config.Constants.Modes.Water : Config.Constants.Modes.Total;
		const result = Calculator.calculate(mode, ratio, volume);
		this.renderResults(tabId, result, ratio);
		this.markFirstCalcIfNeeded(ratio, volume);
	}

	renderResults(tabId, result, ratio) {
		const refs = this.perTab[tabId];
		if (!refs?.container) return;
		const isTab1 = tabId === Config.Constants.TabIds.Tab1;

		if (refs.chemicalRatioText) {
			refs.chemicalRatioText.textContent = `(희석비 - 1:${Utils.formatNumber(ratio)})`;
		}
		if (refs.totalRatioText) {
			refs.totalRatioText.textContent = isTab1
				? `(전체 용량 - ${Utils.formatNumber(result.total)}ml)`
				: `(물 용량 - ${Utils.formatNumber(result.water)}ml)`;
		}

		this.animateNumber(refs.chemicalResult, result.chemical);
		this.animateNumber(refs.otherResult, isTab1 ? result.water : result.total);
		this.updateGraph(refs, result, tabId);
	}

	/**
	 * 시각적 식별성을 위해 케미컬 바는 최소 가시 높이를 적용하되,
	 * 실제 비율 대비 과장된 수치가 아니라는 의미로 `data-scaled` 속성에 기록합니다.
	 */
	updateGraph(refs, result, tabId) {
		const totalBase = tabId === Config.Constants.TabIds.Tab1 ? result.water : result.total;

		let chemicalPct = 0;
		let otherPct = 0;

		if (totalBase > 0) {
			const actualPct = (result.chemical / totalBase) * 100;
			// 과도한 스케일링(200배) 대신, 최소 가시 높이(2%)를 보장하는 선형 보정
			chemicalPct = Math.min(Math.max(actualPct, actualPct > 0 ? 2 : 0), 100);
			otherPct = 100;
			if (refs.chemicalBar) refs.chemicalBar.dataset.actualRatio = actualPct.toFixed(2);
		}

		this.animateBar(refs.otherBar, otherPct);
		this.animateBar(refs.chemicalBar, chemicalPct);
	}

	animateBar(element, percentage) {
		if (!element) return;

		if (Utils.prefersReducedMotion()) {
			element.style.transition = 'none';
			element.style.height = `${percentage}%`;
			element.classList.toggle('has-liquid', percentage > 0);
			return;
		}

		element.style.transition = 'none';
		element.style.height = '0%';
		element.classList.remove('has-liquid');
		void element.offsetHeight; // 리플로우 트리거 (의도됨)

		element.style.transition = `height ${Config.Animation.Duration}ms ${Config.Animation.Ease}`;
		element.style.willChange = 'height';

		requestAnimationFrame(() => {
			element.style.height = `${percentage}%`;
			if (percentage > 0) element.classList.add('has-liquid');
		});
	}

	/**
	 * 숫자 카운팅 애니메이션. 기존 RAF를 취소하여 연속 입력 시 깜빡임을 방지합니다.
	 */
	animateNumber(element, target) {
		if (!element) return;

		const prevRaf = this.numberRaf.get(element);
		if (prevRaf) cancelAnimationFrame(prevRaf);

		if (target <= 0) {
			element.textContent = '0ml';
			this.numberRaf.delete(element);
			return;
		}

		if (Utils.prefersReducedMotion()) {
			element.textContent = `${Utils.formatNumber(target)}ml`;
			return;
		}

		const start = performance.now();
		const duration = Config.Animation.Duration;

		const step = (time) => {
			const fraction = (time - start) / duration;
			if (fraction >= 1) {
				element.textContent = `${Utils.formatNumber(target)}ml`;
				this.numberRaf.delete(element);
				return;
			}
			const progress = 1 - Math.pow(1 - fraction, 2);
			element.textContent = `${Utils.formatNumber(target * progress)}ml`;
			this.numberRaf.set(element, requestAnimationFrame(step));
		};

		this.numberRaf.set(element, requestAnimationFrame(step));
	}

	// ---------------------------------------------------------------------
	// 퀵 버튼
	// ---------------------------------------------------------------------
	handleQuickRatioClick(button) {
		const value = button.dataset.value;
		if (!value) return;

		const tabBody = button.closest('.tab-body');
		const tabId = tabBody.dataset.tab;
		const isDilution = button.classList.contains('btn-dilution-ratio');
		const selectors = tabId === Config.Constants.TabIds.Tab1
			? Config.Selectors.Inputs.Tab1
			: Config.Selectors.Inputs.Tab2;
		const targetSelector = isDilution ? selectors.Dilution : selectors.Volume;
		const input = Utils.select(targetSelector);
		if (!input) return;

		const currentVal = parseFloat(Utils.removeCommas(input.value)) || 0;
		const newVal = currentVal + parseFloat(value);
		input.value = Utils.addCommas(newVal);

		this.updateCalculation();
		this.updateResetButtonState();
	}

	// ---------------------------------------------------------------------
	// 퀵 영역 스크롤 상태
	// ---------------------------------------------------------------------
	updateQuickAreaScroll() {
		this.elements.quickAreas.forEach(area => this.updateQuickAreaScrollState(area));
	}

	updateQuickAreaScrollState(area) {
		const parent = area.parentElement;
		if (!parent) return;
		const { scrollWidth, clientWidth, scrollLeft } = area;
		const isScrollable = scrollWidth > clientWidth;
		const isAtEnd = scrollWidth - scrollLeft <= clientWidth + 1;
		parent.classList.toggle('hide-after', !isScrollable || isAtEnd);
	}

	resetQuickAreaScroll() {
		this.elements.quickAreas.forEach(area => {
			area.scrollLeft = 0;
			area.parentElement?.classList.remove('hide-after');
			this.updateQuickAreaScrollState(area);
		});
	}

	// ---------------------------------------------------------------------
	// 리셋
	// ---------------------------------------------------------------------
	updateResetButtonState() {
		this.elements.resetBtns.forEach(btn => {
			const tab = btn.closest('[data-tab]');
			const inputs = tab.querySelectorAll('input');
			const hasValue = Array.from(inputs).some(input => input.value.trim() !== '');
			btn.disabled = !hasValue;
		});
	}

	/**
	 * 입력/결과를 초기화합니다. 기본적으로 강제 스크롤은 하지 않습니다.
	 */
	resetAll({ scroll = false } = {}) {
		this.elements.inputs.forEach(input => { input.value = ''; });

		Utils.selectAll(Config.Selectors.Graph.Bar).forEach(bar => {
			bar.style.height = '0%';
			bar.classList.remove('has-liquid');
		});
		Utils.selectAll(Config.Selectors.Graph.Result).forEach(el => { el.textContent = '0ml'; });
		Utils.selectAll(Config.Selectors.Graph.Text).forEach(el => { el.textContent = ''; });

		this.updateResetButtonState();
		if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// ---------------------------------------------------------------------
	// 모달
	// ---------------------------------------------------------------------
	openModal(type, trigger = null) {
		const modal = Utils.select(`.modal[data-modal-type="${type}"]`);
		if (!modal) return;

		this.lastFocusedBeforeModal = trigger || document.activeElement;

		modal.classList.add('active');
		modal.setAttribute('aria-hidden', 'false');
		document.body.classList.add('hidden-scroll');

		// 트리거 버튼 aria-expanded 동기화
		if (trigger?.hasAttribute('aria-expanded')) {
			trigger.setAttribute('aria-expanded', 'true');
		}

		if (type === Config.Selectors.Modals.Search.Type) {
			this.initSearchModal();
		}

		this.focusFirstElement(modal, type);
	}

	focusFirstElement(modal, type) {
		// 검색 모달은 인풋으로, 그 외는 닫기 버튼으로 포커스 이동
		requestAnimationFrame(() => {
			if (type === Config.Selectors.Modals.Search.Type && this.elements.searchInput) {
				this.elements.searchInput.focus();
				return;
			}
			const closeBtn = modal.querySelector(Config.Selectors.Buttons.ModalClose);
			if (closeBtn) closeBtn.focus();
		});
	}

	closeModal(modal) {
		if (!modal) return;
		modal.classList.remove('active');
		modal.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('hidden-scroll');

		const type = modal.dataset.modalType;

		// 대응하는 트리거의 aria-expanded 초기화
		const trigger = Utils.select(`[data-open-modal="${type}"]`);
		if (trigger?.hasAttribute('aria-expanded')) {
			trigger.setAttribute('aria-expanded', 'false');
		}

		if (type === Config.Selectors.Modals.Search.Type) {
			if (this.elements.searchInput) this.elements.searchInput.value = '';
		} else if (type === Config.Selectors.Modals.Install.Type) {
			this.deferInstallPrompt();
		}

		// 포커스 복귀
		if (this.lastFocusedBeforeModal && typeof this.lastFocusedBeforeModal.focus === 'function') {
			this.lastFocusedBeforeModal.focus();
		}
		this.lastFocusedBeforeModal = null;
	}

	// ---------------------------------------------------------------------
	// PWA 설치 유도 — 첫 계산이 완료된 이후에만 노출
	// ---------------------------------------------------------------------
	markFirstCalcIfNeeded(ratio, volume) {
		if (this.firstCalcDone) return;
		if (!(ratio > 0 && volume > 0)) return;

		this.firstCalcDone = true;
		Utils.storageSet(Config.Data.InstallSeenKey, '1');
		this.maybeShowInstallModal();
	}

	maybeShowInstallModal() {
		if (Utils.isStandalone()) return;
		if (!Utils.isMobile()) return;

		const hideUntil = Utils.storageGet(Config.Data.InstallPromptKey);
		if (hideUntil && Date.now() <= parseInt(hideUntil, 10)) return;

		this.openModal(Config.Selectors.Modals.Install.Type);
	}

	deferInstallPrompt() {
		const oneWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
		Utils.storageSet(Config.Data.InstallPromptKey, oneWeek.toString());
	}

	// ---------------------------------------------------------------------
	// 검색 모달
	// ---------------------------------------------------------------------
	async initSearchModal() {
		const list = Utils.select(Config.Selectors.Modals.Search.List);
		const loading = Utils.select(Config.Selectors.Modals.Search.Loading);
		const noData = Utils.select(Config.Selectors.Modals.Search.NoData);

		noData?.classList.remove('active');
		if (list) list.style.display = 'none';
		loading?.classList.add('active');

		try {
			const data = await DataManager.loadData();
			this.renderProductList(data);
			if (list) list.style.display = 'block';
		} catch (e) {
			console.error(e);
			this.showToast('데이터를 불러오지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.');
		} finally {
			loading?.classList.remove('active');
		}
	}

	async handleSearch(term) {
		const noData = Utils.select(Config.Selectors.Modals.Search.NoData);
		const list = Utils.select(Config.Selectors.Modals.Search.List);

		let data;
		try {
			data = await DataManager.loadData();
		} catch (_) {
			this.showToast('데이터를 불러오지 못했습니다.');
			return;
		}

		const filtered = DataManager.filterData(data, term);
		this.renderProductList(filtered);

		const hasResults = filtered.length > 0;
		noData?.classList.toggle('active', !hasResults);
		if (list) list.style.display = hasResults ? 'block' : 'none';
	}

	renderProductList(data) {
		const list = Utils.select(Config.Selectors.Modals.Search.List);
		if (!list) return;

		list.innerHTML = data.map(product => {
			const brand = Utils.escapeHtml(product.brand);
			const prodName = Utils.escapeHtml(product.product);
			const label = Utils.escapeHtml(product.label);

			const buttons = Array.isArray(product.dilution)
				? product.dilution.map((d, i) => this.createDilutionBtn(d, product.etc?.[i])).join('')
				: this.createDilutionBtn(product.dilution, product.etc);

			return `
				<div class="product-item" role="listitem">
					<p class="brand ${label}">
						<span><strong>${brand}</strong> - ${prodName}</span>
					</p>
					<div class="dilution-buttons">${buttons}</div>
				</div>
			`;
		}).join('');
	}

	createDilutionBtn(dilution, etc) {
		const safeEtc = Utils.escapeHtml(etc);
		const labelAttr = Utils.escapeHtml(`희석비 1:${dilution}${etc ? ` (${etc})` : ''}`);
		return `<button type="button" class="btn-modal-dilution" data-value="${dilution}" aria-label="${labelAttr}">
			<strong>1:${dilution}</strong> <span>(${safeEtc})</span>
		</button>`;
	}

	handleDilutionSelect(button) {
		const value = button.dataset.value;
		const tabId = this.getCurrentTabId();
		const selector = tabId === Config.Constants.TabIds.Tab1
			? Config.Selectors.Inputs.Tab1.Dilution
			: Config.Selectors.Inputs.Tab2.Dilution;

		const input = Utils.select(selector);
		if (input) {
			input.value = Utils.addCommas(Number(value));
			this.updateCalculation();
			this.updateResetButtonState();
		}

		this.closeModal(button.closest('.modal'));
		this.showSelectedBrandAlert(button, value);
	}

	// ---------------------------------------------------------------------
	// 알림(Alert/Toast)
	// ---------------------------------------------------------------------
	showSelectedBrandAlert(button, value) {
		const alertBox = this.elements.alertBox;
		if (!alertBox) return;

		this.clearAlertTimers();

		const brandHtml = button.closest('.product-item')?.querySelector('.brand')?.innerHTML ?? '';

		alertBox.innerHTML = `
			<div class="inner" role="status">
				<i class="ti ti-circle-check" aria-hidden="true"></i>
				<div>
					<span class="text">선택하신 제품은 </span>
					${brandHtml}
					<span class="text">이며,</span>
					<em>희석비는 <strong>1:${Utils.escapeHtml(value)}</strong>입니다.</em>
				</div>
				<button type="button" class="btn-alert-close ti ti-x" aria-label="알림 닫기"></button>
			</div>
		`;
		alertBox.classList.add('active');
		alertBox.style.opacity = '1';

		this.alertTimer = window.setTimeout(() => this.hideBrandAlert(), Config.Animation.AlertDuration);
	}

	hideBrandAlert() {
		const alertBox = this.elements.alertBox;
		if (!alertBox) return;

		this.clearAlertTimers();

		const finalize = () => {
			alertBox.classList.remove('active');
			alertBox.style.transition = '';
			alertBox.style.opacity = '';
			if (this.alertTransitionHandler) {
				alertBox.removeEventListener('transitionend', this.alertTransitionHandler);
				this.alertTransitionHandler = null;
			}
		};

		alertBox.style.transition = `opacity ${Config.Animation.AlertFade}ms`;
		alertBox.style.opacity = '0';

		this.alertTransitionHandler = () => finalize();
		alertBox.addEventListener('transitionend', this.alertTransitionHandler);

		// 트랜지션이 발화되지 않는 경우에 대비한 fallback
		this.alertTimer = window.setTimeout(finalize, Config.Animation.AlertFade + 100);
	}

	clearAlertTimers() {
		if (this.alertTimer) {
			window.clearTimeout(this.alertTimer);
			this.alertTimer = null;
		}
	}

	showToast(message) {
		const alertBox = this.elements.alertBox;
		if (!alertBox) return;

		this.clearAlertTimers();

		alertBox.innerHTML = `
			<div class="inner" role="alert">
				<i class="ti ti-alert-triangle-filled" aria-hidden="true"></i>
				<div><em>${Utils.escapeHtml(message)}</em></div>
				<button type="button" class="btn-alert-close ti ti-x" aria-label="알림 닫기"></button>
			</div>
		`;
		alertBox.classList.add('active');
		alertBox.style.opacity = '1';

		this.alertTimer = window.setTimeout(() => this.hideBrandAlert(), Config.Animation.AlertDuration);
	}
}
