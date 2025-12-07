import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { SelectionProvider } from './context/SelectionContext';
import { PaywallProvider } from './components/paywall';
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

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <PaywallProvider>
          <SelectionProvider>
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
          </SelectionProvider>
        </PaywallProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
