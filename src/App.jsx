import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import StorePage from './pages/StorePage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import AdminPage from './pages/AdminPage/AdminPage.jsx';

function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* The only public page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Everything else requires a session; unknown paths fall back to the store (and so to /login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<StorePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
