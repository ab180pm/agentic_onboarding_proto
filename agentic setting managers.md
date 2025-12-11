# Airbridge 앱 등록 및 온보딩 완벽 가이드

## 목차
1. [앱 등록 단계별 가이드](#1-앱-등록-단계별-가이드)
2. [플랜별 온보딩 차이점](#2-플랜별-온보딩-차이점)
3. [Development vs Production Mode](#3-development-vs-production-mode)
4. [고객사 세팅 및 테스트 순서](#4-고객사-세팅-및-테스트-순서)

---

## 1. 앱 등록 단계별 가이드

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

## 2. 플랜별 온보딩 차이점

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

## 3. Development vs Production Mode

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