import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NewBill from './pages/NewBill';
import EditBill from './pages/EditBill';
import BillPreview from './pages/BillPreview';
import BillView from './pages/BillView';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Templates from './pages/Templates';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';
import LoadingSpinner from './components/shared/LoadingSpinner';

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 text-sm font-medium">
      You are offline. Some features may not work until you reconnect.
    </div>
  );
}

function PrivateLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  return <PrivateLayout>{children}</PrivateLayout>;
}

function PublicHome() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" />;
  return <LandingPage />;
}

export default function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bill/:token" element={<BillView />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/new-bill" element={<PrivateRoute><NewBill /></PrivateRoute>} />
        <Route path="/edit-bill/:id" element={<PrivateRoute><EditBill /></PrivateRoute>} />
        <Route path="/bill-preview/:id" element={<PrivateRoute><BillPreview /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
      </Routes>
    </>
  );
}
