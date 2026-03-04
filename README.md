# (R)atio - 세차용품 희석비 계산기 🧪

![Main UI](https://ratio.tenziro.net/src/assets/images/img-meta-2025.png)

## 📋 프로젝트 개요
세차를 취미로 즐기는 '세차 환자'들을 위해 제작된 **세차용품 희석비 계산기**입니다. 프리워시, 카샴푸 등 용도별로 다른 케미컬의 희석비를 물 용량 또는 전체 용량 기준으로 쉽고 정확하게 계산할 수 있도록 도와줍니다.

---

## 🛠 Tech Stack (기술 스택)

### Core
- **HTML5**: 시맨틱 웹 구조 설계 및 SEO 최적화
- **JavaScript (ES6+)**: Vanilla JS 기반의 모듈형 아키텍처 (React 마이그레이션 준비 구조)
- **CSS3 / SCSS**: 변수 기반 테마 시스템 및 반응형 디자인 구현

### Backend & Storage
- **Local Storage**: 제품 데이터 및 설치 안내 팝업 상태 캐싱 (24시간 유효)
- **Supabase (계획)**: 향후 사용자 맞춤형 케미컬 데이터베이스 및 API 연동용 (기본 규칙 준수)

### UI/UX & Design
- **Shadcn UI (패턴)**: UI 폼 및 모달 설계 시 Shadcn의 디자인 철학 반영
- **Tabler Icons**: 고품질 웹 폰트 아이콘 라이브러리 활용
- **Pretendard**: 가독성 높은 오픈소스 가변 글꼴 사용

---

## 🏗 프로젝트 구조 (Project Structure)
```text
chemical-ratio/
├── docs/                      # 개발 로직 및 리팩토링 문서
│   ├── PROCESS_ARCHITECTURE.md # 상세 아키텍처 및 데이터 흐름도
│   └── REFACTOR_LOG.md         # 리팩토링 진행 이력
├── src/
│   ├── assets/
│   │   ├── css/               # 컴파일된 스타일시트 (common.css, wave.css)
│   │   ├── scss/              # 스타일 소스 파일 (common.scss)
│   │   ├── js/
│   │   │   ├── modules/       # ES6 모듈화된 핵심 로직
│   │   │   │   ├── Config.js     # 전역 설정 및 상수
│   │   │   │   ├── Utils.js      # 공통 유틸리티 함수
│   │   │   │   ├── Calculator.js # 희석비 계산 비즈니스 로직
│   │   │   │   ├── DataManager.js # 데이터 로딩 및 캐싱
│   │   │   │   └── UIManager.js   # DOM 조작 및 이벤트 핸들링
│   │   │   └── app.js         # 메인 엔트리 포인트
│   │   └── images/            # 아이콘, 배경화면, 메타 이미지
│   └── data/
│       └── data.json          # 케미컬 제품 정보 데이터베이스
├── index.html                 # 메인 애플리케이션 페이지
├── Sitemap.xml                # 검색 엔진 최적화용 사이트맵
└── robots.txt                 # 검색 로봇 접근 제어 설정
```

---

## 💻 상세 아키텍처 설명

### 프론트엔드 구조 (Frontend Architecture)
- **관심사 분리 (SoC)**: UI 조작(UIManager), 비즈니스 로직(Calculator), 데이터 관리(DataManager)를 엄격히 분리하여 코드의 독립성을 확보했습니다.
- **모듈형 설계**: ES6 Module 스크립트를 사용하여 필요한 기능만 임포트해 사용하며, 추후 React 환경으로의 포팅이 용이하도록 설계되었습니다.
- **이벤트 위임**: 개별 요소가 아닌 최상위 노드에서 이벤트를 감지하여 메모리 효율성을 높였습니다.
- **애니메이션 레이어**: CSS Mask잉과 JS를 결합한 '물결 애니메이션(Wave Effect)'을 통해 시각적 만족도를 높였습니다.

### 백엔드 & 데이터 구조 (Backend & Data)
- **JSON 기반 DB**: `src/data/data.json`에 브랜드별, 제품별 희석비 정보를 정적 DB 형태로 관리합니다.
- **스마트 캐싱**: `DataManager` 모듈이 JSON 데이터를 로드할 때 `localStorage`에 저장하며, 24시간 동안 중복 네트워크 요청을 방지합니다.

---

## 🔌 사용된 플러그인 및 도구
- **Google Analytics (Gtag)**: 사용자 방문 통계 및 행동 분석
- **Naver Search Advisor**: 네이버 검색 노출 최적화
- **Web App Manifest**: PWA(Progressive Web App) 지원으로 '홈 화면에 추가' 기능 제공

---

## 🚀 주요 기능
1. **물 용량 대비 계산**: 투입할 물의 양을 기준으로 케미컬 용량 산출
2. **전체 용량 대비 계산**: 완성될 용액의 총량을 기준으로 배합 비율 산출
3. **제품 검색**: 가우디, 글로스브로, 마프라 등 주요 브랜드 제품의 추천 희석비 자동 입력
4. **반응형 UI**: PC, 태블릿, 모바일에 최적화된 레이아웃 제공
5. **다크 모드 지원**: 사용자 시스템 설정에 따른 자동 테마 전환

---
Copyright © tenziro.net, All rights reserved.
