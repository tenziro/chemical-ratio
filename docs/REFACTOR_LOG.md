# Chemical-Ratio 모듈화 리팩토링 진행 로그

## 작업 개요
기존 순수 Vanilla JS 환경에서 작성된 거대 단일 파일(`common.js`)을 유지보수가 용이하도록 ES6 모듈 시스템을 통한 분할 작업을 진행했습니다.
이는 프레임워크 없는 모듈화 집중 리팩토링(옵션 2) 선택에 따른 작업입니다.

## 상세 리팩토링 내용

1. **`common.js` 파일 분리 (ES6 Modules 도입)**
   - **`Config.js`**: 애플리케이션 내의 DOM Selector 설정 및 시간 상수, 설정 데이터(`json` 경로 등), 애니메이션 딜레이 값을 중앙 집중식으로 관리.
   - **`Utils.js`**: DOM을 다루는 함수, 숫자 콤마 및 소수점 처리 함수, XSS 보안을 위한 이스케이프 지원, 디바이스 타입 감별(모바일 확인, PWA 여부 확인) 등 순수 헬퍼 기능을 하는 정적 메소드를 모아 분리.
   - **`Calculator.js`**: 앱의 핵심인 희석비를 계산하는 비즈니스 로직. "물 용량 기준"과 "전체 용량 기준"에 따른 화학 제품 / 물 용량 계산 로직 분리.
   - **`DataManager.js`**: 정적 데이터 `data.json`의 호출(fetch)과 필터 검색, 혹은 브라우저 로컬 스토리지에 저장된 캐시 데이터 관리 담당.
   - **`UIManager.js`**: 화면의 탭, 입력폼의 이벤트, 모달 관리, 애니메이션 그리기 등 실제 Document Object와 소통하는 부분. `Utils.js`의 도움을 받아 DOM 요소와 상호작용.
   - **`app.js`**: 분리된 모듈들을 import 하여 최종적으로 DOM 로딩 후 UIManager 인스턴스를 실행하는 엔트리 포인트.

2. **`index.html` 의존성 변경**
   - 기존 `<script src="src/assets/js/common.js?v=2025032801"></script>` 형태에서 ES6 모듈 스크립트 특성인 `type="module"`을 명시한 `<script type="module" src="src/assets/js/app.js?v=2025032801"></script>` 방식으로 대체.

3. **향후 개발 및 변경 가이드**
   - 새로운 유틸리티 함수가 필요할 경우: `Utils.js`에 `static` 메소드 추가.
   - 비즈니스 계산에 영향을 미치는 공식이 변경/추가될 경우: `Calculator.js` 수정.
   - 모달이나 입력 창, 새로운 탭 관련 이벤트 처리는: `UIManager.js`의 `bindEvents()` 등에서 핸들러 정의.

## 비고
- 로컬에서 테스트할 경우 `type="module"` 스크립트는 로컬 파일 접근에 대한 CORS 이슈가 발생할 수 있으므로, 웹 서버(Live Server 등)를 통해 실행해야 합니다.
- 배포된 `ratio.tenziro.net` 호스팅 환경에서는 이 구문이 전혀 문제없이 동작합니다.
