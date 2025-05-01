// App.jsx
import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import LandingPage from './components/LandingPage/LandingPage';
import Layout from './components/StudentPortal/Layout';
import StudentLogin from './components/StudentPortal/StudentLogin';
import LiabilitiesDashboard from './components/StudentPortal/LiabilitiesDashboard';
import PaymentHistory from './components/StudentPortal/PaymentHistory';
import Notifications from './components/StudentPortal/Notifications';
import Help from './components/StudentPortal/Help';
import './App.css';

import AdminLogin from './components/AdminPortal/AdminLogin';
import AdminLayout from './components/AdminPortal/AdminLayout';
import AdminDashboard from './components/AdminPortal/AdminDashboard';
import AdminHelp from './components/AdminPortal/AdminHelp';
import Management from './components/AdminPortal/Management';
import ManageDeptLiabs from './components/AdminPortal/ManageDeptLiabs';
import OrganizationLiabilities from './components/AdminPortal/OrganizationLiabilities';
import StudentPayments from './components/AdminPortal/StudentPayments';
import AddLiabilityPopup from './components/AdminPortal/AddLiabilityPopup';
import EditLiabilityPopup from './components/AdminPortal/EditLiabilityPopup';

import { AuthProvider } from './context/AuthContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Route guard for student public pages (landing, student login)
function PublicRoute({ session, children }) {
  return session ? <Navigate to="/dashboard" replace /> : children;
}

// Route guard for student protected pages (dashboard, payment history, etc.)
function ProtectedRoute({ session, children }) {
  return session ? children : <Navigate to="/" replace />;
}

// Route guard for admin login pages
function AdminPublicRoute({ session, children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (session) {
    // If a user is logged in, send them to the correct dashboard based on role.
    return isAdmin ? (
      <Navigate to="/admin-dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }
  return children;
}

// Route guard for admin protected pages
function AdminProtectedRoute({ session, children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return session && isAdmin ? children : <Navigate to="/admin-login" replace />;
}

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Removed unconditional navigation to preserve admin routes.
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <div className="app-container">
        <Routes>
          {/* Public / Landing & Login routes */}
          <Route
            path="/"
            element={
              <PublicRoute session={session}>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/student-login"
            element={
              <PublicRoute session={session}>
                <StudentLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/admin-login"
            element={
              <AdminPublicRoute session={session}>
                <AdminLogin />
              </AdminPublicRoute>
            }
          />

          {/* Student protected routes */}
          <Route element={<ProtectedRoute session={session}><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<LiabilitiesDashboard />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* Admin protected routes */}
          <Route element={<AdminProtectedRoute session={session}><AdminLayout /></AdminProtectedRoute>}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-help" element={<AdminHelp />} />
            <Route path="/management" element={<Management />} />
            <Route path="/:organizationSlug-liabilities" element={<ManageDeptLiabs />} />
            <Route path="/organization-liabilities/:organizationId" element={<OrganizationLiabilities />} />
            <Route path="/organizations/:organizationId/liabilities/:liabilityId" element={<StudentPayments />} />

            <Route path="/add-new-liability" element={<AddLiabilityPopup />} />
            <Route path="/edit-liability" element={<EditLiabilityPopup />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
