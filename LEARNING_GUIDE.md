# 🧠 HealthCore Frontend Learning Guide

This guide is designed to help you understand the core architectural patterns and React concepts used in the `sdp-frontend` project. If you are learning React or trying to reverse-engineer this specific app, reading this will explain *how* and *why* things are wired the way they are.

---

## 1. Top-Level Routing (`App.jsx`)

The entry point for navigation in this application is `src/App.jsx`. It uses **React Router DOM**.

### Concepts to Learn:
- **`<BrowserRouter>` (aliased as `<Router>`)**: Wraps the entire application to enable client-side routing.
- **`<Routes>` & `<Route>`**: Define the paths and what component to render when the URL matches that path.
- **Nested Routes:** Notice how routes like `/doctor` have sub-routes *inside* them:
  ```jsx
  <Route path="/doctor" element={<DoctorLayout />}>
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="schedule" element={<DoctorSchedule />} />
      ...
  </Route>
  ```
  This means when a user visits `/doctor/dashboard`, React Router renders `<DoctorLayout>` and injects `<DoctorDashboard />` inside it where the `<Outlet />` is placed.

---

## 2. Authentication & Context (`src/context/AuthContext.jsx`)

State that needs to be accessed globally (like "who is logged in right now?") is handled via **React Context**.

### Concepts to Learn:
- **`createContext` & `useContext`**: Instead of passing the `user` object down through 10 different components via props (prop-drilling), we create a Context. `useAuth()` allows any component to instantly grab the user's data.
- **Mocked Backend:** In `AuthContext.jsx`, there's a `mockUsers` object. When you click "Login" in `Login.jsx`, it checks this object instead of making a real API call. It uses `setTimeout` to pretend there is network latency.
- **Local Storage (`localStorage`):** When you log in, `localStorage.setItem('healthcore_user', ...)` saves your session in the browser. When you refresh the page, the `useEffect` inside `AuthProvider` checks local storage and automatically logs you back in so you don't lose your session.

---

## 3. Route Protection (`src/routes/ProtectedRoute.jsx`)

We don't want a Patient visiting the `/admin` URL.

### Concepts to Learn:
- **Higher-Order Components / Wrapper Components**: `<ProtectedRoute>` is a component that *wraps* around the secure routes in `App.jsx`.
- **Conditional Rendering**:
  - `if (loading)` -> Show a spinning loading circle.
  - `if (!user)` -> Use `<Navigate to="/auth/login" />` to forcefully kick the user to the login screen.
  - `if (!allowedRoles.includes(user.role))` -> If a logged-in User's role isn't allowed to see this page, show an "Unauthorized Access" screen or redirect them.
  - `return children` -> If all checks pass, render the actual page (`children`).

---

## 4. Layouts & Outlet Context (`src/pages/*/Layout.jsx`)

Each role (Admin, Doctor, etc.) has its own unique sidebar and header. Instead of rewriting the sidebar in every single page, we use a **Layout Component**.

### Concepts to Learn:
- **`<Outlet />`**: In `DoctorLayout.jsx`, the Sidebar and Header are standard HTML/JSX. However, inside the `<main>` tag, there is an `<Outlet />`. This tells React Router: *"Put the nested specific page component right here."*
- **`useOutletContext()`**: This is a powerful feature of React Router. In `DoctorLayout.jsx`, state like `patients` and `schedule` are defined at the top layout level. The Layout passes this data down to the child routes using `<Outlet context={{ schedule, patients }} />`.
- Then, inside `DoctorDashboard.jsx`, it can access that state directly by calling: 
  ```jsx
  const { schedule, patients } = useOutletContext();
  ```
  This acts as a lightweight built-in state management solution for a specific section of the app.

---

## 5. Styling & Tailwind CSS (`src/index.css`)

This project uses **Tailwind v4**, a utility-first CSS framework. Rather than writing separate `.css` files, classes are added straight to the JSX.

### Concepts to Learn:
- **Utility Classes**: `flex items-center justify-between bg-white text-gray-800` directly maps to CSS properties.
- **Responsive Design**: Prefixes like `md:` or `lg:` apply styles only on larger screens. Example: `hidden md:flex` means the sidebar is hidden on phones but visible on desktop.
- **Hover/Group States**: `hover:bg-red-50` changes background on hover. `group-hover:text-white` allows child elements to change style when their parent container is hovered. 

---

## Summary Checklist to Master:
1. [ ] Understand how `App.jsx` handles nested `<Route>` tags.
2. [ ] Follow a login click in `Login.jsx` -> goes to `AuthContext.jsx` -> sets `localStorage`.
3. [ ] See how `ProtectedRoute.jsx` blocks unauthenticated users.
4. [ ] Understand how `<Outlet />` renders sub-pages inside Layouts.
5. [ ] Notice how state flows from Layouts (`context`) into Dashboards (`useOutletContext`).
