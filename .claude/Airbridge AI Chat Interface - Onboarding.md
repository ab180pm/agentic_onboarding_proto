# 📋 Airbridge AI Chat Interface - Onboarding Module Specification

## 🎯 개요

Airbridge의 온보딩 기능을 Chat Interface로 제어하기 위한 AI Agent 모듈 설계 문서입니다.
사용자가 자연어로 온보딩을 완료할 수 있도록 단계별 모듈을 정의하고, 모듈 간 의존성 관계를 명시합니다.

---

## 📁 모듈 구조

```
onboarding/
├── setup/                    # 초기 설정
│   ├── create_app           # 앱 생성
│   ├── configure_timezone   # 타임존 설정
│   ├── configure_currency   # 통화 설정
│   └── register_store       # 스토어 등록
│
├── sdk/                      # SDK 통합
│   ├── install_guide        # SDK 설치 가이드
│   ├── initialize           # SDK 초기화
│   ├── configure_deeplink   # 딥링크 설정
│   └── test_sdk             # SDK 테스트
│
├── attribution/              # 어트리뷰션 설정
│   ├── configure_window     # 어트리뷰션 윈도우
│   ├── configure_rules      # 어트리뷰션 규칙
│   └── fraud_rules          # 프로드 검증 규칙
│
├── integration/              # 채널 연동
│   ├── connect_channel      # 광고 채널 연동
│   ├── create_tracking_link # 트래킹 링크 생성
│   └── cost_integration     # 비용 연동
│
├── verification/             # 검증
│   ├── test_deeplink        # 딥링크 테스트
│   ├── test_attribution     # 어트리뷰션 테스트
│   └── verify_data          # 데이터 수집 확인
│
└── progress/                 # 진행 관리
    ├── check_status         # 진행 상태 확인
    ├── get_checklist        # 체크리스트 조회
    └── get_next_step        # 다음 단계 안내
```

---

## 🔗 의존성 다이어그램

```
                              ┌──────────────────┐
                              │  CREATE_APP      │ ← 모든 것의 시작점 (Root)
                              │  (앱 생성)        │
                              └────────┬─────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  CONFIGURE_      │       │  REGISTER_       │       │  SDK_INSTALL     │
│  TIMEZONE        │       │  STORE           │       │  (SDK 설치)       │
│  (타임존 설정)    │       │  (스토어 등록)    │       │                  │
└────────┬─────────┘       └──────────────────┘       └────────┬─────────┘
         │                                                      │
         ▼                                                      ▼
┌──────────────────┐                                  ┌──────────────────┐
│  CONFIGURE_      │                                  │  SDK_INITIALIZE  │
│  CURRENCY        │                                  │  (SDK 초기화)     │
└──────────────────┘                                  └────────┬─────────┘
                                                               │
                              ┌─────────────────────────────────┼──────────────┐
                              │                                 │              │
                              ▼                                 ▼              ▼
                    ┌──────────────┐                  ┌──────────────┐  ┌──────────────────┐
                    │ CONFIGURE_   │                  │ ATTRIBUTION_ │  │ CONNECT_         │
                    │ DEEPLINK     │                  │ WINDOW       │  │ CHANNEL          │
                    └──────┬───────┘                  └──────┬───────┘  └────────┬─────────┘
                           │                                 │                    │
                           ▼                                 ▼                    ▼
                    ┌──────────────┐                  ┌──────────────┐  ┌──────────────────┐
                    │ TEST_DEEPLINK│                  │ FRAUD_RULES  │  │ CREATE_TRACKING_ │
                    └──────┬───────┘                  └──────────────┘  │ LINK             │
                           │                                            └────────┬─────────┘
                           └──────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
                               ┌──────────────────┐
                               │ TEST_ATTRIBUTION │
                               └────────┬─────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │ VERIFY_DATA      │
                               └────────┬─────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │ ✅ ONBOARDING    │
                               │    COMPLETE      │
                               └──────────────────┘
```

---

## 📦 모듈 상세 JSON 스키마

### Setup Modules

