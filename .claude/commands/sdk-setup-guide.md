# Airbridge SDK 연동 개발 가이드
## 단계별 구현 내용 모듈화

---

# 1단계: 대시보드 설정

## 1.1 Token 확인

### 위치
- Airbridge Dashboard > Settings > Tokens

### 확인해야 할 값
| 항목 | 용도 | 사용 SDK |
|------|------|----------|
| App Name | SDK 초기화 시 사용 | 전체 |
| App SDK Token | SDK 초기화 시 사용 | Android, iOS, Cross-Platform |
| Web SDK Token | Web SDK 초기화 시 사용 | Web |

---

## 1.2 딥링크 정보 등록

### 위치
- Airbridge Dashboard > Tracking Link > Deep Links

### iOS 등록 정보

| 필드 | 입력값 | 예시 | 설명 |
|------|--------|------|------|
| iOS URI Scheme | `scheme://` 포함 | `myapp://` | Airbridge Deep Link → Scheme Deep Link 변환에 사용 |
| iOS App ID | `AppIDPrefix.BundleID` | `ABC123DEF.com.company.app` | Universal Link 도메인 설정에 사용 |

#### iOS App ID 찾는 방법
1. Apple Developer Dashboard 접속
2. Certificates, Identifiers & Profiles > Identifiers 이동
3. 앱 선택 후 App ID Prefix와 Bundle ID 확인
4. 형식: `{App ID Prefix}.{Bundle ID}`

### Android 등록 정보

| 필드 | 입력값 | 예시 | 설명 |
|------|--------|------|------|
| Android URI Scheme | `scheme://` 포함 | `myapp://` | App Link 및 URI Scheme에 사용 |
| Package Name | 앱 패키지명 | `com.company.app` | App Link 및 URI Scheme에 사용 |
| sha256_cert_fingerprints | SHA256 인증서 지문 | `B5:EF:4D:...` | App Link 도메인 검증에 사용 |

#### SHA256 Fingerprint 찾는 방법
```bash
keytool -list -v -keystore YOUR_KEYSTORE.keystore
```

출력 예시:
```
Certificate fingerprints:
    MD5:  4C:65:04:52:F0:3F:F8:65:08:D3:71:86:FC:EF:C3:49
    SHA1: C8:BF:B7:B8:94:EA:5D:9D:38:59:FE:99:63:ED:47:B2:D9:5A:4E:CC
    SHA256: B5:EF:4D:F9:DC:95:E6:9B:F3:9A:5E:E9:D6:E0:D8:F6:7B:AB:79:C8:78:67:34:D9:A7:01:AB:6A:86:01:0E:99
```

> ⚠️ Production/Development 앱은 서로 다른 정보를 등록해야 함

---

# 2단계: SDK 설치

## 2.1 Android SDK 설치

### 방법 1: Gradle (권장)

**settings.gradle.kts (Project)**
```kotlin
dependencyResolutionManagement {
    repositories {
        maven { url = uri("https://sdk-download.airbridge.io/maven") }
    }
}
```

**build.gradle.kts (App)**
```kotlin
dependencies {
    // 일반 SDK
    implementation("io.airbridge:sdk-android:4.+")
    
    // 또는 Restricted SDK (GAID 미수집)
    // implementation("io.airbridge:sdk-android-restricted:4.+")
}
```

### 방법 2: Manual (.aar)
- SDK 다운로드 후 프로젝트에 직접 추가

---

## 2.2 iOS SDK 설치

### 방법 1: Swift Package Manager (권장)
```
https://github.com/ab180/airbridge-ios-sdk-deploy
// 또는 Restricted: https://github.com/ab180/airbridge-ios-sdk-deploy-restricted
```

### 방법 2: CocoaPods
**Podfile**
```ruby
# 일반 SDK
pod 'Airbridge', '4.0.0'

# 또는 Restricted SDK (IDFA 미수집)
# pod 'Airbridge-Restricted', '4.0.0'
```

### 방법 3: Tuist
**Package.swift**
```swift
.remote(url: "https://github.com/nicklockwood/SwiftFormat", requirement: .branch("4"))
```

---

## 2.3 Web SDK 설치

### 방법 1: Script 태그 (Browser)
```html
<script>
(function(a_,i_,r_,b_,r,i,d,g,e){if(!a_[b_]||!a_[b_].queue){r=a_[b_]={queue:[]};i=['init','setDownloads','setDeeplinks','sendSMS','sendWeb','setUserID','setUserEmail','setUserPhone','setUserAlias','setUserAttribute','setUserAttributes','clearUserAttributes','clearUser','events','startTracking','stopTracking','fetchResource'];d=0;for(;i.length>d;d++){g=i[d];r[g]=r[g]||(function(n){return function(){r.queue.push([n,arguments])}})(g)}}e=i_.createElement('script');e.async=1;e.src='https://static.airbridge.io/sdk/latest/airbridge.min.js';i_.head.appendChild(e)
})(window,document,'airbridge','Airbridge');
</script>
```

### 방법 2: npm
```bash
npm install airbridge-web-sdk-loader
# 또는
yarn add airbridge-web-sdk-loader
# 또는
pnpm install airbridge-web-sdk-loader
```

```javascript
import Airbridge from 'airbridge-web-sdk-loader';
```

---

## 2.4 React Native SDK 설치

```bash
# 일반 SDK
npm install airbridge-react-native-sdk

# 또는 Restricted SDK
npm install airbridge-react-native-sdk-restricted

# iOS 의존성 설치
cd ios && pod install
```

---

## 2.5 Flutter SDK 설치

**pubspec.yaml**
```yaml
dependencies:
  # 일반 SDK
  airbridge_flutter_sdk: 4.+
  
  # 또는 Restricted SDK
  # airbridge_flutter_sdk_restricted: 4.+
```

```bash
flutter pub get
```

---

## 2.6 Cordova/Ionic SDK 설치

```bash
# Cordova
cordova plugin add airbridge-cordova-sdk

# Ionic
ionic cordova plugin add airbridge-cordova-sdk
```

---

## 2.7 Unity SDK 설치

