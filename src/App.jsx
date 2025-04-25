import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import StudentLogin from './components/StudentPortal/StudentLogin';
import AdminLogin from './components/AdminPortal/AdminLogin';
import Layout from './components/StudentPortal/Layout';
import LiabilitiesDashboard from './components/StudentPortal/LiabilitiesDashboard';
import PaymentHistory from './components/StudentPortal/PaymentHistory';
import Notifications from './components/StudentPortal/Notifications';
import Help from './components/StudentPortal/Help';
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import './App.css';

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
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])
  
  return (
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
      </Routes>
    </div>
  );
}

export default App;