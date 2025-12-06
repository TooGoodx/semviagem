import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { useAuth } from '../context/AuthContext';

// Import pages (will be created later)
import Home from '../pages/Home';
import About from '../pages/About';
import Testimonials from '../pages/Testimonials';
import Register from '../pages/Register';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import UpdatePassword from '../pages/UpdatePassword';
import Dashboard from '../pages/Dashboard';
import HotelSearch from '../pages/HotelSearch';
import Flights from '../pages/Flights';
import Hotels from '../pages/Hotels';
import FlightOffers from '../pages/FlightOffers';
import FlightSearch from '../pages/FlightSearchFixed';
import BookingManagement from '../pages/BookingManagement';
import FaleComigo from '../pages/FaleComigo';
import AlertasImperdiveis from '../pages/AlertasImperdiveis';
import Treinamentos from '../pages/Treinamentos';
import Consultoria from '../pages/Consultoria';
import GrupoExclusivo from '../pages/GrupoExclusivo';
import AddClient from '../pages/AddClient';
import TestPage from '../pages/TestPage';
import TestAirportSearch from '../pages/TestAirportSearch';
import MoblixDashboard from '../pages/MoblixDashboard';
import FareTestPage from '../pages/FareTestPage';
import Summary from '../pages/Summary';
import Success from '../pages/Success';
import Cancel from '../pages/Cancel';
import CheckoutDemo from '../pages/CheckoutDemo';
import Profile from '../pages/Profile';
import BuscarVoos from '../pages/BuscarVoos';
import ClaudeThinkDemo from '../pages/ClaudeThinkDemo';
import AuthCallback from '../pages/AuthCallback';
import { PaywallTest } from '../pages/PaywallTest';

// Guest Route component (for login/register pages)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/depoimentos" element={<Testimonials />} />
      <Route path="/fale-comigo" element={<FaleComigo />} />
      <Route path="/alertas-imperdiveis" element={<AlertasImperdiveis />} />
      <Route path="/treinamentos" element={<Treinamentos />} />
      <Route path="/consultoria" element={<Consultoria />} />
      <Route path="/grupo-exclusivo" element={<GrupoExclusivo />} />
      <Route path="/teste" element={<TestPage />} />
      <Route path="/test-airport" element={<TestAirportSearch />} />
      <Route path="/fare-test" element={<FareTestPage />} />
      <Route path="/claude-think-demo" element={<ClaudeThinkDemo />} />
      <Route path="/paywall-test" element={<PaywallTest />} />

      {/* Guest only routes */}
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      
      {/* Password update (can be accessed by authenticated users) */}
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* Auth0 callback route - CRITICAL: Must process authentication return */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Authenticated routes (sem exigência de assinatura) */}
      <Route path="/dashboard" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
      <Route path="/profile" element={<AuthenticatedRoute><Profile /></AuthenticatedRoute>} />
      <Route path="/buscarvoos" element={<AuthenticatedRoute><BuscarVoos /></AuthenticatedRoute>} />
      <Route path="/area-logada" element={<Navigate to="/dashboard" replace />} />

      {/* Premium subscription required routes */}
      <Route path="/moblix-dashboard" element={<ProtectedRoute><MoblixDashboard /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><HotelSearch /></ProtectedRoute>} />
      <Route path="/flights" element={<ProtectedRoute><Flights /></ProtectedRoute>} />
      <Route path="/flight-search" element={<ProtectedRoute><FlightSearch /></ProtectedRoute>} />
      <Route path="/hotels" element={<ProtectedRoute><Hotels /></ProtectedRoute>} />
      <Route path="/ofertas" element={<ProtectedRoute><FlightOffers /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
      <Route path="/dashboard/clients/new" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
      
      <Route path="/summary" element={<Summary />} />

      {/* Stripe payment routes */}
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
      <Route path="/checkout" element={<CheckoutDemo />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