```json
{
  \"setup.create_app\": {
    \"module_id\": \"setup.create_app\",
    \"name\": \"앱 생성\",
    \"description\": \"Airbridge에 새 앱을 등록합니다\",
    \"intents\": [\"create_app\", \"register_app\", \"add_app\", \"새 앱\", \"앱 등록\", \"앱 추가\"],
    \"prerequisites\": [],
    \"unlocks\": [\"*\"],
    \"blocker_type\": \"hard\",
    \"is_root\": true,
    \"required_inputs\": [
      {
        \"field\": \"organization\",
        \"type\": \"select|create\",
        \"prompt\": \"어떤 조직에 앱을 추가할까요?\",
        \"validation\": \"required\"
      },
      {
        \"field\": \"app_mode\",
        \"type\": \"select\",
        \"options\": [\"Production\", \"Development\"],
        \"prompt\": \"앱 모드를 선택해주세요. ⚠️ 변경 불가!\",
        \"validation\": \"required\"
      },
      {
        \"field\": \"airbridge_app_name\",
        \"type\": \"string\",
        \"prompt\": \"Airbridge App Name을 입력해주세요. ⚠️ 변경 불가!\",
        \"validation\": \"lowercase_alphanumeric, unique\"
      },
      {
        \"field\": \"timezone\",
        \"type\": \"select\",
        \"prompt\": \"타임존을 선택해주세요. ⚠️ 변경 불가!\",
        \"validation\": \"required\"
      },
      {
        \"field\": \"currency\",
        \"type\": \"select\",
        \"prompt\": \"기본 통화를 선택해주세요. ⚠️ 변경 불가!\",
        \"validation\": \"required\"
      }
    ],
    \"guide_link\": \"https://help.airbridge.io/en/guides/register-a-new-app\",
    \"on_complete\": {
      \"message\": \"앱이 성공적으로 생성되었어요! 🎉\
\
다음 단계로 SDK를 설치하시겠어요?\",
      \"next_suggested\": [\"sdk.install_guide\"]
    },
    \"warnings\": [\"App Mode, Airbridge App Name, Timezone, Currency는 생성 후 변경할 수 없습니다.\"]
  },
  
  \"setup.configure_timezone\": {
    \"module_id\": \"setup.configure_timezone\",
    \"name\": \"타임존 설정\",
    \"prerequisites\": [\"setup.create_app\"],
    \"unlocks\": [\"setup.configure_currency\"],
    \"blocker_type\": \"soft\",
    \"note\": \"앱 생성 시 함께 설정됨, 변경 불가\"
  },
  
  \"setup.configure_currency\": {
    \"module_id\": \"setup.configure_currency\",
    \"name\": \"통화 설정\",
    \"prerequisites\": [\"setup.configure_timezone\"],
    \"unlocks\": [],
    \"blocker_type\": \"soft\",
    \"note\": \"앱 생성 시 함께 설정됨, 변경 불가\"
  },
  
  \"setup.register_store\": {
    \"module_id\": \"setup.register_store\",
    \"name\": \"스토어 등록\",
    \"prerequisites\": [\"setup.create_app\"],
    \"unlocks\": [],
    \"blocker_type\": \"optional\",
    \"note\": \"App Store, Google Play 링크 등록\"
  }
}
```

### SDK Modules