1. [Airbridge Unity SDK](https://sdk-download.airbridge.io/unity/index.html?latest) 다운로드
   - Restricted: [Restricted Unity SDK](https://sdk-download.airbridge.io/unity/index.html?latest-restricted)
2. Unity에서 Assets > Import Package > Custom Package
3. 패키지 추가 후 상단 메뉴바에 [Airbridge] 탭 생성됨

---

## 2.8 Expo SDK 설치

```bash
npm install --save airbridge-expo-sdk
npm install --save airbridge-react-native-sdk
```

---

## 2.9 Unreal SDK 설치

1. [Airbridge Unreal SDK](https://sdk-download.airbridge.io/unreal/index.html?latest) 다운로드
2. 프로젝트 루트에 `Plugins` 폴더 생성
3. SDK 배치:
```
<YOUR_UE_PROJECT>
  ├── Plugins
          └── AirbridgeUnrealSDK
              ├── Resources
              ├── Source
              └── AirbridgeUnrealSDK.uplugin
```

4. **Build.cs**에 의존성 추가:
```csharp
PublicDependencyModuleNames.AddRange(new string[] { "AirbridgeUnreal" });
```

5. Settings > Plugins에서 Airbridge Unreal SDK 활성화

---

# 3단계: SDK 초기화

## 3.1 Android 초기화

### Application Class 생성/수정

**MainApplication.kt**
```kotlin
import co.ab180.airbridge.Airbridge
import co.ab180.airbridge.AirbridgeOptionBuilder

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        val option = AirbridgeOptionBuilder("YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
            .build()
        Airbridge.initializeSDK(this, option)
    }
}
```

**MainApplication.java**
```java
import co.ab180.airbridge.Airbridge;
import co.ab180.airbridge.AirbridgeOptionBuilder;

public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        
        AirbridgeOptionBuilder builder = new AirbridgeOptionBuilder("YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN");
        AirbridgeOption option = builder.build();
        Airbridge.initializeSDK(this, option);
    }
}
```

### AndroidManifest.xml에 Application 등록
```xml
<application
    android:name=".MainApplication"
    ...>
```

---

## 3.2 iOS 초기화

### AppDelegate (UIKit)

**Swift**
```swift
import Airbridge

func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
        .build()
    Airbridge.initializeSDK(option: option)
    return true
}
```

**Objective-C**
```objc
#import <Airbridge/Airbridge.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    AirbridgeOptionBuilder* builder = [[AirbridgeOptionBuilder alloc] initWithName:@"YOUR_APP_NAME"
                                                                             token:@"YOUR_APP_SDK_TOKEN"];
    AirbridgeOption* option = [builder build];
    [Airbridge initializeSDKWithOption:option];
    return YES;
}
```

### SwiftUI App

```swift
import SwiftUI
import Airbridge

@main
struct MyApp: App {
    init() {
        let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
            .build()
        Airbridge.initializeSDK(option: option)
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

---

## 3.3 Web 초기화

```javascript
airbridge.init({
    app: 'YOUR_APP_NAME',
    webToken: 'YOUR_WEB_SDK_TOKEN',
    // 선택적 옵션
    utmParsing: false,           // UTM 파라미터 파싱 (기본: false)
    userHash: true,              // 이메일/전화 SHA256 해싱 (기본: true)
    cookieWindow: 3,             // 쿠키 유효기간 (일) (기본: 3)
    cookieWindowInMinutes: 4320, // 쿠키 유효기간 (분)
    useProtectedAttributionWindow: true,  // 보호된 어트리뷰션 윈도우 (기본: true)
    protectedAttributionWindowInMinutes: 30,  // 보호된 어트리뷰션 윈도우 (분) (기본: 30)
    shareCookieSubdomain: true,  // 서브도메인 쿠키 공유 (기본: true)
});
```

---

## 3.4 React Native 초기화

### iOS (AppDelegate.m)

**Swift**
```swift
import AirbridgeReactNative

func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    AirbridgeReactNative.initializeSDK(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    return true
}
```

**Objective-C**
```objc
#import <AirbridgeReactNative/AirbridgeReactNative.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [AirbridgeReactNative initializeSDKWithName:@"YOUR_APP_NAME" token:@"YOUR_APP_SDK_TOKEN"];
    return YES;
}
```

### Android (MainApplication.kt)

**Kotlin**
```kotlin
import co.ab180.airbridge.reactnative.AirbridgeReactNative

override fun onCreate() {
    super.onCreate()
    AirbridgeReactNative.initializeSDK(this, "YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
}
```

**Java**
```java
import co.ab180.airbridge.reactnative.AirbridgeReactNative;

@Override
public void onCreate() {
    super.onCreate();
    AirbridgeReactNative.initializeSDK(this, "YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN");
}
```

---

## 3.5 Flutter 초기화

### iOS (AppDelegate.swift)

**Swift**
```swift
import airbridge_flutter_sdk

override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    AirbridgeFlutter.initializeSDK(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

**Objective-C**
```objc
#import <airbridge_flutter_sdk/AirbridgeFlutter.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [AirbridgeFlutter initializeSDKWithName:@"YOUR_APP_NAME" token:@"YOUR_APP_SDK_TOKEN"];
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
```

### Android (MainApplication.kt)

**Kotlin**
```kotlin
import co.ab180.airbridge.flutter.AirbridgeFlutter
import android.app.Application

class MainApplication: Application() {
    override fun onCreate() {
        super.onCreate()
        AirbridgeFlutter.initializeSDK(this, "YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
    }
}
```

**Java**
```java
import co.ab180.airbridge.flutter.AirbridgeFlutter;
import android.app.Application;

public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        AirbridgeFlutter.initializeSDK(this, "YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN");
    }
}
```

### AndroidManifest.xml
```xml
<application
    android:name=".MainApplication"
    ...>
```

---

## 3.6 Cordova/Ionic 초기화

### iOS (AppDelegate.m)

**Swift**
```swift
func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    AirbridgeCordova.initializeSDK(name: "YOUR_APP_NAME", token: "YOUR_APP_TOKEN")
    return true
}
```

**Objective-C**
```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [AirbridgeCordova initializeSDKWithName:@"YOUR_APP_NAME" token:@"YOUR_APP_TOKEN"];
    return YES;
}
```

### Android (MainApplication.java)

**Kotlin**
```kotlin
import co.ab180.airbridge.cordova.AirbridgeCordova

override fun onCreate() {
    super.onCreate()
    AirbridgeCordova.initializeSDK(this, "YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
}
```

**Java**
```java
import co.ab180.airbridge.cordova.AirbridgeCordova;

@Override
public void onCreate() {
    super.onCreate();
    AirbridgeCordova.initializeSDK(this, "YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN");
}
```

---

## 3.7 Unity 초기화

1. Unity 상단 메뉴 > Airbridge > Airbridge Settings
2. App Name, App Token 입력
3. Set as Default 클릭

---

## 3.8 Expo 초기화

**app.json**
```json
{
  "expo": {
    "plugins": [
      [
        "airbridge-expo-sdk",
        {
          "appName": "YOUR_APP_NAME",
          "appToken": "YOUR_APP_TOKEN"
        }
      ]
    ]
  }
}
```

---

## 3.9 Unreal 초기화

1. Project Settings > Plugins > Airbridge Unreal SDK
2. App Name, App Token 입력
3. Set as Default 클릭

---

# 4단계: SDK 설정 파일 (Cross-Platform)

## 4.1 airbridge.json 구조

React Native, Flutter, Cordova, Expo에서 사용하는 공통 설정 파일입니다.
프로젝트 루트 디렉토리에 `airbridge.json` 파일을 생성합니다.

```json
{
    "sdkEnabled": true,
    "logLevel": "debug",
    "autoStartTrackingEnabled": true,
    "autoDetermineTrackingAuthorizationTimeoutInSecond": 30,
    "trackMetaDeferredAppLinkEnabled": false,
    "sessionTimeoutInSecond": 300,
    "metaInstallReferrerAppID": "",
    "trackAirbridgeDeeplinkOnlyEnabled": false,
    "trackInSessionLifecycleEventEnabled": false,
    "trackingLinkCustomDomains": [],
    "hashUserInformationEnabled": true,
    "sdkSignatureID": "",
    "sdkSignatureSecret": "",
    "clearEventBufferOnInitializeEnabled": false,
    "eventBufferCountLimit": 2147483647,
    "eventBufferSizeLimitInGibibyte": 1024,
    "eventTransmitIntervalInSecond": 0,
    "isHandleAirbridgeDeeplinkOnly": false,
    "collectTCFDataEnabled": false,
    "trackingBlocklist": [],
    "calculateSKAdNetworkByServerEnabled": false
}
```

## 4.2 설정값 상세 설명

| 키 | 타입 | 기본값 | 설명 |
|----|------|--------|------|
| `sdkEnabled` | boolean | true | SDK 활성화 여부 |
| `logLevel` | string | - | 로그 레벨: debug, info, warning, error, fault |
| `autoStartTrackingEnabled` | boolean | true | 자동 트래킹 시작 여부 (Opt-in/out용) |
| `autoDetermineTrackingAuthorizationTimeoutInSecond` | number | 30 | ATT 응답 대기 시간 (초), 최대 3600 |
| `trackMetaDeferredAppLinkEnabled` | boolean | false | Meta Deferred App Link 수집 |
| `sessionTimeoutInSecond` | number | 300 | 세션 타임아웃 (초), 최대 604800 (7일) |
| `metaInstallReferrerAppID` | string | - | Meta Install Referrer용 Facebook App ID |
| `trackAirbridgeDeeplinkOnlyEnabled` | boolean | false | Airbridge 딥링크만 추적할지 |
| `trackInSessionLifecycleEventEnabled` | boolean | false | 세션 중 라이프사이클 이벤트 수집 |
| `trackingLinkCustomDomains` | array | [] | 커스텀 도메인 목록 (FQDN) |
| `hashUserInformationEnabled` | boolean | true | 사용자 정보 SHA256 해싱 |
| `sdkSignatureID` | string | - | SDK Signature Secret ID |
| `sdkSignatureSecret` | string | - | SDK Signature Secret |
| `clearEventBufferOnInitializeEnabled` | boolean | false | 초기화 시 미전송 이벤트 삭제 |
| `eventBufferCountLimit` | number | INT_MAX | 이벤트 버퍼 개수 제한 |
| `eventBufferSizeLimitInGibibyte` | number | 1024 | 이벤트 버퍼 크기 제한 (GiB) |
| `eventTransmitIntervalInSecond` | number | 0 | 이벤트 전송 간격 (초), 최대 86400 |
| `isHandleAirbridgeDeeplinkOnly` | boolean | false | Airbridge 딥링크만 콜백에 전달 |
| `collectTCFDataEnabled` | boolean | false | Google DMA TCF 데이터 수집 |
| `trackingBlocklist` | array | [] | 수집 제외 식별자 목록 |
| `calculateSKAdNetworkByServerEnabled` | boolean | false | 서버에서 SKAdNetwork CV 계산 |

---

# 5단계: 플랫폼별 필수 설정

## 5.1 Android - Backup Rules 설정 (필수)

### Android 12+ (API 31+)

**AndroidManifest.xml**
```xml
<application
    android:dataExtractionRules="@xml/data_extraction_rules"
    ...>
```

**res/xml/data_extraction_rules.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="sharedpref" path="airbridge-internal" />
        <exclude domain="sharedpref" path="airbridge-install" />
        <exclude domain="sharedpref" path="airbridge-user-info" />
        <exclude domain="sharedpref" path="airbridge-user-alias" />
        <exclude domain="sharedpref" path="airbridge-user-attributes" />
        <exclude domain="sharedpref" path="airbridge-device-alias" />
        <exclude domain="database" path="airbridge.db" />
    </cloud-backup>
    <device-transfer>
        <exclude domain="sharedpref" path="airbridge-internal" />
        <exclude domain="sharedpref" path="airbridge-install" />
        <exclude domain="sharedpref" path="airbridge-user-info" />
        <exclude domain="sharedpref" path="airbridge-user-alias" />
        <exclude domain="sharedpref" path="airbridge-user-attributes" />
        <exclude domain="sharedpref" path="airbridge-device-alias" />
        <exclude domain="database" path="airbridge.db" />
    </device-transfer>
</data-extraction-rules>
```

### Android 11 이하

**AndroidManifest.xml**
```xml
<application
    android:fullBackupContent="@xml/backup_rules"
    ...>
```

**res/xml/backup_rules.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <exclude domain="sharedpref" path="airbridge-internal.xml" />
    <exclude domain="sharedpref" path="airbridge-install.xml" />
    <exclude domain="sharedpref" path="airbridge-user-info.xml" />
    <exclude domain="sharedpref" path="airbridge-user-alias.xml" />
    <exclude domain="sharedpref" path="airbridge-user-attributes.xml" />
    <exclude domain="sharedpref" path="airbridge-device-alias.xml" />
    <exclude domain="database" path="airbridge.db" />
</full-backup-content>
```

### 두 버전 모두 지원

**AndroidManifest.xml**
```xml
<application
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:fullBackupContent="@xml/backup_rules"
    ...>
```

---

## 5.2 Android - 권한 설정

**AndroidManifest.xml**
```xml
<!-- 필수 -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- API 33+ GAID 수집용 (선택) -->
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

---

## 5.3 iOS - ATT Prompt 설정 (필수)

### Info.plist
```xml
<key>NSUserTrackingUsageDescription</key>
<string>앱 사용 경험 개선 및 맞춤형 광고 제공을 위해 사용자 활동을 추적합니다.</string>
```

### ATT 프롬프트 표시
```swift
import AppTrackingTransparency

ATTrackingManager.requestTrackingAuthorization { status in
    switch status {
    case .authorized:
        print("Tracking authorized")
    case .denied:
        print("Tracking denied")
    case .notDetermined:
        print("Tracking not determined")
    case .restricted:
        print("Tracking restricted")
    @unknown default:
        break
    }
}
```

### SDK에서 ATT 타임아웃 설정

**Swift (Native)**
```swift
let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    .setAutoDetermineTrackingAuthorizationTimeout(second: 30)  // 기본 30초, 최대 3600초
    .build()
```

**airbridge.json (Cross-Platform)**
```json
{
    "autoDetermineTrackingAuthorizationTimeoutInSecond": 30
}
```

---

## 5.4 iOS - Framework 추가 (선택)

Xcode에서 다음 프레임워크를 추가합니다 (모두 Optional Status):

| Framework | 용도 |
|-----------|------|
| AdSupport | IDFA 수집 |
| CoreTelephony | 통신사 정보 수집 |
| StoreKit | SKAdNetwork |
| AppTrackingTransparency | ATT 프롬프트 |
| AdServices | Apple Search Ads 어트리뷰션 |
| WebKit | WKWebView 지원 |

---

# 6단계: 딥링크 설정

## 6.1 iOS 딥링크 설정

### URL Types (URI Scheme)

**Xcode > Project > Info > URL Types**
- URL Schemes: `yourscheme` (://  제외)
- Identifier: `com.yourcompany.app`
- Role: Editor

### Associated Domains (Universal Links)

**Xcode > Project > Signing & Capabilities > Associated Domains**
```
applinks:YOUR_APP_NAME.airbridge.io
applinks:YOUR_APP_NAME.abr.ge
```

> ⚠️ Password AutoFill 사용 시 webcredentials도 추가 필요

---

## 6.2 Android 딥링크 설정

**AndroidManifest.xml**
```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    ...>
    
    <!-- URI Scheme (별도 intent-filter) -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="yourscheme" />
    </intent-filter>
    
    <!-- App Links - abr.ge (별도 intent-filter) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="http" android:host="YOUR_APP_NAME.abr.ge" />
        <data android:scheme="https" android:host="YOUR_APP_NAME.abr.ge" />
    </intent-filter>
    
    <!-- App Links - airbridge.io (별도 intent-filter) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="http" android:host="YOUR_APP_NAME.airbridge.io" />
        <data android:scheme="https" android:host="YOUR_APP_NAME.airbridge.io" />
    </intent-filter>
</activity>
```

> ⚠️ 모든 `<intent-filter>`는 반드시 분리해서 작성해야 함

---

## 6.3 Expo 딥링크 설정

**app.json**
```json
{
  "expo": {
    "scheme": "yourscheme",
    "android": {
      "intentFilters": [
        {
          "autoVerify": true,
          "action": "VIEW",
          "data": { "scheme": "https", "host": "YOUR_APP_NAME.airbridge.io" },
          "category": ["BROWSABLE", "DEFAULT"]
        },
        {
          "autoVerify": true,
          "action": "VIEW",
          "data": { "scheme": "https", "host": "YOUR_APP_NAME.abr.ge" },
          "category": ["BROWSABLE", "DEFAULT"]
        },
        {
          "autoVerify": true,
          "action": "VIEW",
          "data": { "scheme": "http", "host": "YOUR_APP_NAME.airbridge.io" },
          "category": ["BROWSABLE", "DEFAULT"]
        },
        {
          "autoVerify": true,
          "action": "VIEW",
          "data": { "scheme": "http", "host": "YOUR_APP_NAME.abr.ge" },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": [
        "applinks:YOUR_APP_NAME.airbridge.io",
        "applinks:YOUR_APP_NAME.abr.ge"
      ]
    }
  }
}
```

---

## 6.4 Unity 딥링크 설정

1. Airbridge > Airbridge Settings
2. iOS URI Scheme 입력
3. Android URI Scheme 입력
4. App Name이 자동으로 App Links 도메인 설정에 사용됨

---

## 6.5 Unreal 딥링크 설정

1. Project Settings > Plugins > Airbridge Unreal SDK
2. iOS URI Scheme 입력
3. Android URI Scheme 입력

### iOS 추가 설정 (Xcode)
```
Signing & Capabilities > Associated Domains 추가:
- applinks:YOUR_APP_NAME.airbridge.io
- applinks:YOUR_APP_NAME.abr.ge
```

---

# 7단계: 딥링크 이벤트 수집 및 처리

## 7.1 Android 딥링크 처리

**MainActivity.kt**
```kotlin
import co.ab180.airbridge.Airbridge

override fun onResume() {
    super.onResume()
    // 딥링크 이벤트 수집
    Airbridge.trackDeeplink(intent)
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
}

// 딥링크 처리 콜백 설정 (onCreate에서)
Airbridge.handleDeeplink(intent) { uri ->
    // uri를 사용하여 적절한 화면으로 이동
    navigateToContent(uri)
}
```

---

## 7.2 iOS 딥링크 처리

### SceneDelegate (iOS 13+)

**Swift**
```swift
import Airbridge

// Scene 시작 시 (Cold Start)
func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    // Universal Link
    if let userActivity = connectionOptions.userActivities.first {
        Airbridge.trackDeeplink(userActivity: userActivity)
        Airbridge.handleDeeplink(userActivity: userActivity) { url in
            // url을 사용하여 적절한 화면으로 이동
        }
    }
    
    // URI Scheme
    if let url = connectionOptions.urlContexts.first?.url {
        Airbridge.trackDeeplink(url: url)
        Airbridge.handleDeeplink(url: url) { url in
            // url을 사용하여 적절한 화면으로 이동
        }
    }
}

// URI Scheme (Warm Start)
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    Airbridge.trackDeeplink(url: url)
    Airbridge.handleDeeplink(url: url) { url in
        // url을 사용하여 적절한 화면으로 이동
    }
}

// Universal Link (Warm Start)
func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    Airbridge.trackDeeplink(userActivity: userActivity)
    Airbridge.handleDeeplink(userActivity: userActivity) { url in
        // url을 사용하여 적절한 화면으로 이동
    }
}
```

### AppDelegate (iOS 12 이하 또는 SceneDelegate 미사용)

**Swift**
```swift
import Airbridge

// URI Scheme
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    Airbridge.trackDeeplink(url: url)
    Airbridge.handleDeeplink(url: url) { url in
        // url을 사용하여 적절한 화면으로 이동
    }
    return true
}

// Universal Link
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    Airbridge.trackDeeplink(userActivity: userActivity)
    Airbridge.handleDeeplink(userActivity: userActivity) { url in
        // url을 사용하여 적절한 화면으로 이동
    }
    return true
}
```

### SwiftUI

```swift
import SwiftUI
import Airbridge

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    Airbridge.trackDeeplink(url: url)
                    Airbridge.handleDeeplink(url: url) { url in
                        // url을 사용하여 적절한 화면으로 이동
                    }
                }
        }
    }
}
```

> ⚠️ **중요**: `trackDeeplink()`는 반드시 `handleDeeplink()` 이전에 호출해야 함

---

## 7.3 React Native 딥링크 처리

### iOS (AppDelegate.m)

**Swift**
```swift
import AirbridgeReactNative

