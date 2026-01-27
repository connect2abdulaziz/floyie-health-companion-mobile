# Floyie Mobile

Expo (managed) React Native app — TypeScript, Expo Router, NativeWind, Sentry, Supabase.  
Target: iOS and Android. Wellness app (no medical logic, no native Bluetooth).

---

## Commands to run (copy-paste)

From project root `floyie-mobile`:

```bash
npm install
npx expo install --fix
npx pod-install
```

(Linux/macOS only for `pod-install`; skip on Windows unless using WSL.)

Then:

```bash
cp .env.example .env
# Edit .env with your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

npx expo start
```

---

## 1. Create app (if starting in a new repo)

```bash
npx create-expo-app@latest floyie-mobile --template tabs --yes
cd floyie-mobile
```

## 2. Install dependencies (if not using this scaffold)

```bash
npm install
npx expo install nativewind@^4.0.1 react-native-reanimated tailwindcss
npx expo install sentry-expo expo-secure-store
npx expo install @supabase/supabase-js @tanstack/react-query react-hook-form lucide-react-native
npx expo install babel-plugin-module-resolver --save-dev
npx expo install --fix
```

iOS: `npx pod-install`

---

## 3. Environment

Copy env example and set values (no secrets in repo):

```bash
cp .env.example .env
```

Set at least:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SENTRY_DSN` (optional; leave empty to disable Sentry)

---

## 4. Run

```bash
npx expo start
```

Then press `i` for iOS simulator or `a` for Android emulator.

---

## Project structure

```
app/
├── (auth)/          # Auth flow
│   ├── welcome.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/          # Main app tabs
│   ├── dashboard.tsx
│   ├── blood-pressure.tsx
│   ├── insights.tsx
│   └── profile.tsx
├── _layout.tsx      # Root layout (Sentry, React Query, Stack)
└── index.tsx        # Redirects to (auth)/welcome

components/
├── ui/              # e.g. Button.tsx (NativeWind)
├── layout/
└── charts/

hooks/
├── useAuth.ts
└── usePermissions.ts

services/
├── supabase.ts      # Supabase client (SecureStore for auth)
├── wearable-sync.ts
└── ai.ts

lib/
├── constants.ts     # ENV-based (SUPABASE_*, etc.)
├── roles.ts
└── permissions.ts
```

---

## Config recap

- **NativeWind:** `tailwind.config.js` (content: `app/**`, `components/**`), `babel.config.js` (nativewind preset), `metro.config.js` (withNativeWind), `global.css` imported in `app/_layout.tsx`.
- **Sentry:** Initialized in `app/_layout.tsx` from `EXPO_PUBLIC_SENTRY_DSN`; no DSN in repo. Plugin in `app.json`: `"sentry-expo"`.
- **Supabase:** `services/supabase.ts` uses `expo-secure-store` for auth persistence; URL/anon key from `lib/constants.ts` (env).
- **Expo Router:** File-based; `(auth)` and `(tabs)` are route groups. Path alias `@/*` in `tsconfig.json` (Expo resolves it).

---

## Minimal code references

**NativeWind (className on RN components):**

```tsx
<View className="flex-1 items-center justify-center bg-white p-6">
  <Text className="text-xl font-semibold text-gray-900">Hello</Text>
</View>
```

**Supabase client:**

```ts
import { supabase } from "@/services/supabase";
const { data } = await supabase.auth.getSession();
```

**Sentry:** Already initialized in `app/_layout.tsx` when `EXPO_PUBLIC_SENTRY_DSN` is set.

**Expo Router layout:** Root layout wraps app in `QueryClientProvider` and `Stack`; auth and tabs are in `(auth)` and `(tabs)`.

---

Do not eject, no web code in this repo, no monorepo tooling, no Redux/Flutter.
