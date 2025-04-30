import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./AdminHeader";
import Sidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-6 bg-neutral-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;  