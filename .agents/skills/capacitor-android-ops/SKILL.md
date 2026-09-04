---
name: capacitor-android-ops
description: >-
  Provides safe operational procedures for the Spend Analysis Capacitor Android
  application, including native project inspection, web asset synchronization,
  Android build preparation, Gradle troubleshooting, device verification, and
  production APK/AAB workflows while preserving the project's approved
  architecture and security constraints.
---

# Capacitor Android Operations Runbook

## 1. Architecture Overview

Spend Analysis on Android operates as a hybrid native application combining a modern React/Vite client contained within a Capacitor Android WebView container, communicating exclusively over HTTPS with the production Render Express backend and Supabase PostgreSQL database.

```text
+-------------------------------------------------------------------+
| Android Device / Emulator                                         |
|  +-------------------------------------------------------------+  |
|  | Native Android Wrapper (in.spendanalysis.app)               |  |
|  |  +-------------------------------------------------------+  |  |
|  |  | Capacitor WebView Container (Capacitor 8.5.1)         |  |  |
|  |  |  +-------------------------------------------------+  |  |  |
|  |  |  | React/Vite Frontend (dist/ bundled web assets)   |  |  |  |
|  |  |  +-------------------------------------------------+  |  |  |
|  |  +-------------------------------------------------------+  |  |
|  +-----------------------------+-------------------------------+  |
+--------------------------------|----------------------------------+
                                 | HTTPS / TLS 1.3
                                 v
+-------------------------------------------------------------------+
| Render Web Service (Node.js/Express)                              |
| https://spend-analysis-fhs9.onrender.com/api                      |
+--------------------------------+----------------------------------+
                                 | PostgreSQL Connection Pool (SSL)
                                 v
+-------------------------------------------------------------------+
| Supabase PostgreSQL Database                                      |
+-------------------------------------------------------------------+
```

---

## 2. Environment & Project Baseline

- **Capacitor Core**: `8.5.1`
- **Capacitor CLI**: `8.5.1`
- **Capacitor Android**: `8.5.1`
- **Application ID (`appId`)**: `in.spendanalysis.app`
- **Application Name (`appName`)**: `Spend Analysis`
- **Web Asset Directory (`webDir`)**: `dist`
- **Production API Base URL**: `https://spend-analysis-fhs9.onrender.com/api`
- **Min Android SDK**: `24` (Android 7.0 Nougat+)
- **Target Android SDK**: `36` (Android 16)
- **Compile Android SDK**: `36`

---

## 3. Strict Safety & Security Constraints

When operating on the Android project:

1. **Zero Secret Leakage**:
   - Never embed `DATABASE_URL`, `JWT_SECRET`, database passwords, or Supabase service-role keys into frontend code, Android assets, `strings.xml`, or Gradle files.
   - The native app only receives user JWT tokens stored in secure local storage upon authenticated login.
2. **Financial Data Protection**:
   - Never request, store, or log banking passwords or UPI PINs.
   - Maintain the Account Aggregator sandbox consent model.
3. **Application Identity Immutability**:
   - Never alter `applicationId` or `namespace` from `in.spendanalysis.app`.
   - Never rename the application from `Spend Analysis`.
4. **Dependency & Plugin Stability**:
   - Do not install additional Capacitor plugins (e.g., camera, filesystem, push notifications) without explicit requirement and approval.
   - Do not manually upgrade or downgrade Gradle, Android Gradle Plugin (AGP), or SDK compile versions outside approved phases.
5. **UI & Layout Integrity**:
   - Preserve the Soft Dark visual system (`#18191F` page background, `#202126` elevated surfaces, `#292A30` cards).
   - Ensure the floating bottom navigation capsule (`Home`, `Analytics`, `Transactions`, `Budget`, `Settings`) does not obscure scrollable page content.
6. **Isolated Scope**:
   - Android-focused tasks must not modify backend business logic, Supabase database schemas, Render deployment configurations, or web UI routing.

---

## 4. Phase-Aware Android Workflow

Always follow the phased governance lifecycle: `Plan -> Implement -> Test -> Review -> Approve -> Next`.

```text
[Phase 3B.1-5: Setup & Add] -> [Phase 3B.6: Asset Sync] -> [Phase 3B.7: Native Config] -> [Phase 3B.8: Build/Verification] -> [Release]
```

### Step A: Diagnostic Environment Pre-Check
Inspect local toolchain availability without modifying system state:
```bash
# Check Java runtime (JDK 17 or JDK 21 recommended for AGP 8+)
java -version

# Check Android Debug Bridge
adb --version

# Check Android SDK environment variables
echo "ANDROID_HOME: $env:ANDROID_HOME"
echo "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"
```

### Step B: Frontend Web Build
Compile production assets with embedded production API URL:
```bash
# Verify TypeScript types
npm run typecheck --prefix frontend

# Generate production bundle in frontend/dist/
npm run build --prefix frontend
```

### Step C: Web Asset Synchronization
*Only run when the active approved phase authorizes synchronization:*
```bash
cd frontend
npx cap sync android
```
This copies `frontend/dist/` into `frontend/android/app/src/main/assets/public/` and updates native plugin bridges.

### Step D: Gradle Wrapper Verification
Verify the native wrapper scripts:
```bash
cd frontend/android
# Check Gradle tasks (requires Java)
./gradlew tasks
```

---

## 5. Release & Signing Policy

- **Debug Builds**: Default Android debug keystore is used during development and local testing.
- **Production Release Signing**: Production keystore creation, key alias configuration, and APK/AAB signing are reserved for a dedicated, approved release phase.
- **No Hardcoded Credentials**: Never store keystore passwords or release certificates in version control or plain text configuration files.

---

## 6. Troubleshooting & Diagnostic Runbook

| Symptom / Issue | Potential Cause | Safe Diagnostic Action |
| :--- | :--- | :--- |
| `java: command not found` | JDK not installed or missing from system PATH | Verify JDK installation (JDK 17/21). If absent on CLI, document for developer environment setup; do not attempt automated system installs. |
| `webDir: dist not found` | Frontend not built prior to sync | Run `npm run build --prefix frontend` to generate `frontend/dist/`. |
| API calls fail in Android WebView | CORS mismatch or invalid base URL | Verify `dist/assets/index-*.js` contains `https://spend-analysis-fhs9.onrender.com/api` and Render backend allows `capacitor://localhost`. |
| Outdated web assets in Android | Assets not synchronized | Rebuild frontend (`npm run build --prefix frontend`) and execute `npx cap sync android` in `frontend/`. |
| AndroidManifest merge conflicts | Unapproved plugin injection | Inspect `frontend/android/app/src/main/AndroidManifest.xml` and revert unapproved plugin modifications. |