// URI Scheme
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    AirbridgeReactNative.trackDeeplink(url: url)
    return true
}

// Universal Link
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    AirbridgeReactNative.trackDeeplink(userActivity: userActivity)
    return true
}
```

### Android (MainActivity.kt)

**Kotlin**
```kotlin
import co.ab180.airbridge.reactnative.AirbridgeReactNative

override fun onResume() {
    super.onResume()
    AirbridgeReactNative.trackDeeplink(intent)
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
}
```

### JavaScript/TypeScript

```javascript
import { Airbridge } from 'airbridge-react-native-sdk';

Airbridge.setOnDeeplinkReceived((url) => {
    // url을 사용하여 적절한 화면으로 이동
    console.log('Deeplink received:', url);
});
```

---

## 7.4 Flutter 딥링크 처리

### iOS (AppDelegate.swift)

**Swift**
```swift
import airbridge_flutter_sdk

// URI Scheme
override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    AirbridgeFlutter.trackDeeplink(url: url)
    return true
}

// Universal Link
override func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    AirbridgeFlutter.trackDeeplink(userActivity: userActivity)
    return true
}
```

### Android (MainActivity.kt)

**Kotlin**
```kotlin
import co.ab180.airbridge.flutter.AirbridgeFlutter
import android.content.Intent

