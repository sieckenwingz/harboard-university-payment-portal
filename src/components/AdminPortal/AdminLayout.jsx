// components/AdminPortal/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./AdminHeader";
import Sidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <Header />
      </div>
      
      {/* Main Content Area with Sidebar and Outlet */}
      <div className="flex flex-1 pt-[71px] h-full">
        {/* Sidebar will handle its own fixed positioning */}
        <Sidebar />
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;