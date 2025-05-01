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

import AdminLogin from './components/AdminPortal/AdminLogin'; // adjust the path if different
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function ProtectedRoute({ session, children }) {
  return session ? children : <Navigate to="/" replace />
}

function PublicRoute({ session, children }) {
  return session ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        // navigate('/dashboard')
      } else {
        // navigate('/')
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  return (
    <AuthProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<PublicRoute session={session}><LandingPage /></PublicRoute>} />
          <Route path="/student-login" element={<PublicRoute session={session}><StudentLogin /></PublicRoute>} />
          <Route path="/admin-login" element={<PublicRoute session={session}><AdminLogin /></PublicRoute>} />
          <Route element={<ProtectedRoute session={session}><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<LiabilitiesDashboard />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* TODO: Replace [PublicRoute] with [ProtectedRoute] after implementing */}
          <Route element={<PublicRoute session={session}><AdminLayout /></PublicRoute>}>
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