override fun onResume() {
    super.onResume()
    AirbridgeFlutter.trackDeeplink(intent)
}

override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
}
```

### Dart

```dart
import 'package:airbridge_flutter_sdk/airbridge_flutter_sdk.dart';

Airbridge.setOnDeeplinkReceived((deeplink) {
    // deeplink를 사용하여 적절한 화면으로 이동
    print('Deeplink received: $deeplink');
});
```

### Flutter v3.7+ 추가 설정

**Android (AndroidManifest.xml)**
```xml
<meta-data 
    android:name="flutter_deeplinking_enabled" 
    android:value="false" />
```

**iOS (Info.plist)**
- `FlutterDeepLinkingEnabled` 키 삭제

---

## 7.5 Unity 딥링크 처리

딥링크 수집은 자동으로 처리됨. 커스텀 AppDelegate/Activity 사용 시 수동 설정 필요.

### iOS 커스텀 AppDelegate

**AUAppDelegate.mm**
```objc
#import "AirbridgeUnity.h"

- (void)onOpenURL:(NSNotification *)notification {
    NSURL* url = notification.userInfo[@"url"];
    [Airbridge trackDeeplinkWithUrl:url];
    
    if (AirbridgeUnity.sharedInstance.deeplinkOnReceived == nil) { return; }
    AirbridgeUnity.sharedInstance.deeplinkOnReceived(url.absoluteString);
}

