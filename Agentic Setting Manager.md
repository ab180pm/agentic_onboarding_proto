# Agentic Setting Manager - Airbridge 온보딩 가이드 설계

## 📋 설계 원칙

1. **최소 Input, 최대 정보** - 선택지 기반으로 클릭만으로 진행
2. **컨텍스트 기반 스마트 분기** - 이전 답변에 따라 불필요한 질문 스킵
3. **진행률 시각화** - 현재 위치와 남은 단계 명확히 표시
4. **즉각적 피드백** - 각 단계 완료 시 확인 메시지

---

## 🎬 전체 시나리오 스크립트

### Phase 0: 웰컴 & 시작

#### Agent 발화
안녕하세요! Airbridge 설정을 도와드릴 Agentic Setting Manager입니다. 🚀

앱 등록부터 SDK 설치, 광고 채널 연동까지
전체 과정을 함께 진행해 드릴게요.

시작하기 전에, 현재 상황을 먼저 확인할게요.


### Phase 1: App Registration

#### 1-1. 앱 등록 시작

**Agent 발화**
좋아요! 앱 등록부터 시작할게요. 📱

먼저 출시하실 플랫폼을 선택해 주세요.
(나중에 추가도 가능해요)


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
iOS와 Android 앱이시네요! 👍

앱 정보를 입력해 주세요.
스토어에 이미 출시되셨다면, 스토어 URL만 입력하시면
나머지 정보는 자동으로 가져올게요.


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
완벽해요! ✅

이제 Airbridge 대시보드에서 앱을 등록해 주세요.

1️⃣ 아래 버튼을 클릭해서 대시보드 열기
2️⃣ [Add Your App] 클릭
3️⃣ 아래 정보 입력:
• 앱 이름: {입력받은 앱 이름}
• Bundle ID: {입력받은 Bundle ID}
• Package Name: {입력받은 Package Name}

완료되셨으면 알려주세요!


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
이제 SDK 설치를 진행할게요! 🛠️

앱 개발에 사용하신 프레임워크를 선택해 주세요.


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
React Native를 사용하시는군요!

SDK 설치 명령어를 준비했어요.
터미널에서 실행해 주세요.


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
잘 진행되고 있어요! 이제 SDK를 초기화할게요.

아래 코드를 앱 진입점(App.js 또는 index.js)에 추가해 주세요.
App Name과 App Token은 이미 채워놨어요! 🎯


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
거의 다 왔어요! 🏃

딥링크 설정이 필요해요. 딥링크를 사용하면
광고 클릭 → 앱 내 특정 화면으로 바로 이동할 수 있어요.

설정하시겠어요?


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
SDK 설정이 완료되었어요! 🎉

제대로 동작하는지 확인해볼게요.
앱을 실행하고, 아래 버튼을 눌러 Real-time Logs를 확인해 주세요.

'Install' 또는 'Open' 이벤트가 보이면 성공이에요!


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
SDK 설정 완료! 이제 광고 채널을 연동할게요. 📺

어떤 광고 매체를 연동하시나요?
(복수 선택 가능, 하나씩 순서대로 진행해요)


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
먼저 Meta Ads부터 연동할게요! 📘

Meta Ads 연동은 3단계로 진행돼요:
1️⃣ Channel Integration (필수) - 어트리뷰션 연동
2️⃣ Cost Integration (권장) - 광고비 데이터 연동
3️⃣ SKAN Integration (iOS 필수) - iOS 14.5+ 대응

시작할게요!


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
Meta Channel Integration을 진행할게요.

Airbridge 대시보드에서 설정하시면 돼요.
준비된 정보를 순서대로 입력해 주세요.


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
Apple Search Ads 연동 전에 확인이 필요해요! ⚠️

Apple Search Ads는 두 가지 버전이 있는데요,
Airbridge는 Advanced 버전만 지원해요.

어떤 버전을 사용하고 계신가요?


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
Google Ads를 연동할게요! 🔵

Google Ads 연동은 3단계로 진행돼요:
1️⃣ Channel Integration (필수)
2️⃣ Cost Integration (권장)
3️⃣ SKAN Integration (iOS 필수)

Google 계정으로 로그인하시면 돼요.


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
TikTok For Business를 연동할게요! 🎵

TikTok 연동 시 알아두실 점:
• Pangle 광고 성과 확인 시 "Sub-Publisher"를 GroupBy로 선택해야 해요
• EPC(Extended Privacy Control) 활성화 시 이벤트가 과소 집계될 수 있어요


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
축하해요! 🎉 모든 설정이 완료되었어요!

설정 내역을 정리해 드릴게요.


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

## 🚨 에러/예외 상황 대응 스크립트

### E-1. SDK 이벤트가 안 보일 때

**Agent 발화**
이벤트가 안 보이시는군요. 🔍

몇 가지 확인해볼게요:

1️⃣ 앱이 Debug 모드로 실행 중인가요?
2️⃣ 네트워크 연결은 정상인가요?
3️⃣ App Token이 올바른가요?

아래에서 상황을 선택해 주세요.


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
Meta 연결에서 권한 오류가 발생했네요. 😅

보통 아래 이유 중 하나예요:

