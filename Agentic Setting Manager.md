# Agentic Setting Manager - Airbridge 온보딩 완벽 가이드

## 목차
1. [설계 원칙](#1-설계-원칙)
2. [앱 등록 단계별 가이드](#2-앱-등록-단계별-가이드)
3. [플랜별 온보딩 차이점](#3-플랜별-온보딩-차이점)
4. [Development vs Production Mode](#4-development-vs-production-mode)
5. [전체 시나리오 스크립트](#5-전체-시나리오-스크립트)
6. [에러/예외 상황 대응](#6-에러예외-상황-대응)
7. [인터페이스 컴포넌트 정의](#7-인터페이스-컴포넌트-정의)
8. [Agentic Decision Tree](#8-agentic-decision-tree)
9. [참고 문서 및 주의사항](#9-참고-문서-및-주의사항)

---

## 1. 설계 원칙

1. **최소 Input, 최대 정보** - 선택지 기반으로 클릭만으로 진행
2. **컨텍스트 기반 스마트 분기** - 이전 답변에 따라 불필요한 질문 스킵
3. **진행률 시각화** - 현재 위치와 남은 단계 명확히 표시
4. **즉각적 피드백** - 각 단계 완료 시 확인 메시지

### 핵심 가이드 원칙

| 원칙 | 설명 |
|---|---|
| **단계별 진행** | 이전 단계 완료 확인 후 다음 단계로 |
| **검증 우선** | 각 단계마다 Real-time Logs로 데이터 수신 확인 |
| **맞춤 가이드** | 플랫폼/프레임워크에 따라 적절한 SDK 문서 제공 |
| **필수 vs 선택 구분** | Channel Integration(필수) → Cost(권장) → SKAN(iOS 필수) |
| **트러블슈팅 대비** | 각 SDK별 Troubleshooting 문서 준비 |
| **자동 채움** | 이전 단계 정보를 다음 단계에 자동 적용 |

---

## 2. 앱 등록 단계별 가이드

### 전체 온보딩 플로우 개요

Airbridge에서 앱을 등록하고 초기 설정을 완료하는 전체 과정입니다.

### Step 1: Airbridge 대시보드 접속

**고객 안내 사항:**
- Airbridge 공식 사이트 (https://airbridge.io) 우측 상단의 **Dashboard** 버튼 클릭
- 계정이 없는 경우 회원가입 필요
- 기존 사용자는 로그인 후 대시보드 진입

### Step 2: 새 앱 추가 시작

**경로:** `My Apps → Add a new app`

**고객 안내 사항:**
- 앱을 추가하는 사용자가 자동으로 해당 앱의 **Owner(소유자)** 역할이 됩니다
- Owner는 앱의 모든 설정 권한을 가지며, 이후 다른 사용자에게 권한 부여 가능

### Step 3: 조직(Organization) 설정

**선택지:**
| 옵션 | 설명 |
|------|------|
| 기존 조직 선택 | 이미 생성된 조직에 앱 추가 |
| 새 조직 생성 | 새로운 조직을 만들고 앱 추가 |

**고객 안내 사항:**
- 조직은 여러 앱을 묶어서 관리하는 상위 개념입니다
- 같은 조직 내 앱들은 사용자 권한을 통합 관리할 수 있습니다
- 기존 조직에 앱을 추가하려면 해당 조직의 **Admin** 또는 **Manager** 권한이 필요합니다

### Step 4: 앱 모드 선택

**선택지:**
| 모드 | 용도 | 특징 |
|------|------|------|
| Production Mode | 실제 서비스용 | 라이브 데이터 수집, 광고 채널 연동 가능 |
| Development Mode | 테스트/개발용 | SDK 연동 테스트, 딥링크 검증용 |

> ⚠️ **주의사항 (필수 안내)**
> **앱 모드는 등록 후 절대 변경할 수 없습니다.**
> 실제 서비스용 앱은 반드시 **Production Mode**를 선택하세요.

**고객 안내 사항:**
- 테스트용 앱과 프로덕션 앱을 별도로 등록하는 것을 권장합니다
- Development Mode 앱은 테스트 완료 후 삭제하고, Production Mode로 새로 등록해야 합니다

### Step 5: 앱 이름(App Name) 설정

**규칙:**
- **영소문자와 숫자만** 사용 가능 (대문자, 특수문자, 한글 불가)
- Airbridge 내에서 **고유한 식별자**로 사용됨
- SDK 통합 및 트래킹 링크 생성 시 사용됨

> ⚠️ **주의사항 (필수 안내)**
> **앱 이름은 등록 후 절대 변경할 수 없습니다.**

**고객 안내 사항:**
- 예시: `myapp`, `mycompanyapp2024`, `brandname`
- 회사명 또는 서비스명을 조합한 명확한 이름 권장
- 나중에 트래킹 링크 URL에 포함되므로 간결하고 기억하기 쉬운 이름 권장
- **Display Name**(표시 이름)은 나중에 변경 가능하므로, App Name은 시스템용 ID로 생각하세요

### Step 6: 타임존(Time Zone) 설정

**역할:**
- Airbridge의 모든 리포트 데이터가 설정된 타임존 기준으로 표시됩니다

> ⚠️ **주의사항 (필수 안내)**
> **타임존은 등록 후 변경할 수 없습니다.**

**영향받는 기능:**
| 기능 | 영향 |
|------|------|
| Actuals Report | 타임존 기준 데이터 집계 |
| Trend Report | 타임존 기준 시계열 데이터 |
| Raw Data Export | 타임존 기준 시간 표시 |
| Real-time Log | 타임존 기준 로그 시간 |
| Cohort Analysis | 타임존 기준 코호트 구분 |
| SKAN Report | 타임존 기준 데이터 표시 |
| 외부 플랫폼 연동 | 타임존 기준 데이터 전송 |

**고객 안내 사항:**
- **한국 서비스**: `Asia/Seoul (UTC+09:00)` 선택
- 글로벌 서비스의 경우 주요 타겟 시장 또는 본사 기준 타임존 선택 권장
- 광고 채널과 리포트 비교 시 타임존 차이로 인한 데이터 불일치가 발생할 수 있으니 참고

### Step 7: 표준 통화(Standard Currency) 설정

**역할:**
- Airbridge 대시보드의 모든 비용(Cost) 및 수익(Revenue) 데이터가 설정된 통화로 환산되어 표시됩니다

> ⚠️ **주의사항 (필수 안내)**
> **표준 통화는 등록 후 변경할 수 없습니다.**
> **Owner만 설정할 수 있습니다.**

**영향받는 영역:**
- 모든 Airbridge 리포트의 비용/수익 금액
- SKAN 데이터
- 원본 데이터 내보내기
- 제3자 플랫폼 연동 데이터

**고객 안내 사항:**
- **한국 서비스**: `KRW (원화)` 선택
- **글로벌 서비스 또는 해외 광고 집행 시**: `USD` 선택 권장
- 환율은 OpenExchangeRates API를 통해 **시간 단위**로 업데이트됩니다
- 원본 데이터에서는 원래 통화와 환산 금액 모두 확인 가능합니다

### Step 8: 앱 등록 완료

**작업:** `Submit` 버튼 클릭하여 앱 등록 완료

**등록 완료 후 화면:**
앱 대시보드로 이동되며, 다음 단계 설정이 가능해집니다.

### Step 9: 토큰 확인 (등록 후 필수)

**경로:** `Settings → Tokens`

**확인해야 할 토큰:**
| 토큰 | 용도 | 설명 |
|------|------|------|
| App SDK Token | 모바일 SDK 연동 | Android/iOS 앱에 SDK 설치 시 필요 |
| Web SDK Token | 웹 SDK 연동 | 웹사이트에 SDK 설치 시 필요 |
| API Token | 서버 API 연동 | 서버에서 Airbridge API 호출 시 필요 |
| S2S Token | Server-to-Server 연동 | 서버간 이벤트 전송 시 필요 |
| Postback Token | 포스트백 설정 | 외부 채널로 데이터 전송 시 필요 |

**고객 안내 사항:**
- SDK 연동 시 개발팀에 **App SDK Token** 또는 **Web SDK Token**을 전달해야 합니다
- 토큰은 보안상 안전하게 관리해야 하며, 외부에 노출되지 않도록 주의하세요
- API Token은 필요 시 재생성 가능하지만, 기존 연동에 영향을 줄 수 있습니다

### Step 10: 기본 앱 설정 확인 및 추가 설정

**경로:** `Settings → App Settings`

**확인/설정 항목:**
| 항목 | 설명 | 변경 가능 여부 |
|------|------|---------------|
| Display Name | 대시보드에 표시되는 앱 이름 | ✅ 변경 가능 |
| App Description | 앱 설명 | ✅ 변경 가능 |
| App Icon | 앱 아이콘 이미지 | ✅ 변경 가능 |
| App Store URL | iOS 앱스토어 URL | ✅ 변경 가능 |
| Play Store URL | Google Play 스토어 URL | ✅ 변경 가능 |
| Extended Privacy Control | iOS 옵트아웃 사용자 데이터 외부 공유 설정 | ✅ 변경 가능 |

**고객 안내 사항:**
- **Display Name**: 앱스토어에 등록된 앱 이름과 동일하게 설정 권장
- **Extended Privacy Control(EPC)**: iOS 14.5+ ATT 옵트아웃 사용자 데이터의 외부 공유 여부를 제어합니다. 프라이버시 정책에 따라 설정하세요.

### 요약: 변경 불가 항목 체크리스트

앱 등록 전 반드시 확인해야 할 **변경 불가 항목**:

- [ ] **앱 모드** (Production / Development)
- [ ] **앱 이름** (영소문자 + 숫자만)
- [ ] **타임존**
- [ ] **표준 통화**

---

## 3. 플랜별 온보딩 차이점

### 플랜 개요

| 플랜 | 주요 기능 | 대상 고객 |
|------|----------|----------|
| Deep Link Plan | 딥링크 기능만 제공 | 딥링크만 필요한 고객 |
| Growth Plan | 어트리뷰션 + 딥링크 + 리포트 전체 기능 | MMP 기능이 필요한 고객 |
| Free Trial | Growth Plan 기능 체험 (기간 제한) | 신규 평가 고객 |

### SDK 설정 차이

| 항목 | Deep Link Plan | Growth Plan |
|------|---------------|-------------|
| SDK 초기화 | 딥링크 수신 콜백만 설정 | 전체 초기화 설정 |
| 이벤트 전송 | ❌ 불필요 | ✅ Standard/Custom Event 설정 |
| IDFA 수집 (iOS) | ❌ 불필요 | ✅ ATT 프롬프트 구현 필요 |
| GAID 수집 (Android) | 선택적 | ✅ 권장 |

> **참고**: Deep Link Plan에서 Growth Plan으로 업그레이드 시, iOS의 'IDFA 수집 요구사항'을 반드시 확인해야 합니다.

### 대시보드 기능 차이

| 기능 | Deep Link Plan | Growth Plan |
|------|---------------|-------------|
| Actuals Report | ❌ | ✅ |
| Trend Report | ❌ | ✅ |
| Cohort Report | ❌ | ✅ |
| Raw Data Export | ❌ | ✅ |
| Ad Channel Integration | ❌ | ✅ |
| Attribution Settings | ❌ | ✅ |

### 채널 설정 차이

| 항목 | Deep Link Plan | Growth Plan |
|------|---------------|-------------|
| 트래킹 링크 생성 | ✅ 딥링크 포함 링크만 | ✅ 전체 기능 |
| 광고 채널 추가 | ❌ | ✅ |
| 포스트백 설정 | ❌ | ✅ |

### Deep Link Plan 고객 SDK 온보딩 안내

1. **SDK 설치**
   - Android/iOS/Web SDK 설치
   - 딥링크 수신 콜백만 설정

2. **딥링크 설정**
   - URI Scheme 설정
   - Universal Link (iOS) / App Link (Android) 설정
   - 커스텀 도메인 설정 (선택)

3. **트래킹 링크 생성**
   - 대시보드에서 딥링크가 포함된 트래킹 링크 생성
   - 딥링크 URL에 최대 2000자, key-value 쌍 통합 1000자 제한

### Growth Plan 고객 SDK 온보딩 안내

1. **SDK 설치 및 초기화**
   - SDK 설치 후 전체 초기화 설정
   - **iOS의 경우 ATT 프롬프트 구현 필수** (`setAutoDetermineTrackingAuthorizationTimeout` 설정)

2. **이벤트 설정**
   - Standard Event 설정 (Install, Open, Sign Up, Purchase 등)
   - Custom Event 설정 (비즈니스별 맞춤 이벤트)
   - 이벤트 프로퍼티 및 시맨틱 어트리뷰트 설정

3. **딥링크 설정**
   - Deep Link Plan과 동일한 딥링크 기본 설정

4. **채널 통합**
   - 광고 채널 연동 (Meta, Google, Apple Search Ads 등)
   - 포스트백 설정
   - 비용 데이터 연동

5. **리포트 설정**
   - 대시보드에서 모든 리포트 활용 가능
   - Raw Data Export 설정

### 플랜 업그레이드 시 주의사항

1. **Deep Link Plan → Growth Plan 전환 시**
   - iOS IDFA 수집 요구사항 반드시 검토
   - SDK 코드 수정 필요 (이벤트 전송 코드 추가)

2. **Deep Link Plan 제한사항 명확히 안내**
   - 어트리뷰션 데이터 확인 불가
   - 광고 채널 성과 측정 불가
   - 이벤트 기반 분석 불가

---

## 4. Development vs Production Mode

### Development Mode에서 Ad Channel Integration이 무의미한 이유

1. **어트리뷰션 검증 불가**: 실제 광고 채널과 연동해도 Production 데이터가 없어 어트리뷰션 결과를 검증할 수 없음
2. **비용 데이터 무의미**: 실제 광고 집행이 없으므로 Cost Integration의 의미 없음
3. **포스트백 테스트 불필요**: 실제 전환 데이터가 없으므로 광고 채널로의 포스트백 테스트가 무의미

### Development Mode에서 얻는 효용

#### SDK 연동 검증

| 검증 항목 | 설명 |
|----------|------|
| SDK 초기화 | SDK가 정상적으로 초기화되는지 확인 |
| 이벤트 전송 | Standard/Custom Event가 정상 전송되는지 확인 |
| 디바이스 식별자 | GAID(Android), IDFA(iOS) 수집 여부 확인 |
| 사용자 식별자 | User ID, Email 등 커스텀 식별자 설정 확인 |

> 📖 참고: [Testing the Airbridge SDK Integration](https://help.airbridge.io/en/guides/sdk-testing)

#### 딥링크 기능 검증

| 테스트 시나리오 | 설명 |
|----------------|------|
| Scenario 1 | 앱 설치 상태 - URL Scheme 동작 확인 |
| Scenario 2 | 앱 설치 상태 - Universal Links / App Links 동작 확인 |
| Scenario 3 | 앱 미설치 상태 - Deferred Deep Link 동작 확인 |
| Scenario 4 | 앱 미설치 상태 - 앱스토어 리다이렉트 확인 |
| Scenario 5 | 웹-앱 전환 딥링크 동작 확인 |

> 📖 참고: [Airbridge Deep Linking Test](https://help.airbridge.io/en/guides/deep-linking-test)

#### 트래킹 링크 동작 검증

| 검증 항목 | 설명 |
|----------|------|
| 링크 클릭 리다이렉트 | 트래킹 링크 클릭 시 정상 리다이렉트 확인 |
| 파라미터 전달 | 딥링크 파라미터가 앱으로 정상 전달되는지 확인 |
| Fallback URL | 앱 미설치 시 대체 URL 동작 확인 |

#### Real-time Logs 활용

**Development Mode의 핵심 도구**: `[Raw Data] > [App Real-time Log]`

**확인 가능한 정보:**
- 플랫폼(OS), 이벤트 카테고리, 채널 정보
- ADID, Cookie ID, User ID
- 클라이언트 IP, SDK 버전
- Airbridge Device ID, Action, Label

> ⚠️ **주의**: 최근 이벤트는 약 **10분 후** 검색 가능, 최근 **24시간** 데이터만 조회 가능

> 📖 참고: [Real-time Logs](https://help.airbridge.io/en/guides/tracking-events-with-real-time-logs)

### Development vs Production 사용 목적 요약

| 항목 | Development Mode | Production Mode |
|------|-----------------|-----------------|
| 용도 | SDK/딥링크 테스트 | 실제 서비스 운영 |
| 데이터 성격 | 테스트 데이터 | 실제 사용자 데이터 |
| 광고 채널 연동 | ❌ 무의미 | ✅ 필수 |
| 어트리뷰션 | ❌ 검증 불가 | ✅ 실제 어트리뷰션 |
| 리포트 | 제한적 | 전체 기능 |
| 권장 사용 기간 | 개발/테스트 기간 | 상시 |

---

## 5. 전체 시나리오 스크립트

### Phase 0: 웰컴 & 시작

#### Agent 발화
```
안녕하세요! Airbridge 설정을 도와드릴 Agentic Setting Manager입니다. 🚀

앱 등록부터 SDK 설치, 광고 채널 연동까지
전체 과정을 함께 진행해 드릴게요.

시작하기 전에, 현재 상황을 먼저 확인할게요.
```

#### 인터페이스: Single Select
| 현재 Airbridge 설정 상태가 어떻게 되시나요? |
|---|
| ○ 처음 시작해요 (앱 등록부터) |
| ○ 앱은 등록했어요 (SDK 설치부터) |
| ○ SDK도 설치했어요 (광고 채널 연동만) |
| ○ 특정 부분만 도움이 필요해요 |

---

### Phase 1: App Registration

#### 1-1. 앱 등록 시작

**Agent 발화**
```
좋아요! 앱 등록부터 시작할게요. 📱

먼저 출시하실 플랫폼을 선택해 주세요.
(나중에 추가도 가능해요)
```

**인터페이스: Multi Select**
| 앱 플랫폼 선택 (복수 선택 가능) |
|---|
| ☐ iOS |
| ☐ Android |
| ☐ Web |

`[다음 →]`

---

#### 1-2. 앱 정보 수집

**Agent 발화**
```
iOS와 Android 앱이시네요! 👍

앱 정보를 입력해 주세요.
스토어에 이미 출시되셨다면, 스토어 URL만 입력하시면
나머지 정보는 자동으로 가져올게요.
```

**인터페이스: Text Input**
| 📱 앱 정보 |
|---|
| **앱 이름** |
| `[텍스트 입력]` |
| |
| **스토어 URL** (선택 - 입력 시 자동 정보 추출) |
| `[https://...]` |
| 💡 App Store 또는 Play Store URL 입력 |
| |
| ─ 또는 직접 입력 ─ |
| |
| **iOS Bundle ID** |
| `[com.company.appname]` |
| |
| **Android Package Name** |
| `[com.company.appname]` |

`[다음 →]`

---

#### 1-3. 앱 등록 완료 안내

**Agent 발화**
```
완벽해요! ✅

이제 Airbridge 대시보드에서 앱을 등록해 주세요.

1️⃣ 아래 버튼을 클릭해서 대시보드 열기
2️⃣ [Add Your App] 클릭
3️⃣ 아래 정보 입력:
• 앱 이름: {입력받은 앱 이름}
• Bundle ID: {입력받은 Bundle ID}
• Package Name: {입력받은 Package Name}

완료되셨으면 알려주세요!
```

**인터페이스: Action Button + Copy + Single Select**
| 설정 |
|---|
| `[🔗 Airbridge 대시보드 열기]` |
| |
| 📋 **복사할 정보** |
| 앱 이름: MyApp `[📋 복사]` |
| Bundle ID: com.company.myapp `[📋 복사]` |
| Package: com.company.myapp `[📋 복사]` |
| |
| **앱 등록 완료하셨나요?** |
| ○ 네, 완료했어요! |
| ○ 문제가 생겼어요 |
| ○ 나중에 할게요 |

---

### Phase 2: SDK Installation

#### 2-1. 개발 환경 확인

**Agent 발화**
```
이제 SDK 설치를 진행할게요! 🛠️

앱 개발에 사용하신 프레임워크를 선택해 주세요.
```

**인터페이스: Single Select**
| 개발 프레임워크 선택 |
|---|
| **네이티브** |
| ○ iOS (Swift/Objective-C) |
| ○ Android (Kotlin/Java) |
| |
| **크로스 플랫폼** |
| ○ React Native |
| ○ Flutter |
| ○ Unity |
| ○ Unreal |
| ○ Cordova/Ionic |
| ○ Expo |

---

#### 2-2. SDK 설치 가이드 (React Native 예시)

**Agent 발화**
```
React Native를 사용하시는군요!

SDK 설치 명령어를 준비했어요.
터미널에서 실행해 주세요.
```

**인터페이스: Code Block + Single Select**
| 📦 SDK 설치 |
|---|
| **Step 1: 패키지 설치** |
| ```npm install airbridge-react-native-sdk``` `[📋 복사]` |
| |
| **Step 2: iOS 추가 설정** |
| ```cd ios && pod install``` `[📋 복사]` |
| |
| 📖 상세 가이드가 필요하시면: |
| `[React Native SDK 문서 보기 →]` |
| |
| **설치 완료하셨나요?** |
| ○ 네, 다음 단계로! |
| ○ 에러가 발생했어요 |

---

#### 2-3. SDK 초기화 설정

**Agent 발화**
```
잘 진행되고 있어요! 이제 SDK를 초기화할게요.

아래 코드를 앱 진입점(App.js 또는 index.js)에 추가해 주세요.
App Name과 App Token은 이미 채워놨어요! 🎯
```

**인터페이스: Code Block + Single Select**
| 🔧 SDK 초기화 코드 |
|---|
| ```javascript |
| import Airbridge from 'airbridge-react-native-sdk'; |
| |
| Airbridge.init({ |
|   appName: '{자동 채움}', |
|   appToken: '{자동 채움}', |
| }); |
| ``` `[📋 복사]` |
| |
| 💡 App Token은 대시보드 Settings에서 확인 가능 |
| |
| ○ 추가 완료! |
| ○ App Token을 모르겠어요 |

---

#### 2-4. 딥링크 설정

**Agent 발화**
```
거의 다 왔어요! 🏃

딥링크 설정이 필요해요. 딥링크를 사용하면
광고 클릭 → 앱 내 특정 화면으로 바로 이동할 수 있어요.

설정하시겠어요?
```

**인터페이스: Single Select with Info**
| 🔗 딥링크 설정 |
|---|
| ○ 지금 설정할게요 (권장) |
| ○ 나중에 설정할게요 (채널 연동 먼저) |
| |
| 💡 **딥링크란?** |
| 광고 클릭 시 앱 설치 후 특정 화면으로 바로 이동시키는 기능이에요. |
| 예: 상품 광고 클릭 → 해당 상품 페이지 |

---

#### 2-5. SDK 검증

**Agent 발화**
```
SDK 설정이 완료되었어요! 🎉

제대로 동작하는지 확인해볼게요.
앱을 실행하고, 아래 버튼을 눌러 Real-time Logs를 확인해 주세요.

'Install' 또는 'Open' 이벤트가 보이면 성공이에요!
```

**인터페이스: Action Button + Checklist + Single Select**
| ✅ SDK 검증 |
|---|
| `[📊 Real-time Logs 열기]` |
| |
| **확인할 이벤트:** |
| ☐ Install 이벤트 |
| ☐ Open 이벤트 |
| |
| **이벤트가 보이시나요?** |
| ○ 네, 보여요! ✅ |
| ○ 아니요, 안 보여요 ❌ |
| ○ 잘 모르겠어요 🤔 |

---

### Phase 3: Ad Channel Integration

#### 3-1. 연동할 채널 선택

**Agent 발화**
```
SDK 설정 완료! 이제 광고 채널을 연동할게요. 📺

어떤 광고 매체를 연동하시나요?
(복수 선택 가능, 하나씩 순서대로 진행해요)
```

**인터페이스: Multi Select**
| 📺 연동할 광고 채널 선택 (복수 가능) |
|---|
| **SAN (Self-Attributing Networks)** |
| ☐ Meta Ads (Facebook/Instagram) |
| ☐ Google Ads |
| ☐ Apple Search Ads |
| ☐ TikTok For Business |
| |
| **기타 채널** |
| ☐ Criteo |
| ☐ Unity Ads |
| ☐ AppLovin |
| ☐ 기타 직접 입력... |

`[다음 →]`

---

#### 3-2. Meta Ads 연동 시작

**Agent 발화**
```
먼저 Meta Ads부터 연동할게요! 📘

Meta Ads 연동은 3단계로 진행돼요:
1️⃣ Channel Integration (필수) - 어트리뷰션 연동
2️⃣ Cost Integration (권장) - 광고비 데이터 연동
3️⃣ SKAN Integration (iOS 필수) - iOS 14.5+ 대응

시작할게요!
```

**인터페이스: Progress Indicator**
| Meta Ads 연동 진행률 |
|---|
| ━━━━━━━━━━━━━━━━━━━━━━ 0% |
| |
| ☐ 1. Channel Integration |
| ☐ 2. Cost Integration |
| ☐ 3. SKAN Integration |
| |
| `[시작하기 →]` |

---

#### 3-3. Meta Channel Integration

**Agent 발화**
```
Meta Channel Integration을 진행할게요.

Airbridge 대시보드에서 설정하시면 돼요.
준비된 정보를 순서대로 입력해 주세요.
```

**인터페이스: Step Guide + Text Input + Single Select**
| 📘 Meta Ads - Channel Integration |
|---|
| **Step 1: 대시보드에서 Meta Ads 찾기** |
| `[대시보드 열기: Integrations → Ad Channels]` |
| |
| **Step 2: 필요한 정보 입력** |
| Meta App ID |
| `[텍스트 입력]` |
| 💡 Meta for Developers에서 확인 |
| `[Meta for Developers 바로가기 →]` |
| |
| **Step 3: Facebook Login으로 연결** |
| - Airbridge 대시보드의 [Connect] 버튼 클릭 |
| - Facebook 계정으로 로그인 |
| - 광고 계정 선택 후 권한 허용 |
| |
| **연결 완료하셨나요?** |
| ○ 네, 완료! |
| ○ Meta App ID를 모르겠어요 |
| ○ 권한 오류가 발생해요 |

---

#### 3-4. Apple Search Ads 특수 케이스

**Agent 발화**
```
Apple Search Ads 연동 전에 확인이 필요해요! ⚠️

Apple Search Ads는 두 가지 버전이 있는데요,
Airbridge는 Advanced 버전만 지원해요.

어떤 버전을 사용하고 계신가요?
```

**인터페이스: Single Select with Description**
| ⚠️ Apple Search Ads 버전 확인 |
|---|
| ○ **Advanced** (지원 ✅) |
| └ 월 $10,000 이상 광고비 |
| └ Campaign Management API 사용 가능 |
| |
| ○ **Basic** (미지원 ❌) |
| └ 소규모 광고주용 |
| └ API 지원 없음 |
| |
| ○ **잘 모르겠어요** |
| └ 확인 방법을 알려드릴게요 |

---

#### 3-5. Google Ads 연동

**Agent 발화**
```
Google Ads를 연동할게요! 🔵

Google Ads 연동은 3단계로 진행돼요:
1️⃣ Channel Integration (필수)
2️⃣ Cost Integration (권장)
3️⃣ SKAN Integration (iOS 필수)

Google 계정으로 로그인하시면 돼요.
```

**인터페이스: Progress + Action**
| 🔵 Google Ads 연동 |
|---|
| **Step 1: Channel Integration** |
| `[대시보드 열기: Integrations → Ad Channels → Google Ads]` |
| |
| - [Connect] 버튼 클릭 |
| - Google 계정으로 로그인 |
| - 광고 계정 선택 |
| |
| **연결 완료하셨나요?** |
| ○ 네, 완료! |
| ○ 문제가 생겼어요 |

---

#### 3-6. TikTok For Business 연동

**Agent 발화**
```
TikTok For Business를 연동할게요! 🎵

TikTok 연동 시 알아두실 점:
• Pangle 광고 성과 확인 시 "Sub-Publisher"를 GroupBy로 선택해야 해요
• EPC(Extended Privacy Control) 활성화 시 이벤트가 과소 집계될 수 있어요
```

**인터페이스: Info + Progress + Action**
| 🎵 TikTok For Business 연동 |
|---|
| ⚠️ **주의사항** |
| • Pangle 성과 확인 시 "Sub-Publisher" GroupBy 필요 |
| • EPC 활성화 시 이벤트 과소 집계 가능 |
| |
| **Step 1: Channel Integration** |
| `[대시보드 열기: Integrations → Ad Channels → TikTok]` |
| |
| - [Connect] 버튼 클릭 |
| - TikTok For Business 계정으로 로그인 |
| - 광고 계정 선택 |
| |
| **연결 완료하셨나요?** |
| ○ 네, 완료! |
| ○ 문제가 생겼어요 |

---

### Phase 4: 완료 및 검증

#### 4-1. 전체 설정 요약

**Agent 발화**
```
축하해요! 🎉 모든 설정이 완료되었어요!

설정 내역을 정리해 드릴게요.
```

**인터페이스: Summary Card + Action Buttons**
| ✅ Airbridge 설정 완료! |
|---|
| **📱 앱 정보** |
| • 앱 이름: {앱 이름} |
| • iOS: {Bundle ID} |
| • Android: {Package Name} |
| |
| **🛠️ SDK** |
| • Framework: {선택한 프레임워크} |
| • 버전: v4.x (최신) |
| • 딥링크: 설정 완료 |
| |
| **📺 연동된 광고 채널** |
| • Meta Ads: Channel ✅ Cost ✅ SKAN ✅ |
| • Google Ads: Channel ✅ Cost ✅ SKAN ✅ |
| • Apple Search Ads: Channel ✅ Cost ✅ |
| • TikTok: Channel ✅ Cost ✅ SKAN ✅ |
| |
| **📊 다음 단계** |
| `[트래킹 링크 만들기]` `[리포트 보기]` `[테스트하기]` |

---

## 6. 에러/예외 상황 대응

### E-1. SDK 이벤트가 안 보일 때

**Agent 발화**
```
이벤트가 안 보이시는군요. 🔍

몇 가지 확인해볼게요:

1️⃣ 앱이 Debug 모드로 실행 중인가요?
2️⃣ 네트워크 연결은 정상인가요?
3️⃣ App Token이 올바른가요?

아래에서 상황을 선택해 주세요.
```

**인터페이스: Single Select + Text Input**
| 🔧 트러블슈팅 |
|---|
| **어떤 상황인가요?** |
| ○ 앱이 크래시나요 |
| ○ 앱은 되는데 이벤트만 안 보여요 |
| ○ 특정 이벤트만 안 보여요 |
| ○ 에러 메시지가 있어요 (직접 입력) |
| |
| **에러 메시지 (있다면):** |
| `[텍스트 입력]` |

---

### E-2. Meta 권한 오류

**Agent 발화**
```
Meta 연결에서 권한 오류가 발생했네요. 😅

보통 아래 이유 중 하나예요:

• 광고 계정 관리자 권한이 없는 경우
• Business Manager 연결이 안 된 경우
• 앱이 Business Manager에 추가 안 된 경우

어떤 상황인 것 같으세요?
```

**인터페이스: Single Select**
| 🔐 Meta 권한 문제 해결 |
|---|
| ○ 광고 계정 권한 확인하기 |
| → Business Manager에서 내 역할 확인 |
| |
| ○ Business Manager에 앱 추가하기 |
| → 앱을 BM에 연결하는 방법 안내 |
| |
| ○ 다른 계정으로 시도할래요 |
| → 권한 있는 계정으로 재연결 |
| |
| ○ 나중에 다시 시도할게요 |

---

### E-3. Apple Search Ads Basic 사용자

**Agent 발화**
```
아쉽게도 Apple Search Ads Basic은 현재 지원되지 않아요. 😢

Basic 버전은 Campaign Management API를 제공하지 않아서
Airbridge와 연동이 불가능해요.

Advanced로 업그레이드하시면 연동이 가능해요!
```

**인터페이스: Info + Action**
| ℹ️ Apple Search Ads Basic 미지원 |
|---|
| Basic 버전은 API를 제공하지 않아 연동 불가 |
| |
| **대안:** |
| `[Advanced로 업그레이드 방법 보기]` |
| `[다른 채널 먼저 연동하기]` |

---

## 7. 인터페이스 컴포넌트 정의

### Component Type 1: Single Select
- **사용**: 상태 확인, 분기 결정
- **특징**: 라디오 버튼 (○)
- **즉시 반응**: 선택 즉시 다음 단계로 진행

### Component Type 2: Multi Select
- **사용**: 플랫폼 선택, 채널 선택
- **특징**: 체크박스 (☐/☑)
- **확인 필요**: [다음 →] 버튼 클릭 시 진행

### Component Type 3: Text Input
- **사용**: 앱 이름, Bundle ID, 스토어 URL
- **특징**: 필수/선택 구분, 자동완성
- **검증**: 실시간 포맷 검증 (com.xxx.xxx)

### Component Type 4: Code Block
- **사용**: 설치 명령어, 초기화 코드
- **특징**: 구문 하이라이팅, 복사 버튼
- **자동 채움**: App Token 등 사전 정보 삽입

### Component Type 5: Action Button
- **사용**: 외부 링크 (대시보드, 문서)
- **특징**: 새 탭에서 열림, 돌아오기 안내
- **추적**: 클릭 여부 확인

### Component Type 6: Progress Indicator
- **사용**: 전체 진행률, 하위 단계 진행률
- **특징**: 퍼센티지 + 체크리스트
- **동기화**: 실시간 업데이트

---

## 8. Agentic Decision Tree

```
[시작]
│
├─ Q: "현재 설정 상태는?"
│   ├─ 처음 시작 → Phase 1 (App Registration)
│   ├─ 앱 등록 완료 → Phase 2 (SDK Installation)
│   ├─ SDK 설치 완료 → Phase 3 (Ad Channel Integration)
│   └─ 특정 부분만 → 해당 Phase로 직접 이동
│
├─ Q: "어떤 플랫폼인가요?"
│   ├─ iOS → iOS 관련 설정 포함
│   ├─ Android → Android 관련 설정 포함
│   ├─ Both → 둘 다 순차 진행
│   └─ Web → Web SDK 가이드
│
├─ Q: "어떤 프레임워크인가요?"
│   ├─ Native iOS → iOS SDK
│   ├─ Native Android → Android SDK
│   ├─ React Native → RN SDK
│   ├─ Flutter → Flutter SDK
│   ├─ Unity → Unity SDK
│   └─ 기타 → 해당 SDK
│
├─ Q: "SDK 설치 완료?"
│   ├─ Yes + 이벤트 확인됨 → Phase 3
│   ├─ Yes + 이벤트 안 보임 → 트러블슈팅
│   └─ No → SDK 설치 계속
│
├─ Q: "어떤 광고 매체?"
│   ├─ Meta → Meta 연동 플로우
│   ├─ Google → Google 연동 플로우
│   ├─ ASA → 버전 확인 후 진행
│   ├─ TikTok → TikTok 플로우
│   └─ 기타 → Custom Channel
│
└─ Q: "iOS 앱 있나요?"
    ├─ Yes → SKAN 설정 필수 안내
    └─ No → SKAN 스킵
```

---

## 9. 참고 문서 및 주의사항

### SDK 문서
- [iOS SDK](https://help.airbridge.io/en/developers/ios-sdk)
- [Android SDK](https://help.airbridge.io/en/developers/android-sdk)
- [React Native SDK](https://help.airbridge.io/en/developers/react-native-sdk)
- [Flutter SDK](https://help.airbridge.io/en/developers/flutter-sdk)
- [Unity SDK](https://help.airbridge.io/en/developers/unity-sdk)
- [Web SDK](https://help.airbridge.io/en/developers/web-sdk)

### 광고 채널 연동 문서
- [Meta Ads 개요](https://help.airbridge.io/en/guides/meta-business)
- [Meta Ads Channel Integration](https://help.airbridge.io/en/guides/meta-business-channel-integration)
- [Meta Ads Cost Integration](https://help.airbridge.io/en/guides/meta-business-cost-integration)
- [Google Ads 개요](https://help.airbridge.io/en/guides/google-ads)
- [Google Ads Channel Integration](https://help.airbridge.io/en/guides/google-ads-channel-integration)
- [Google Ads Cost Integration](https://help.airbridge.io/en/guides/google-ads-cost-integration)
- [Apple Search Ads 개요](https://help.airbridge.io/en/guides/apple-search-ads)
- [Apple Search Ads Channel Integration](https://help.airbridge.io/en/guides/apple-search-ads-channel-integration)
- [Apple Search Ads Cost Integration](https://help.airbridge.io/en/guides/apple-search-ads-cost-integration)
- [TikTok For Business 개요](https://help.airbridge.io/en/guides/tiktok-for-business)
- [TikTok SAN Integration](https://help.airbridge.io/en/guides/tiktok-for-business-channel-integration-new)
- [TikTok Cost Integration](https://help.airbridge.io/en/guides/tiktok-for-business-cost-integration)

### 주요 주의사항

1. **Apple Search Ads**: Advanced 솔루션만 지원 (Basic 미지원)
2. **TikTok Pangle**: 성과 확인 시 "Sub-Publisher"를 GroupBy로 선택 필요
3. **TikTok EPC**: Extended Privacy Control 활성화 시 이벤트 과소 집계 가능
4. **iOS SKAN**: iOS 14.5+ 대응을 위해 필수 설정

### 공통 권장 연동 순서

모든 광고 매체에서 아래 순서로 진행:

1. **Channel Integration (필수)** → 기본 어트리뷰션 연동
2. **Cost Integration (권장)** → 광고비 데이터 연동
3. **SKAN Integration (iOS 필수)** → iOS 14.5+ 대응
4. **Agency Settings (필요시)** → 에이전시 권한 관리
