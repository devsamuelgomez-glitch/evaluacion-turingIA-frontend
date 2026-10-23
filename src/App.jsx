import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import StorePage from './pages/StorePage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import AdminPage from './pages/AdminPage/AdminPage.jsx';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