- (void)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>>*))restorationHandler {
    [Airbridge trackDeeplinkWithUserActivity:userActivity];
    
    if (AirbridgeUnity.sharedInstance.deeplinkOnReceived == nil) { return; }
    AirbridgeUnity.sharedInstance.deeplinkOnReceived(userActivity.webpageURL.absoluteString);
}
```

### Android 커스텀 Activity

**Kotlin**
```kotlin
import co.ab180.airbridge.unity.AirbridgeUnity

override fun onResume() {
    super.onResume()
    AirbridgeUnity.processHandleDeeplink(intent)
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
}
```

### C# 콜백

```csharp
Airbridge.SetOnDeeplinkReceived((string deeplink) => {
    // deeplink를 사용하여 적절한 화면으로 이동
    Debug.Log("Deeplink received: " + deeplink);
});
```

---

## 7.6 Unreal 딥링크 처리

### GameModeBase에서 콜백 설정

**ExampleGameModeBase.cpp**
```cpp
#include "AirbridgeUnreal.h"

void AExampleGameModeBase::BeginPlay() {
    Super::BeginPlay();
    
    FAirbridge::SetOnDeeplinkReceived([](const FString& Url) {
        // Url을 사용하여 적절한 화면으로 이동
        UE_LOG(LogTemp, Log, TEXT("Deeplink received: %s"), *Url);
    });
}
```

### Project Settings
- Maps & Modes > Default Modes > Default GameMode를 위 GameMode로 설정

---

# 8단계: Deferred Deeplink 설정

## 8.1 자동 처리

모든 SDK에서 Deferred Deeplink는 일반 딥링크 콜백(`setOnDeeplinkReceived` 등)으로 자동 전달됩니다.
별도의 추가 설정이 필요 없습니다.

## 8.2 Deferred Deeplink 수집 조건

| 조건 | 설명 |
|------|------|
| Opt-in 미설정 | 또는 `startTracking()` 호출됨 |
| iOS ATT 응답 완료 | 또는 ATT 타임아웃 만료 |

## 8.3 Native SDK 직접 호출 (선택)

### Android

```kotlin
Airbridge.handleDeferredDeeplink { uri ->
    if (uri != null) {
        // Deferred deeplink 처리
    }
}
```

### iOS

```swift
Airbridge.handleDeferredDeeplink { url in
    if let url = url {
        // Deferred deeplink 처리
    }
}
```

---

# 9단계: 이벤트 트래킹

## 9.1 Standard Events 목록

| Category 상수 | 이벤트명 | 설명 |
|--------------|----------|------|
| `SIGN_UP` | airbridge.user.signup | 회원가입 |
| `SIGN_IN` | airbridge.user.signin | 로그인 |
| `SIGN_OUT` | airbridge.user.signout | 로그아웃 |
| `HOME_VIEWED` | airbridge.ecommerce.home.viewed | 홈 화면 조회 |
| `PRODUCT_LIST_VIEWED` | airbridge.ecommerce.productList.viewed | 상품 목록 조회 |
| `SEARCH_RESULTS_VIEWED` | airbridge.ecommerce.searchResults.viewed | 검색 결과 조회 |
| `PRODUCT_VIEWED` | airbridge.ecommerce.product.viewed | 상품 상세 조회 |
| `ADD_PAYMENT_INFO` | airbridge.addPaymentInfo | 결제 정보 추가 |
| `ADD_TO_WISHLIST` | airbridge.addToWishlist | 위시리스트 추가 |
| `ADDED_TO_CART` | airbridge.ecommerce.product.addedToCart | 장바구니 추가 |
| `INITIATE_CHECKOUT` | airbridge.initiateCheckout | 결제 시작 |
| `ORDER_COMPLETED` | airbridge.ecommerce.order.completed | 주문 완료 |
| `ORDER_CANCELED` | airbridge.ecommerce.order.canceled | 주문 취소 |
| `START_TRIAL` | airbridge.startTrial | 체험판 시작 |
| `SUBSCRIBE` | airbridge.subscribe | 구독 |
| `UNSUBSCRIBE` | airbridge.unsubscribe | 구독 취소 |
| `AD_IMPRESSION` | airbridge.adImpression | 광고 노출 |
| `AD_CLICK` | airbridge.adClick | 광고 클릭 |
| `COMPLETE_TUTORIAL` | airbridge.completeTutorial | 튜토리얼 완료 |
| `ACHIEVE_LEVEL` | airbridge.achieveLevel | 레벨 달성 |
| `UNLOCK_ACHIEVEMENT` | airbridge.unlockAchievement | 업적 달성 |
| `RATE` | airbridge.rate | 평가 |
| `SHARE` | airbridge.share | 공유 |
| `SCHEDULE` | airbridge.schedule | 예약 |
| `SPEND_CREDITS` | airbridge.spendCredits | 크레딧 사용 |

---

## 9.2 Semantic Attributes 목록

| Attribute 상수 | 키 | 타입 | 설명 |
|----------------|-----|------|------|
| `ACTION` | action | string | 리포트 GroupBy용 |
| `LABEL` | label | string | 리포트 GroupBy용 |
| `VALUE` | value | float | 매출 분석용 |
| `CURRENCY` | currency | string | 통화 코드 (USD, KRW 등) |
| `PRODUCTS` | products | array | 상품 목록 |
| `PRODUCT_ID` | productID | string | 상품 ID |
| `PRODUCT_NAME` | name | string | 상품명 |
| `PRODUCT_PRICE` | price | float | 상품 가격 |
| `PRODUCT_QUANTITY` | quantity | int | 상품 수량 |
| `PRODUCT_CURRENCY` | currency | string | 상품 통화 |
| `PRODUCT_POSITION` | position | int | 상품 위치 |
| `PRODUCT_CATEGORY_ID` | categoryID | string | 카테고리 ID |
| `PRODUCT_CATEGORY_NAME` | categoryName | string | 카테고리명 |
| `PRODUCT_BRAND_ID` | brandID | string | 브랜드 ID |
| `PRODUCT_BRAND_NAME` | brandName | string | 브랜드명 |
| `TRANSACTION_ID` | transactionID | string | 거래 ID |
| `TOTAL_QUANTITY` | totalQuantity | int | 총 수량 |
| `QUERY` | query | string | 검색어 |
| `PERIOD` | period | string | 기간 |
| `IS_RENEWAL` | isRenewal | boolean | 갱신 여부 |
| `RENEWAL_COUNT` | renewalCount | int | 갱신 횟수 |
| `IN_APP_PURCHASED` | inAppPurchased | boolean | 인앱 결제 여부 |
| `CONTRIBUTION_MARGIN` | contributionMargin | float | 기여 마진 |

---

## 9.3 이벤트 전송 코드 예시

### Android (Kotlin)

```kotlin
import co.ab180.airbridge.Airbridge
import co.ab180.airbridge.event.AirbridgeCategory
import co.ab180.airbridge.event.AirbridgeAttribute

