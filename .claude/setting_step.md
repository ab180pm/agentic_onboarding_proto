  Essential (초보 기능)

  완료 시 활용 가능:
  - 딥링크 기본 동작 (앱 열기)
  - 앱 설치/오픈 이벤트 확인
  - Real-time Log에서 데이터 확인

  필요한 세팅:
  | 항목        | 설명                         |
  |-------------|------------------------------|
  | 앱 등록     | App Name, Timezone, Currency |
  | SDK 설치    | 기본 초기화만                |
  | URI Scheme  | 기본 딥링크 설정             |
  | 기본 이벤트 | Install, Open 자동 수집      |

  ---
  Basic (중간급 기능)

  완료 시 활용 가능:
  - 어트리뷰션 측정 (어디서 유입됐는지)
  - Actuals/Trend 리포트 조회
  - 광고 채널 성과 비교
  - Deferred Deep Link (설치 후 목적지 이동)
  - 기본 전환 이벤트 트래킹

  필요한 세팅:
  | 항목                        | 설명                       |
  |-----------------------------|----------------------------|
  | 디바이스 식별자             | GAID (Android), IDFA (iOS) |
  | ATT 프롬프트                | iOS 14.5+ 필수             |
  | Universal Links / App Links | 고급 딥링크                |
  | Standard Events             | Sign Up, Purchase 등       |
  | 광고 채널 연동              | 최소 1개 (Meta, Google 등) |
  | 트래킹 링크                 | 캠페인별 링크 생성         |

  ---
  Expert (고급 기능)

  완료 시 활용 가능:
  - Cohort 분석 (리텐션, LTV)
  - Raw Data Export (커스텀 분석)
  - 멀티 채널 비용 최적화
  - SKAN 리포트 (iOS)
  - 크로스 플랫폼 어트리뷰션 (Web → App)
  - 오디언스 세그멘테이션
  - 고급 포스트백 설정

  필요한 세팅:
  | 항목                | 설명                    |
  |---------------------|-------------------------|
  | Custom Events       | 비즈니스 맞춤 이벤트    |
  | Semantic Attributes | 이벤트 프로퍼티 표준화  |
  | Cost Integration    | 광고 비용 데이터 연동   |
  | 다중 채널 연동      | 모든 광고 채널 통합     |
  | Web SDK             | 웹-앱 연동              |
  | S2S Integration     | 서버 이벤트 전송        |
  | SKAN 설정           | Conversion Value 매핑   |
  | Postback 설정       | 채널별 전환 데이터 전송 |

  ---
  요약 매트릭스

  | 기능                 | Essential | Basic | Expert |
  |----------------------|-----------|-------|--------|
  | 딥링크 (기본)        |    ✅     |  ✅   |   ✅   |
  | Real-time Log        |    ✅     |  ✅   |   ✅   |
  | Deferred Deep Link   |     -     |  ✅   |   ✅   |
  | 어트리뷰션           |     -     |  ✅   |   ✅   |
  | Actuals/Trend Report |     -     |  ✅   |   ✅   |
  | 광고 채널 비교       |     -     |  ✅   |   ✅   |
  | Cohort 분석          |     -     |   -   |   ✅   |
  | Raw Data Export      |     -     |   -   |   ✅   |
  | 비용 최적화          |     -     |   -   |   ✅   |
  | SKAN Report          |     -     |   -   |   ✅   |
  | 크로스 플랫폼        |     -     |   -   |   ✅   |