```json
{
  \"sdk.install_guide\": {
    \"module_id\": \"sdk.install_guide\",
    \"name\": \"SDK 설치 가이드\",
    \"description\": \"플랫폼별 SDK 설치 방법을 안내합니다\",
    \"intents\": [\"sdk_install\", \"sdk_setup\", \"SDK 설치\", \"SDK 연동\", \"앱에 SDK 넣기\"],
    \"prerequisites\": [\"setup.create_app\"],
    \"unlocks\": [\"sdk.initialize\"],
    \"blocker_type\": \"hard\",
    \"required_inputs\": [
      {
        \"field\": \"platform\",
        \"type\": \"select\",
        \"options\": [\"Android\", \"iOS\", \"Web\", \"React Native\", \"Flutter\", \"Unity\", \"Unreal\"],
        \"prompt\": \"어떤 플랫폼에 SDK를 설치하시나요?\"
      }
    ],
    \"platform_guides\": {
      \"Android\": \"https://help.airbridge.io/en/developers/android-sdk-v4\",
      \"iOS\": \"https://help.airbridge.io/en/developers/ios-sdk-v4\",
      \"React Native\": \"https://help.airbridge.io/en/developers/react-native-sdk-v4\",
      \"Flutter\": \"https://help.airbridge.io/en/developers/flutter-sdk-v4\",
      \"Unity\": \"https://help.airbridge.io/en/developers/unity-sdk-v4\",
      \"Unreal\": \"https://help.airbridge.io/en/developers/unreal-sdk-v4\",
      \"Web\": \"https://help.airbridge.io/en/developers/web-sdk\"
    }
  },
  
  \"sdk.initialize\": {
    \"module_id\": \"sdk.initialize\",
    \"name\": \"SDK 초기화\",
    \"prerequisites\": [\"sdk.install_guide\"],
    \"unlocks\": [\"sdk.configure_deeplink\", \"sdk.test_sdk\", \"attribution.configure_window\", \"integration.connect_channel\"],
    \"blocker_type\": \"hard\",
    \"required_credentials\": [\"app_name\", \"app_token\"]
  },
  
  \"sdk.configure_deeplink\": {
    \"module_id\": \"sdk.configure_deeplink\",
    \"name\": \"딥링크 설정\",
    \"intents\": [\"딥링크 설정\", \"deeplink setup\", \"앱링크 설정\"],
    \"prerequisites\": [\"sdk.initialize\"],
    \"unlocks\": [\"verification.test_deeplink\"],
    \"blocker_type\": \"hard\",
    \"required_inputs\": [\"uri_scheme\", \"app_links_domain\", \"universal_links_domain\"],
    \"guide_link\": \"https://help.airbridge.io/en/guides/retargeting-with-deep-links\"
  },
  
  \"sdk.test_sdk\": {
    \"module_id\": \"sdk.test_sdk\",
    \"name\": \"SDK 테스트\",
    \"prerequisites\": [\"sdk.initialize\"],
    \"unlocks\": [],
    \"blocker_type\": \"soft\",
    \"guide_link\": \"https://help.airbridge.io/en/guides/sdk-testing\"
  }
}
```

### Attribution Modules

```json
{
  \"attribution.configure_window\": {
    \"module_id\": \"attribution.configure_window\",
    \"name\": \"어트리뷰션 윈도우 설정\",
    \"intents\": [\"어트리뷰션 설정\", \"윈도우 설정\", \"attribution window\"],
    \"prerequisites\": [\"sdk.initialize\"],
    \"unlocks\": [\"attribution.fraud_rules\", \"attribution.configure_rules\"],
    \"blocker_type\": \"soft\",
    \"guide_link\": \"https://help.airbridge.io/en/guides/setting-attribution-window\"
  },
  
  \"attribution.configure_rules\": {
    \"module_id\": \"attribution.configure_rules\",
    \"name\": \"어트리뷰션 규칙 설정\",
    \"prerequisites\": [\"attribution.configure_window\"],
    \"unlocks\": [],
    \"blocker_type\": \"optional\"
  },
  
  \"attribution.fraud_rules\": {
    \"module_id\": \"attribution.fraud_rules\",
    \"name\": \"프로드 검증 규칙\",
    \"intents\": [\"프로드 설정\", \"fraud rules\", \"사기 방지\"],
    \"prerequisites\": [\"attribution.configure_window\"],
    \"unlocks\": [],
    \"blocker_type\": \"optional\",
    \"guide_link\": \"https://help.airbridge.io/en/guides/fraud-validation-rules\"
  }
}
```

### Integration Modules

