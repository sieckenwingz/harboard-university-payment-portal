import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './components/LandingPage/LandingPage';

import Layout from './components/StudentPortal/Layout';
import StudentLogin from './components/StudentPortal/StudentLogin';
import LiabilitiesDashboard from './components/StudentPortal/LiabilitiesDashboard';
import PaymentHistory from './components/StudentPortal/PaymentHistory';
import Notifications from './components/StudentPortal/Notifications';
import Help from './components/StudentPortal/Help';

import AdminLayout from './components/AdminPortal/AdminLayout';
import AdminLogin from './components/AdminPortal/AdminLogin';
import AdminHelp from './components/AdminPortal/AdminHelp';
import AdminDashboard from './components/AdminPortal/AdminDashboard';
import Management from './components/AdminPortal/Management';
import DepartmentLiabilities from './components/AdminPortal/DepartmentLiabilities';
import StudentPayments from './components/AdminPortal/StudentPayments';
import ManageDeptLiabs from './components/AdminPortal/ManageDeptLiabs';
import AddLiabilityPopup from './components/AdminPortal/AddLiabilityPopup';
import EditLiabilityPopup from './components/AdminPortal/EditLiabilityPopup';
// import PaymentReceiptModal from './components/AdminPortal/PaymentReceiptModal';
// import TransactionProcessingModal from './components/AdminPortal/TransactionProcessingModal';
// import ConfirmationModal from './components/AdminPortal/ConfirmationModal';


import './App.css';

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

        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-help" element={<AdminHelp />} />
          <Route path="/management" element={<Management />} />
          <Route path="/:departmentSlug-liabilities" element={<ManageDeptLiabs />} />
          <Route path="/department-liabilities/:departmentId" element={<DepartmentLiabilities />} />
          <Route path="/departments/:departmentId/liabilities/:liabilityId" element={<StudentPayments />} />

          <Route path="/add-new-liability" element={<AddLiabilityPopup />} />
          <Route path="/edit-liability" element={<EditLiabilityPopup />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;