// Standard Event
Airbridge.trackEvent(AirbridgeCategory.ORDER_COMPLETED)

// Standard Event (SDK 미제공)
Airbridge.trackEvent("airbridge.ecommerce.order.canceled")

// Custom Event
Airbridge.trackEvent("customEvent")

// Event with Attributes
Airbridge.trackEvent(
    category = AirbridgeCategory.ORDER_COMPLETED,
    semanticAttributes = mapOf(
        AirbridgeAttribute.ACTION to "purchase",
        AirbridgeAttribute.LABEL to "premium",
        AirbridgeAttribute.VALUE to 99.99,
        AirbridgeAttribute.CURRENCY to "USD",
        AirbridgeAttribute.TRANSACTION_ID to "txn_12345",
        AirbridgeAttribute.PRODUCTS to listOf(
            mapOf(
                AirbridgeAttribute.PRODUCT_ID to "prod_001",
                AirbridgeAttribute.PRODUCT_NAME to "Premium Plan",
                AirbridgeAttribute.PRODUCT_PRICE to 99.99,
                AirbridgeAttribute.PRODUCT_QUANTITY to 1
            )
        )
    ),
    customAttributes = mapOf(
        "promotion" to "summer_sale",
        "coupon_code" to "SAVE20"
    )
)
```

### iOS (Swift)

```swift
import Airbridge

// Standard Event
Airbridge.trackEvent(category: AirbridgeCategory.ORDER_COMPLETED)

// Standard Event (SDK 미제공)
Airbridge.trackEvent(category: "airbridge.ecommerce.order.canceled")

// Custom Event
Airbridge.trackEvent(category: "customEvent")

// Event with Attributes
Airbridge.trackEvent(
    category: AirbridgeCategory.ORDER_COMPLETED,
    semanticAttributes: [
        AirbridgeAttribute.ACTION: "purchase",
        AirbridgeAttribute.LABEL: "premium",
        AirbridgeAttribute.VALUE: 99.99,
        AirbridgeAttribute.CURRENCY: "USD",
        AirbridgeAttribute.TRANSACTION_ID: "txn_12345",
        AirbridgeAttribute.PRODUCTS: [
            [
                AirbridgeAttribute.PRODUCT_ID: "prod_001",
                AirbridgeAttribute.PRODUCT_NAME: "Premium Plan",
                AirbridgeAttribute.PRODUCT_PRICE: 99.99,
                AirbridgeAttribute.PRODUCT_QUANTITY: 1
            ]
        ]
    ],
    customAttributes: [
        "promotion": "summer_sale",
        "coupon_code": "SAVE20"
    ]
)
```

### Web

```javascript
// Standard Event
airbridge.events.send(AirbridgeCategory.ORDER_COMPLETED);

// Event with Attributes
airbridge.events.send(AirbridgeCategory.ORDER_COMPLETED, {
    semanticAttributes: {
        action: 'purchase',
        label: 'premium',
        value: 99.99,
        currency: 'USD',
        transactionID: 'txn_12345',
        products: [
            {
                productID: 'prod_001',
                name: 'Premium Plan',
                price: 99.99,
                quantity: 1
            }
        ]
    },
    customAttributes: {
        promotion: 'summer_sale',
        coupon_code: 'SAVE20'
    }
});
```

### React Native / Expo

```javascript
import { Airbridge, AirbridgeCategory, AirbridgeAttribute } from 'airbridge-react-native-sdk';

// Standard Event
Airbridge.trackEvent(AirbridgeCategory.ORDER_COMPLETED);

// Event with Attributes
Airbridge.trackEvent(
    AirbridgeCategory.ORDER_COMPLETED,
    {
        [AirbridgeAttribute.ACTION]: 'purchase',
        [AirbridgeAttribute.LABEL]: 'premium',
        [AirbridgeAttribute.VALUE]: 99.99,
        [AirbridgeAttribute.CURRENCY]: 'USD',
        [AirbridgeAttribute.TRANSACTION_ID]: 'txn_12345',
        [AirbridgeAttribute.PRODUCTS]: [
            {
                [AirbridgeAttribute.PRODUCT_ID]: 'prod_001',
                [AirbridgeAttribute.PRODUCT_NAME]: 'Premium Plan',
                [AirbridgeAttribute.PRODUCT_PRICE]: 99.99,
                [AirbridgeAttribute.PRODUCT_QUANTITY]: 1
            }
        ]
    },
    {
        promotion: 'summer_sale',
        coupon_code: 'SAVE20'
    }
);
```

### Flutter

```dart
import 'package:airbridge_flutter_sdk/airbridge_flutter_sdk.dart';

// Standard Event
Airbridge.trackEvent(category: AirbridgeCategory.ORDER_COMPLETED);

