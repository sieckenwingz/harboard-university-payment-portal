import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const adminData = {
    name: "Admin User",
    position: "System Administrator",
    department: "Student Affairs Office",
    avatar: "A", 
  };

  const getSelectedPage = () => {
    const path = location.pathname;
    
    if (path.match(/^\/[^/]+-liabilities$/)) {
      return "Management";
    }
    
    if (path === "/management" || 
        path === "/add-new-liability" ||
        path === "/edit-liability") {
      return "Management";
    }
    
    if (path === "/admin-dashboard" || 
        path.startsWith("/department-liabilities/") ||
        (path.includes("/departments/") && path.includes("/liabilities/"))) {
      return "Liabilities";
    }
    
    if (path === "/admin-help") {
      return "Help";
    }
    
    return "Liabilities";
  };

  const selectedPage = getSelectedPage();

  const handleSidebarClick = (page) => {
    switch (page) {
      case "Liabilities":
        navigate("/admin-dashboard");
        break;
      case "Management":
        navigate("/management");
        break;
      case "Help":
        navigate("/admin-help");
        break;
      default:
        navigate("/admin-dashboard");
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/admin-login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  const sidebarItems = [
    { label: "Liabilities", icon: <LayoutDashboard size={18} /> },
    { label: "Management", icon: <Settings size={18} /> },
  ];

  return (
    <>
      <div
        className={`h-screen transition-all duration-300 ${
          collapsed ? "w-[80px]" : "w-[250px]"
        } bg-white text-gray-800 shadow-xl p-4 overflow-y-auto relative`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center cursor-pointer" onClick={toggleUserProfile}>
            <div className="w-12 h-12 rounded-full bg-[#a63f42] text-white font-bold flex justify-center items-center text-lg ring-4 ring-[#a63f42]/20">
              {adminData.avatar}
            </div>
            {!collapsed && (
              <div className="ml-4 font-semibold">{adminData.name}</div>
            )}
          </div>
        </div>

        <button
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white border border-gray-200 rounded-l-full w-6 h-12 shadow-md hover:bg-[#f2f0ff] text-gray-600 hover:text-[#a63f42] z-10 flex items-center justify-center"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="flex flex-col gap-1">
          {sidebarItems.map(({ label, icon }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                ${collapsed ? "justify-center" : ""}
                ${
                  selectedPage === label
                    ? "bg-[#f7f6ff] text-[#a63f42] font-semibold border-l-4 border-[#a63f42]"
                    : "hover:bg-[#f2f0ff] text-gray-600 hover:text-[#a63f42]"
                }`}
              onClick={() => handleSidebarClick(label)}
            >
              <div className="w-[18px] flex justify-center">{icon}</div>
              {!collapsed && <span>{label}</span>}
            </div>
          ))}
        </div>

        <div className="absolute bottom-20 left-4 right-4">
          {!collapsed && (
            <div className="text-xs font-semibold mb-2 text-gray-400">SUPPORT</div>
          )}

          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }
            ${
              selectedPage === "Help"
                ? "bg-[#f7f6ff] text-[#a63f42] font-semibold border-l-4 border-[#a63f42]"
                : "hover:bg-[#f2f0ff] text-gray-600 hover:text-[#a63f42]"
            }`}
            onClick={() => handleSidebarClick("Help")}
          >
            <div className="w-[18px] flex justify-center">
              <HelpCircle size={18} />
            </div>
            {!collapsed && <span>Help</span>}
          </div>

          <div
            className={`flex items-center gap-3 px-4 py-3 mt-2 rounded-lg cursor-pointer transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            } hover:bg-[#fdf6f7] text-gray-600 hover:text-[#a63f42]`}
            onClick={handleLogoutClick}
          >
            <div className="w-[18px] flex justify-center">
              <LogOut size={18} />
            </div>
            {!collapsed && <span>Log out</span>}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 shadow-xl rounded-lg p-6 w-[300px]">
            <p className="text-sm mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-2">
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                className="text-[#a63f42] text-sm font-semibold"
                onClick={confirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 shadow-xl rounded-lg p-6 w-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Admin Profile</h3>
              <button
                onClick={toggleUserProfile}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#a63f42] text-white font-bold flex justify-center items-center text-2xl">
                {adminData.avatar}
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-xl">{adminData.name}</h4>
                <p className="text-gray-500 text-sm">{adminData.position}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Position</span>
                <span className="font-medium">{adminData.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department</span>
                <span className="font-medium">{adminData.department}</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                className="px-4 py-2 bg-[#a63f42] text-white rounded-lg hover:bg-[#8a3639] transition"
                onClick={toggleUserProfile}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;