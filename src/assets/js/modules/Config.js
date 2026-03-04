/**
 * 설정 및 상수
 */
export const Config = {
	Selectors: {
		Tabs: {
			HeaderItems: ".tab-header .radio-label",
			Radio: "#contents-tab1",
			Bodies: ".tab-body",
			Line: ".tab-line",
			Radios: 'input[name="calculation"]'
		},
		Inputs: {
			Tab1: {
				Dilution: "#dilutionRatio",
				Volume: "#waterVolume",
				Container: "[data-tab='tab1']"
			},
			Tab2: {
				Dilution: "#dilutionRatio2",
				Volume: "#totalCapacity",
				Container: "[data-tab='tab2']"
			}
		},
		Buttons: {
			Reset: ".btn-reset",
			QuickRatio: ".btn-dilution-ratio, .btn-capacity-ratio",
			ModalClose: ".btn-modal-close",
			Search: ".btn-search",
			Info: ".btn-information",
			ModalDilution: ".btn-modal-dilution"
		},
		Modals: {
			Trigger: "[data-open-modal]",
			Container: ".modal",
			Search: {
				Id: "searchModal",
				Input: "#searchInput",
				List: ".product-list",
				NoData: "#nodata",
				Loading: "#result-data"
			},
			Install: {
				Type: "install"
			}
		},
		QuickArea: {
			Container: ".quick-area",
			Inner: ".inner"
		},
		Graph: {
			Bar: ".graph-bg > div",
			Text: ".graph-item dl dt span:last-child",
			Result: ".graph-item dl dd"
		},
		Alert: {
			Box: ".selected-brand-alert"
		}
	},
	Data: {
		Url: "src/data/data.json",
		StorageKey: "productData",
		InstallPromptKey: "hideInstallModalUntil",
		ExpirationTime: 24 * 60 * 60 * 1000 // 24시간
	},
	Animation: {
		Duration: 1000,
		Ease: "cubic-bezier(0.06, 0.38, 0.13, 1)",
		AlertDuration: 3000,
		AlertFade: 500
	},
	Constants: {
		TabIds: { Tab1: 'tab1', Tab2: 'tab2' },
		Modes: { Water: 'water', Total: 'total' }
	}
};