// Event with Attributes
Airbridge.trackEvent(
    category: AirbridgeCategory.ORDER_COMPLETED,
    semanticAttributes: {
        AirbridgeAttribute.ACTION: 'purchase',
        AirbridgeAttribute.LABEL: 'premium',
        AirbridgeAttribute.VALUE: 99.99,
        AirbridgeAttribute.CURRENCY: 'USD',
        AirbridgeAttribute.TRANSACTION_ID: 'txn_12345',
        AirbridgeAttribute.PRODUCTS: [
            {
                AirbridgeAttribute.PRODUCT_ID: 'prod_001',
                AirbridgeAttribute.PRODUCT_NAME: 'Premium Plan',
                AirbridgeAttribute.PRODUCT_PRICE: 99.99,
                AirbridgeAttribute.PRODUCT_QUANTITY: 1
            }
        ]
    },
    customAttributes: {
        'promotion': 'summer_sale',
        'coupon_code': 'SAVE20'
    }
);
```

### Unity (C#)

```csharp
// Standard Event
Airbridge.TrackEvent(AirbridgeCategory.ORDER_COMPLETED);

// Event with Attributes
Airbridge.TrackEvent(
    category: AirbridgeCategory.ORDER_COMPLETED,
    semanticAttributes: new Dictionary<string, object>() {
        { AirbridgeAttribute.ACTION, "purchase" },
        { AirbridgeAttribute.LABEL, "premium" },
        { AirbridgeAttribute.VALUE, 99.99 },
        { AirbridgeAttribute.CURRENCY, "USD" },
        { AirbridgeAttribute.TRANSACTION_ID, "txn_12345" },
        { AirbridgeAttribute.PRODUCTS, new List<object>() {
            new Dictionary<string, object>() {
                { AirbridgeAttribute.PRODUCT_ID, "prod_001" },
                { AirbridgeAttribute.PRODUCT_NAME, "Premium Plan" },
                { AirbridgeAttribute.PRODUCT_PRICE, 99.99 },
                { AirbridgeAttribute.PRODUCT_QUANTITY, 1 }
            }
        }}
    },
    customAttributes: new Dictionary<string, object>() {
        { "promotion", "summer_sale" },
        { "coupon_code", "SAVE20" }
    }
);
```

### Unreal (C++)

```cpp
UAirbridgeList* Products = UAirbridgeList::CreateObject();
UAirbridgeMap* Product = UAirbridgeMap::CreateObject()
    ->Set(AirbridgeAttribute::PRODUCT_ID, "prod_001")
    ->Set(AirbridgeAttribute::PRODUCT_NAME, "Premium Plan")
    ->Set(AirbridgeAttribute::PRODUCT_PRICE, 99.99)
    ->Set(AirbridgeAttribute::PRODUCT_QUANTITY, 1);
Products->Add(Product);

UAirbridgeMap* SemanticAttributes = UAirbridgeMap::CreateObject()
    ->Set(AirbridgeAttribute::ACTION, "purchase")
    ->Set(AirbridgeAttribute::LABEL, "premium")
    ->Set(AirbridgeAttribute::VALUE, 99.99)
    ->Set(AirbridgeAttribute::CURRENCY, "USD")
    ->Set(AirbridgeAttribute::TRANSACTION_ID, "txn_12345")
    ->Set(AirbridgeAttribute::PRODUCTS, Products);

UAirbridgeMap* CustomAttributes = UAirbridgeMap::CreateObject()
    ->Set("promotion", "summer_sale")
    ->Set("coupon_code", "SAVE20");

FAirbridge::TrackEvent(
    AirbridgeCategory::ORDER_COMPLETED,
    SemanticAttributes,
    CustomAttributes
);
```

---

# 10단계: 사용자 데이터 설정

## 10.1 사용자 식별자 설정

| 메서드 | 설명 | 해싱 |
|--------|------|------|
| `setUserID(id)` | 사용자 고유 ID | ❌ |
| `setUserEmail(email)` | 이메일 | ✅ SHA256 |
| `setUserPhone(phone)` | 전화번호 | ✅ SHA256 |
| `setUserAlias(key, value)` | 사용자 별칭 (최대 10개) | ❌ |
| `setUserAttribute(key, value)` | 사용자 속성 | ❌ |

## 10.2 코드 예시

### Android (Kotlin)

```kotlin
import co.ab180.airbridge.Airbridge

// 로그인 시
Airbridge.setUserID("user_12345")
Airbridge.setUserEmail("user@example.com")  // SHA256 자동 해싱
Airbridge.setUserPhone("+821012345678")     // SHA256 자동 해싱
Airbridge.setUserAlias("kakao_id", "kakao_12345")
Airbridge.setUserAttribute("membership", "gold")
Airbridge.setUserAttribute("age", 25)

// 로그아웃 시
Airbridge.clearUser()
```

### iOS (Swift)

```swift
import Airbridge

// 로그인 시
Airbridge.setUserID("user_12345")
Airbridge.setUserEmail("user@example.com")  // SHA256 자동 해싱
Airbridge.setUserPhone("+821012345678")     // SHA256 자동 해싱
Airbridge.setUserAlias(key: "kakao_id", value: "kakao_12345")
Airbridge.setUserAttribute(key: "membership", value: "gold")
Airbridge.setUserAttribute(key: "age", value: 25)

// 로그아웃 시
Airbridge.clearUser()
```

### Web

```javascript
// 로그인 시
airbridge.setUserID('user_12345');
airbridge.setUserEmail('user@example.com');
airbridge.setUserPhone('+821012345678');
airbridge.setUserAlias({ kakao_id: 'kakao_12345' });
airbridge.setUserAttributes({ membership: 'gold', age: 25 });

// 로그아웃 시
airbridge.clearUser();
```

### React Native / Flutter / Others

```javascript
// React Native
import { Airbridge } from 'airbridge-react-native-sdk';

Airbridge.setUserID('user_12345');
Airbridge.setUserEmail('user@example.com');
Airbridge.setUserPhone('+821012345678');
Airbridge.setUserAlias('kakao_id', 'kakao_12345');
Airbridge.setUserAttribute('membership', 'gold');

Airbridge.clearUser();
```

---

# 11단계: 선택적 설정

## 11.1 Opt-in / Opt-out

### Opt-in (사전 동의 필수)

**설정**
```json
{ "autoStartTrackingEnabled": false }
```

**동의 후 호출**
```kotlin
// Android
Airbridge.startTracking()

// iOS
Airbridge.startTracking()

// Cross-Platform
Airbridge.startTracking()
```

### Opt-out (명시적 거부 시)

**설정**
```json
{ "autoStartTrackingEnabled": true }
```

**거부 시 호출**
```kotlin
// Android
Airbridge.stopTracking()

// iOS
Airbridge.stopTracking()

