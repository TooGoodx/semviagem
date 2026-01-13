import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { SelectionProvider } from './context/SelectionContext';
import { PaywallProvider } from './components/paywall';
import { RegistrationRequired } from './components/auth/RegistrationRequired';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function Layout() {
  return (
    <div id="app" className="min-h-screen bg-white transition-colors duration-300 w-full">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="transition-all duration-300 flex-grow w-full">
        <div className="transition-all duration-300 ease-out">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

function AppContent() {
  const { needsRegistration, pendingUserData, isLoading } = useUser();

  // Show registration required screen
  if (needsRegistration && pendingUserData) {
    return <RegistrationRequired pendingUserData={pendingUserData} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#060D1C' }}></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Normal app routing
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Layout />}>
          <Route path="*" element={<AppRoutes />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#374151',
            color: '#f8fafc',
          },
        }}
      />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <PaywallProvider>
          <SelectionProvider>
            <AppContent />
          </SelectionProvider>
        </PaywallProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