```json
{
  \"integration.connect_channel\": {
    \"module_id\": \"integration.connect_channel\",
    \"name\": \"광고 채널 연동\",
    \"description\": \"광고 채널을 Airbridge에 연동합니다\",
    \"intents\": [\"connect_channel\", \"channel_integration\", \"채널 연동\", \"메타 연동\", \"구글 연동\"],
    \"prerequisites\": [\"sdk.initialize\"],
    \"unlocks\": [\"integration.create_tracking_link\", \"integration.cost_integration\"],
    \"blocker_type\": \"hard\",
    \"supported_channels\": {
      \"SAN\": [
        {\"name\": \"Meta Ads\", \"guide\": \"https://help.airbridge.io/en/guides/meta-business-channel-integration\"},
        {\"name\": \"Google Ads\", \"guide\": \"https://help.airbridge.io/en/guides/google-ads-channel-integration\"},
        {\"name\": \"Apple Search Ads\", \"guide\": \"https://help.airbridge.io/en/guides/apple-search-ads-channel-integration\"},
        {\"name\": \"TikTok for Business\", \"guide\": \"https://help.airbridge.io/en/guides/tiktok-for-business-channel-integration-new\"}
      ]
    }
  },
  
  \"integration.create_tracking_link\": {
    \"module_id\": \"integration.create_tracking_link\",
    \"name\": \"트래킹 링크 생성\",
    \"intents\": [\"트래킹 링크 만들어줘\", \"tracking link\", \"링크 생성\"],
    \"prerequisites\": [\"integration.connect_channel\"],
    \"unlocks\": [\"verification.test_attribution\"],
    \"blocker_type\": \"hard\",
    \"guide_link\": \"https://help.airbridge.io/en/guides/creating-a-new-tracking-link\"
  },
  
  \"integration.cost_integration\": {
    \"module_id\": \"integration.cost_integration\",
    \"name\": \"비용 연동\",
    \"prerequisites\": [\"integration.connect_channel\"],
    \"unlocks\": [],
    \"blocker_type\": \"optional\"
  }
}
```

### Verification Modules

```json
{
  \"verification.test_deeplink\": {
    \"module_id\": \"verification.test_deeplink\",
    \"name\": \"딥링크 테스트\",
    \"intents\": [\"test_deeplink\", \"딥링크 테스트\", \"딥링크 확인\"],
    \"prerequisites\": [\"sdk.configure_deeplink\"],
    \"unlocks\": [\"verification.test_attribution\"],
    \"blocker_type\": \"hard\",
    \"test_scenarios\": [
      \"앱 설치 시 딥링크 동작\",
      \"앱 미설치 시 스토어 폴백\",
      \"Deferred Deep Link\"
    ],
    \"guide_link\": \"https://help.airbridge.io/en/guides/deep-linking-test\"
  },
  
  \"verification.test_attribution\": {
    \"module_id\": \"verification.test_attribution\",
    \"name\": \"어트리뷰션 테스트\",
    \"prerequisites\": [\"verification.test_deeplink\", \"integration.create_tracking_link\"],
    \"prerequisites_logic\": \"AND\",
    \"unlocks\": [\"verification.verify_data\"],
    \"blocker_type\": \"hard\",
    \"guide_link\": \"https://help.airbridge.io/en/guides/sdk-testing\"
  },
  
  \"verification.verify_data\": {
    \"module_id\": \"verification.verify_data\",
    \"name\": \"데이터 수집 확인\",
    \"prerequisites\": [\"verification.test_attribution\"],
    \"unlocks\": [\"onboarding.complete\"],
    \"blocker_type\": \"hard\",
    \"verification_items\": [
      \"Real-time Logs에서 이벤트 확인\",
      \"Actuals Report에서 데이터 확인\",
      \"Attribution 결과 확인\"
    ]
  }
}
```

### Progress Modules

```json
{
  \"progress.check_status\": {
    \"module_id\": \"progress.check_status\",
    \"name\": \"온보딩 진행 상태\",
    \"intents\": [\"check_status\", \"progress\", \"진행 상태\", \"얼마나 했어\", \"온보딩 현황\"],
    \"prerequisites\": [\"setup.create_app\"],
    \"unlocks\": [],
    \"blocker_type\": \"none\",
    \"always_available_after_app_creation\": true
  },
  
  \"progress.get_checklist\": {
    \"module_id\": \"progress.get_checklist\",
    \"name\": \"체크리스트 조회\",
    \"intents\": [\"checklist\", \"체크리스트\", \"할 일 목록\"],
    \"prerequisites\": [\"setup.create_app\"],
    \"unlocks\": [],
    \"blocker_type\": \"none\",
    \"always_available_after_app_creation\": true
  },
  
  \"progress.get_next_step\": {
    \"module_id\": \"progress.get_next_step\",
    \"name\": \"다음 단계 안내\",
    \"intents\": [\"next step\", \"다음 뭐해\", \"뭐 해야해\"],
    \"prerequisites\": [\"setup.create_app\"],
    \"unlocks\": [],
    \"blocker_type\": \"none\",
    \"always_available_after_app_creation\": true
  }
}
```

---

## 🚦 Blocker 타입 정의