• 광고 계정 관리자 권한이 없는 경우
• Business Manager 연결이 안 된 경우
• 앱이 Business Manager에 추가 안 된 경우

어떤 상황인 것 같으세요?


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
아쉽게도 Apple Search Ads Basic은 현재 지원되지 않아요. 😢

Basic 버전은 Campaign Management API를 제공하지 않아서
Airbridge와 연동이 불가능해요.

Advanced로 업그레이드하시면 연동이 가능해요!


**인터페이스: Info + Action**
| ℹ️ Apple Search Ads Basic 미지원 |
|---|
| Basic 버전은 API를 제공하지 않아 연동 불가 |
| |
| **대안:** |
| `[Advanced로 업그레이드 방법 보기]` |
| `[다른 채널 먼저 연동하기]` |

---

## 📐 인터페이스 컴포넌트 정의

### Component Type 1: Single Select
사용: 상태 확인, 분기 결정
특징: 라디오 버튼 (○)
즉시 반응: 선택 즉시 다음 단계로 진행


### Component Type 2: Multi Select
사용: 플랫폼 선택, 채널 선택
특징: 체크박스 (☐/☑)
확인 필요: [다음 →] 버튼 클릭 시 진행


### Component Type 3: Text Input
사용: 앱 이름, Bundle ID, 스토어 URL
특징: 필수/선택 구분, 자동완성
검증: 실시간 포맷 검증 (com.xxx.xxx)


### Component Type 4: Code Block
사용: 설치 명령어, 초기화 코드
특징: 구문 하이라이팅, 복사 버튼
자동 채움: App Token 등 사전 정보 삽입


### Component Type 5: Action Button
사용: 외부 링크 (대시보드, 문서)
특징: 새 탭에서 열림, 돌아오기 안내
추적: 클릭 여부 확인


### Component Type 6: Progress Indicator
사용: 전체 진행률, 하위 단계 진행률
특징: 퍼센티지 + 체크리스트
동기화: 실시간 업데이트


---

## 📊 Agentic Decision Tree

[시작]
│
├─ Q: "현재 설정 상태는?"
│ ├─ 처음 시작 → Phase 1 (App Registration)
│ ├─ 앱 등록 완료 → Phase 2 (SDK Installation)
│ ├─ SDK 설치 완료 → Phase 3 (Ad Channel Integration)
│ └─ 특정 부분만 → 해당 Phase로 직접 이동
│
├─ Q: "어떤 플랫폼인가요?"
│ ├─ iOS → iOS 관련 설정 포함
│ ├─ Android → Android 관련 설정 포함
│ ├─ Both → 둘 다 순차 진행
│ └─ Web → Web SDK 가이드
│
├─ Q: "어떤 프레임워크인가요?"
│ ├─ Native iOS → iOS SDK
│ ├─ Native Android → Android SDK
│ ├─ React Native → RN SDK
│ ├─ Flutter → Flutter SDK
│ ├─ Unity → Unity SDK
│ └─ 기타 → 해당 SDK
│
├─ Q: "SDK 설치 완료?"
│ ├─ Yes + 이벤트 확인됨 → Phase 3
│ ├─ Yes + 이벤트 안 보임 → 트러블슈팅
│ └─ No → SDK 설치 계속
│
├─ Q: "어떤 광고 매체?"
│ ├─ Meta → Meta 연동 플로우
│ ├─ Google → Google 연동 플로우
│ ├─ ASA → 버전 확인 후 진행
│ ├─ TikTok → TikTok 플로우
│ └─ 기타 → Custom Channel
│
└─ Q: "iOS 앱 있나요?"
├─ Yes → SKAN 설정 필수 안내
└─ No → SKAN 스킵


---

## 🎯 핵심 가이드 원칙

| 원칙 | 설명 |
|---|---|
| **단계별 진행** | 이전 단계 완료 확인 후 다음 단계로 |
| **검증 우선** | 각 단계마다 Real-time Logs로 데이터 수신 확인 |
| **맞춤 가이드** | 플랫폼/프레임워크에 따라 적절한 SDK 문서 제공 |
| **필수 vs 선택 구분** | Channel Integration(필수) → Cost(권장) → SKAN(iOS 필수) |
| **트러블슈팅 대비** | 각 SDK별 Troubleshooting 문서 준비 |
| **최소 Input** | 선택지 기반으로 클릭만으로 진행 |
| **자동 채움** | 이전 단계 정보를 다음 단계에 자동 적용 |

---

## 📚 참고 문서 링크

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

---

## ⚠️ 주요 주의사항

1. **Apple Search Ads**: Advanced 솔루션만 지원 (Basic 미지원)
2. **TikTok Pangle**: 성과 확인 시 "Sub-Publisher"를 GroupBy로 선택 필요
3. **TikTok EPC**: Extended Privacy Control 활성화 시 이벤트 과소 집계 가능
4. **iOS SKAN**: iOS 14.5+ 대응을 위해 필수 설정

---

## 🔄 공통 권장 연동 순서

모든 광고 매체에서 아래 순서로 진행:

Channel Integration (필수) → 기본 어트리뷰션 연동
Cost Integration (권장) → 광고비 데이터 연동
SKAN Integration (iOS 필수) → iOS 14.5+ 대응
Agency Settings (필요시) → 에이전시 권한 관리
