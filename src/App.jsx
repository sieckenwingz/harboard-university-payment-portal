import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import StudentLogin from './components/StudentPortal/StudentLogin';
import AdminLogin from './components/AdminPortal/AdminLogin';
import Layout from './components/StudentPortal/Layout';
import LiabilitiesDashboard from './components/StudentPortal/LiabilitiesDashboard';
import PaymentHistory from './components/StudentPortal/PaymentHistory';
import Notifications from './components/StudentPortal/Notifications';
import Help from './components/StudentPortal/Help';
import { createClient } from "@supabase/supabase-js";
import './App.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route element={<Layout />}>
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