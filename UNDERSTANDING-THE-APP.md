# Understanding floyie-mobile — Start Here

You know React: `App.jsx` → components → routing. This guide maps that to React Native + Expo so you can learn **one piece at a time**.

---

## 1. Where does the app "start"? (Like `App.jsx` in React)

In this project, **two files** act as the starting point:

| React (web)     | floyie-mobile (Expo) |
|-----------------|----------------------|
| `src/App.jsx`   | `app/_layout.tsx`    |
| (router setup)  | `app/index.tsx`      |

- **`app/_layout.tsx`** — The root layout. It wraps the **whole app** (providers, global styles, and the place where "screens" will render). Similar to the root component that wraps your React app.
- **`app/index.tsx`** — The **first screen** that Expo Router shows. In this app it only redirects to the welcome screen.

So the flow is: **Expo starts → loads `_layout.tsx` → renders whatever route is active → the default route is `index.tsx` → which redirects to welcome.**

---

## 2. How does "routing" work? (No React Router — it's file-based)

This app uses **Expo Router**. Routing is **file-based**: the `app/` folder **is** your router.

- **File path** = **Route**
  - `app/index.tsx`          → `/` (root)
  - `app/(auth)/welcome.tsx` → `/welcome` (and the `(auth)` part is a *group*, see below)
  - `app/(tabs)/dashboard.tsx` → `/dashboard`

So: **no `<Routes>` and `<Route>`** like in React Router. You put a screen in `app/` and it becomes a route. To go to another screen you use `<Link href="/(auth)/login">` or `router.push("/(auth)/login")`.

---

## 3. What are the `(parentheses)` folders?

Folders like `(auth)` and `(tabs)` are **route groups**. They:

- **Do not** add a segment to the URL. `(auth)/welcome` is still `/welcome`, not `/auth/welcome`.
- **Do** group related screens and let you attach a **layout** to them (e.g. `(auth)/_layout.tsx`).

So you can think of them as: "auth screens" and "tab screens", each with their own layout, without changing the URL structure.

---

## 4. Your first "flow" to follow in the codebase

Follow this path in the repo. Don’t read everything — just open the file and see what it does.

1. **`app/_layout.tsx`**  
   Root: providers (e.g. React Query), global styles, and `<Stack />` (the container for all screens).

2. **`app/index.tsx`**  
   First screen: just redirects to `/(auth)/welcome`.

3. **`app/(auth)/_layout.tsx`**  
   Layout for auth screens (welcome, login, signup). Defines how those screens are stacked.

4. **`app/(auth)/welcome.tsx`**  
   The welcome screen the user sees after the redirect.

5. **`app/(tabs)/_layout.tsx`**  
   Layout for the main app (tabs at the bottom). Defines which tabs exist (e.g. Dashboard, Insights, Profile).

6. **`app/(tabs)/dashboard.tsx`**  
   One of the main tabs — the dashboard screen.

That’s the **structure flow**: Root → Index (redirect) → Auth (welcome) → later, Tabs (dashboard, etc.).

---

## 5. How do "components" work?

Same as in React. You have:

- **Screens** in `app/` — each file is a screen (a "page").
- **Components** in `components/` — reusable UI (buttons, cards, etc.). Screens import and use them.

So: **screens** = routes; **components** = reusable pieces used by screens.

---

## 6. What to read next (when you’re ready)

- After `(auth)/welcome.tsx`, open **`app/(auth)/login.tsx`** and **`app/(auth)/signup.tsx`** to see how auth screens are built.
- Then open **`app/(tabs)/_layout.tsx`** to see how the bottom tabs are defined.
- Then pick one tab screen, e.g. **`app/(tabs)/dashboard.tsx`**, and see how it uses components from `components/dashboard/`.

No rush. One file at a time is enough.

---

## Quick mental model

| Concept        | In React (web)     | In floyie-mobile (Expo)        |
|----------------|--------------------|---------------------------------|
| Entry          | `App.jsx`          | `app/_layout.tsx` + `app/index.tsx` |
| Routing        | React Router      | File-based in `app/` (Expo Router) |
| "Pages"        | Route components  | Files in `app/*.tsx`            |
| Layouts        | Layout routes     | `_layout.tsx` in any folder     |
| Reusable UI    | `components/`     | Same — `components/`            |

You’re not learning a new paradigm — you’re learning where the same ideas live in this mobile app.