// Cross-Platform
Airbridge.stopTracking()
```

---

## 11.2 SDK Signature

### 자격 증명 위치
- Dashboard > Management > Fraud Validation Rules > SDK Signature

### Native SDK 설정

**Android**
```kotlin
val option = AirbridgeOptionBuilder("YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
    .setSDKSignature("SECRET_ID", "SECRET")
    .build()
```

**iOS**
```swift
let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    .setSDKSignature(id: "SECRET_ID", secret: "SECRET")
    .build()
```

### Cross-Platform SDK 설정

**airbridge.json**
```json
{
    "sdkSignatureID": "SECRET_ID",
    "sdkSignatureSecret": "SECRET"
}
```

---

## 11.3 Custom Domain

### Dashboard 설정
- Dashboard > Settings > Tracking Links > Custom Domain

### Native SDK 설정

**Android**
```kotlin
val option = AirbridgeOptionBuilder("YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
    .setTrackingLinkCustomDomains(listOf("your-custom.domain.com"))
    .build()
```

**iOS**
```swift
let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    .setTrackingLinkCustomDomains(["your-custom.domain.com"])
    .build()
```

### Cross-Platform SDK 설정

**airbridge.json**
```json
{
    "trackingLinkCustomDomains": ["your-custom.domain.com"]
}
```

> ⚠️ Custom Domain은 반드시 FQDN(Fully Qualified Domain Name) 형식이어야 함

---

## 11.4 Device Alias

### Android

```kotlin
Airbridge.setDeviceAlias("custom_device_id", "device_12345")
Airbridge.removeDeviceAlias("custom_device_id")
Airbridge.clearDeviceAlias()
```

### iOS

```swift
Airbridge.setDeviceAlias(key: "custom_device_id", value: "device_12345")
Airbridge.removeDeviceAlias(key: "custom_device_id")
Airbridge.clearDeviceAlias()
```

### Web / Cross-Platform

```javascript
Airbridge.setDeviceAlias('custom_device_id', 'device_12345');
Airbridge.removeDeviceAlias('custom_device_id');
Airbridge.clearDeviceAlias();
```

---

## 11.5 Session Timeout

| 설정 | 기본값 | 최대값 |
|------|--------|--------|
| sessionTimeoutInSecond | 300초 (5분) | 604,800초 (7일) |

### Native SDK 설정

**Android**
```kotlin
val option = AirbridgeOptionBuilder("YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
    .setSessionTimeout(600)  // 10분
    .build()
```

**iOS**
```swift
let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    .setSessionTimeout(second: 600)  // 10분
    .build()
```

### Cross-Platform SDK 설정

**airbridge.json**
```json
{
    "sessionTimeoutInSecond": 600
}
```

---

## 11.6 이벤트 전송 설정

### 전송 간격

| 설정 | 기본값 | 최대값 |
|------|--------|--------|
| eventTransmitIntervalInSecond | 0초 (즉시) | 86,400초 (1일) |

### 버퍼 제한

| 설정 | 기본값 | 최대값 |
|------|--------|--------|
| eventBufferCountLimit | INT_MAX | INT_MAX |
| eventBufferSizeLimitInGibibyte | 1024 GiB | 1024 GiB |

### 초기화 시 버퍼 삭제

```json
{
    "clearEventBufferOnInitializeEnabled": true
}
```

---

# 12단계: Web SDK 전용 기능

## 12.1 Web-to-App (Smart Banner)

```javascript
airbridge.openBanner({
    destination: {
        type: 'deeplink',
        deeplink: {
            ios: {
                appId: 'APP_ID',        // App Store ID
                fallback: 'https://fallback.url'
            },
            android: {
                packageName: 'com.example.app',
                fallback: 'https://fallback.url'
            }
        }
    }
});
```

## 12.2 Web-to-App (Custom)

```javascript
airbridge.openDeeplink({
    deeplinks: {
        ios: 'yourscheme://path',
        android: 'yourscheme://path'
    },
    fallbacks: {
        ios: 'https://apps.apple.com/app/id123456789',
        android: 'https://play.google.com/store/apps/details?id=com.example.app'
    }
});
```

## 12.3 Web-to-Web

```javascript
airbridge.openDeeplink({
    fallbacks: {
        ios: 'https://target-website.com',
        android: 'https://target-website.com',
        desktop: 'https://target-website.com'
    }
});

// 또는
airbridge.sendWeb({
    url: 'https://target-website.com'
});
```

---

# 13단계: Hybrid App 설정

웹뷰 내 웹사이트 코드 변경 없이 SDK가 Airbridge 관련 작업을 처리하도록 설정합니다.

### 가이드 참조

| SDK | Hybrid App 가이드 |
|-----|------------------|
| Android | hybrid-app-settings-android-sdk-v4 |
| iOS | hybrid-app-settings-ios-sdk-v4 |
| React Native | hybrid-app-settings-react-native-sdk-v4 |
| Flutter | hybrid-app-settings-flutter-sdk-v4 |
| Unity | hybrid-app-settings-unity-sdk-v4 |
| Cordova | hybrid-app-settings-cordova-sdk-v4 |
| Expo | hybrid-app-settings-expo-sdk-v4 |
| Unreal | hybrid-app-settings-unreal-sdk-v4 |

---

# 14단계: 테스트 및 QA

## 14.1 로그 레벨 설정

| 레벨 | 설명 |
|------|------|
| `debug` | 모든 로그 출력 (개발용) |
| `info` | 정보성 로그 |
| `warning` | 경고 로그 |
| `error` | 오류 로그 |
| `fault` | 심각한 오류만 |

### Native SDK 설정

**Android**
```kotlin
val option = AirbridgeOptionBuilder("YOUR_APP_NAME", "YOUR_APP_SDK_TOKEN")
    .setLogLevel(AirbridgeLogLevel.DEBUG)
    .build()
```

**iOS**
```swift
let option = AirbridgeOptionBuilder(name: "YOUR_APP_NAME", token: "YOUR_APP_SDK_TOKEN")
    .setLogLevel(.debug)
    .build()
```

### Cross-Platform SDK 설정

**airbridge.json**
```json
{
    "logLevel": "debug"
}
```

---

## 14.2 테스트 체크리스트

### Install 이벤트
- [ ] 앱 최초 설치 후 Install 이벤트 수집 확인
- [ ] iOS ATT 허용 시 IDFA 포함 확인
- [ ] iOS ATT 거부 시 IDFA 미포함 확인
- [ ] Android GAID 수집 확인

### 딥링크
- [ ] 앱 설치됨 + URI Scheme 딥링크 동작 확인
- [ ] 앱 설치됨 + Universal Link / App Links 동작 확인
- [ ] 앱 미설치 + 스토어 리다이렉트 확인

### Deferred Deeplink
- [ ] 앱 미설치 → 설치 → 앱 오픈 → 딥링크 콜백 수신 확인

### 이벤트 트래킹
- [ ] Standard Event 수집 확인 (Dashboard)
- [ ] Custom Event 수집 확인 (Dashboard)
- [ ] Semantic Attributes 수집 확인
- [ ] Custom Attributes 수집 확인

### 사용자 데이터
- [ ] User ID 설정/해제 확인
- [ ] User Email SHA256 해싱 확인
- [ ] User Phone SHA256 해싱 확인
- [ ] clearUser() 동작 확인

---

*문서 생성일: 2025-12-19*
*기반: Airbridge 공식 SDK 문서 9개 (Android, iOS, Web, React Native, Flutter, Cordova, Unity, Expo, Unreal)*