| Type | 설명 | AI 동작 |
|------|------|---------|
| **hard** | 필수 선행 조건. 미완료 시 진행 불가 | 자동으로 선행 모듈로 리다이렉트 |
| **soft** | 권장 선행 조건. 경고 후 진행 가능 | 경고 메시지 표시 후 사용자 선택 |
| **optional** | 선택적 조건. 건너뛰기 가능 | 메시지 없이 진행 |
| **none** | 조건 없음 | 바로 진행 |

---

## 🔄 AI Agent 라우팅 플로우

```
┌─────────────────────────────────────────────────────────────┐
│                    User Chat Input                          │
│      \"SDK 설치하고 싶어\"                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Intent Classification                       │
│  - Primary Intent: SDK_INSTALL                               │
│  - Category: ONBOARDING.SDK                                  │
│  - Required Context: platform                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Prerequisite Check                              │
│  ❓ 앱이 생성되어 있나요?                                    │
│  ├─ Yes → Continue                                           │
│  └─ No  → Redirect to setup.create_app                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Collection                              │
│  AI: \"어떤 플랫폼에 SDK를 설치하시나요?\"                     │
│  User: \"안드로이드요\"                                        │
│  → platform = \"Android\"                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Module Execution                                │
│  Module: sdk.install_guide                                   │
│  Platform: Android                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Response                                   │
│  \"안드로이드 SDK 설치 방법을 안내해드릴게요! 📱             │
│   [설치 가이드 제공]                                         │
│   📚 상세 가이드: [Android SDK 문서](link)                   │
│   설치가 완료되면 SDK 테스트를 진행해볼까요?\"                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐍 Prerequisite Check Logic (Python)

```python
def check_prerequisites(target_module: str, user_state: dict) -> dict:
    \"\"\"
    사용자가 특정 모듈을 실행하려 할 때 선행 조건을 체크
    \"\"\"
    module_def = DEPENDENCY_DEFINITIONS[target_module]
    prerequisites = module_def.get(\"prerequisites\", [])
    prerequisites_logic = module_def.get(\"prerequisites_logic\", \"AND\")
    
    missing = []
    for prereq in prerequisites:
        if not user_state.get(f\"{prereq}_completed\", False):
            missing.append(prereq)
    
    # AND 로직: 모든 prerequisite 필요
    # OR 로직: 하나만 완료되어도 됨
    if prerequisites_logic == \"AND\":
        can_proceed_prereq = len(missing) == 0
    else:  # OR
        can_proceed_prereq = len(missing) < len(prerequisites)
    
    if can_proceed_prereq:
        return {
            \"can_proceed\": True,
            \"blocker_type\": \"none\",
            \"missing_prerequisites\": [],
            \"redirect_to\": None,
            \"message\": f\"'{module_def['name']}' 모듈을 시작합니다.\"
        }
    
    blocker_type = module_def.get(\"blocker_type\", \"hard\")
    first_missing = missing[0]
    first_missing_name = DEPENDENCY_DEFINITIONS[first_missing][\"name\"]
    
    if blocker_type == \"hard\":
        return {
            \"can_proceed\": False,
            \"blocker_type\": \"hard\",
            \"missing_prerequisites\": missing,
            \"redirect_to\": first_missing,
            \"message\": f\"⚠️ '{module_def['name']}'을(를) 진행하려면 먼저 '{first_missing_name}'이(가) 완료되어야 해요.\
\
'{first_missing_name}' 설정을 먼저 도와드릴까요?\"
        }
    elif blocker_type == \"soft\":
        return {
            \"can_proceed\": True,
            \"blocker_type\": \"soft\",
            \"missing_prerequisites\": missing,
            \"redirect_to\": None,
            \"message\": f\"💡 '{first_missing_name}'을(를) 먼저 완료하는 것을 권장해요. 그래도 진행하시겠어요?\"
        }
    else:
        return {
            \"can_proceed\": True,
            \"blocker_type\": \"none\",
            \"missing_prerequisites\": missing,
            \"redirect_to\": None,
            \"message\": None
        }
```

---

## 📊 의존성 요약 테이블

| Module | Prerequisites | Unlocks | Blocker |
|--------|---------------|---------|---------|
| setup.create_app | - | ALL | hard |
| setup.configure_timezone | create_app | configure_currency | soft |
| setup.configure_currency | configure_timezone | - | soft |
| setup.register_store | create_app | - | optional |
| sdk.install_guide | create_app | sdk.initialize | hard |
| sdk.initialize | sdk.install_guide | deeplink, test, attribution, channel | hard |
| sdk.configure_deeplink | sdk.initialize | test_deeplink | hard |
| sdk.test_sdk | sdk.initialize | - | soft |
| attribution.configure_window | sdk.initialize | fraud_rules, configure_rules | soft |
| attribution.configure_rules | configure_window | - | optional |
| attribution.fraud_rules | configure_window | - | optional |
| integration.connect_channel | sdk.initialize | tracking_link, cost | hard |
| integration.create_tracking_link | connect_channel | test_attribution | hard |
| integration.cost_integration | connect_channel | - | optional |
| verification.test_deeplink | configure_deeplink | test_attribution | hard |
| verification.test_attribution | test_deeplink AND tracking_link | verify_data | hard |
| verification.verify_data | test_attribution | onboarding.complete | hard |

---

## 🎮 대화 예시

### Scenario 1: 처음 시작하는 사용자

```
👤 User: \"Airbridge 처음 써보는데 어떻게 시작해?\"

🤖 AI: \"안녕하세요! Airbridge 온보딩을 도와드릴게요. 🚀

먼저 앱을 등록하는 것부터 시작할게요. 
다음 정보가 필요해요:

1️⃣ **조직**: 기존 조직에 추가하시겠어요, 새로 만드시겠어요?
2️⃣ **앱 모드**: Production(실제 서비스) / Development(테스트)
3️⃣ **앱 이름**: SDK와 트래킹 링크에 사용될 고유 이름

어떤 조직에 앱을 추가하시겠어요?\"
```

### Scenario 2: Dependency Blocking

```
👤 User: \"트래킹 링크 만들어줘\"

🤖 AI: ⚠️ 트래킹 링크를 생성하려면 먼저 광고 채널 연동이 완료되어야 해요.

📋 현재 상태:
├── ✅ 앱 생성
├── ✅ SDK 설치
├── ✅ SDK 초기화
├── ⬜ 광고 채널 연동 ← 필요
└── ⬜ 트래킹 링크 생성

어떤 광고 채널을 먼저 연동하시겠어요?
- Meta Ads (Facebook/Instagram)
- Google Ads
- Apple Search Ads
- TikTok For Business
```

### Scenario 3: 진행 상황 확인

```
👤 User: \"지금 온보딩 얼마나 했어?\"

🤖 AI: 📊 **myshoppingapp 온보딩 현황**

✅ **완료됨 (6/15)**
├── 앱 생성
├── 타임존 설정 (Asia/Seoul)
├── 통화 설정 (KRW)
├── 스토어 URL 등록
├── Android SDK 설치
└── iOS SDK 설치

🔄 **진행 중**
└── 딥링크 설정

⬜ **남은 작업 (8개)**
├── SDK 테스트
├── 어트리뷰션 윈도우 설정
├── 프로드 규칙 설정
├── 광고 채널 연동
├── 트래킹 링크 생성
├── 딥링크 테스트
├── 어트리뷰션 테스트
└── 데이터 수집 확인

━━━━━━━━━━━━━━━━━━━━
📈 진행률: **40%**
━━━━━━━━━━━━━━━━━━━━

⏭️ **다음 추천:** 딥링크 설정을 완료하고 테스트를 진행해볼까요?
```

---

## 🛠️ 활용 방법

### 1. Claude Skills로 사용 시
이 마크다운 파일을 `.claude/` 디렉토리에 저장하면 Claude가 해당 컨텍스트를 참조하여 온보딩 가이드를 제공할 수 있습니다.

### 2. Vibe Coding 시
- JSON 스키마를 그대로 복사하여 모듈 정의 코드로 사용
- Dependency Matrix를 기반으로 상태 관리 로직 구현
- Prerequisite Check Logic을 실제 코드에 적용

### 3. AI Agent 구현 시
- `intents` 배열을 Intent Classification 학습 데이터로 활용
- `prerequisites`와 `unlocks`를 그래프 구조로 변환하여 라우팅 로직 구현
- `guide_link`를 RAG(Retrieval-Augmented Generation)의 소스로 활용

---

위 내용이 이전에 생성된 문서의 전체 내용입니다! 🎉
