// src/components/AdminPortal/AdminSidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../App";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Camera,
  Upload
} from "lucide-react";
import Avatar from "../common/Avatar"; // Import the Avatar component

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Add state for admin data with loading state
  const [adminData, setAdminData] = useState({
    id: "",
    name: "Loading...",
    position: "Administrator",
    organizations: "Student Affairs Office",
    avatar: "A" 
  });
  const [loading, setLoading] = useState(true);
  
  // State for profile image
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Toggle user profile modal
  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  useEffect(() => {
    console.log(adminData)
  }, [adminData])

  // Fetch admin data and profile image on component mount
  useEffect(() => {
    async function fetchAdminData() {
      try {
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user found");
          setLoading(false);
          return;
        }
        
        // Get the admin record using the auth user ID
        const { data, error } = await supabase
          .from('admins_with_organizations')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching admin data:", error);
          setLoading(false);
          return;
        }
        
        if (data) {
          setAdminData({
            ...adminData,
            id: data.id,
            name: `${data.first_name} ${data.last_name}`,
            avatar: data.first_name.charAt(0) || "A",
            organizations: data.organizations
          });
          
          // Fetch profile image - with more precise matching
          const { data: files, error: listError } = await supabase
            .storage
            .from('profile-images')
            .list();
            
          if (listError) {
            console.error('Error listing files:', listError);
            setLoading(false);
            return;
          }
          
          // Find a file that STARTS WITH the user ID (not just contains)
          const userFile = files.find(file => 
            file.name.startsWith(user.id + '_') // Must start with the ID followed by underscore
          );
          
          if (userFile) {
            // Get the signed URL for the profile image
            const { data: urlData } = await supabase
              .storage
              .from('profile-images')
              .createSignedUrl(userFile.name, 60 * 60); // 1 hour expiry
              
            if (urlData) {
              setProfileImageUrl(urlData.signedUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchAdminData:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAdminData();
  }, []);
  
  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !adminData.id) return;
    
    try {
      setUploadingImage(true);
      
      // First, get the authenticated user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('No authenticated user found');
      }
      
      const userId = authData.user.id;
      
      // List existing files to remove
      const { data: existingFiles } = await supabase
        .storage
        .from('profile-images')
        .list();
      
      // Remove any existing files with this user's ID
      if (existingFiles && existingFiles.length > 0) {
        const userFiles = existingFiles.filter(file => file.name.includes(userId));
        if (userFiles.length > 0) {
          await Promise.all(
            userFiles.map(existingFile => 
              supabase.storage
                .from('profile-images')
                .remove([existingFile.name])
            )
          );
        }
      }
      
      // Create new filename with user ID and name
      const fileExt = file.name.split('.').pop();
      // Get first name from adminData.name
      const firstName = adminData.name.split(' ')[0]?.toLowerCase() || 'admin';
      const fileName = `${userId}_${firstName}.${fileExt}`;
      
      // Upload the new image
      const { error: uploadError } = await supabase
        .storage
        .from('profile-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get the URL of the uploaded image
      const { data } = await supabase
        .storage
        .from('profile-images')
        .createSignedUrl(fileName, 60 * 60); // 1 hour expiry
      
      if (data) {
        setProfileImageUrl(data.signedUrl);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    } finally {
      setUploadingImage(false);
    }
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
        path.startsWith("/organization-liabilities/") ||
        (path.includes("/organizations/") && path.includes("/liabilities/"))) {
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

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    
    try {
      // Sign out the user from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      }
      
      // Clear admin flag
      localStorage.removeItem("isAdmin");
      
      // Use window.location for a full page reload
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const sidebarItems = [
    { label: "Liabilities", icon: <LayoutDashboard size={18} /> },
    { label: "Management", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Fixed sidebar container */}
      <div
        className={`fixed top-[71px] left-0 bottom-0 transition-all duration-300 ${
          collapsed ? "w-[80px]" : "w-[250px]"
        } bg-white text-gray-800 shadow-xl z-10 flex flex-col`}
      >
        {/* Top sidebar content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {/* avatar + name (clickable to open profile modal) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center cursor-pointer" onClick={toggleUserProfile}>
              <Avatar 
                src={profileImageUrl} 
                name={adminData.name} 
                loading={loading} 
              />
              {!collapsed && (
                <div className="ml-4 font-semibold">{adminData.name}</div>
              )}
            </div>
          </div>

          {/* toggle sidebar button */}
          <button
            className="absolute top-20 -right-0 bottom-0 my-auto bg-white border border-gray-200 rounded-l-full w-6 h-12 shadow-md hover:bg-[#f2f0ff] text-gray-600 hover:text-[#a63f42] z-10 flex items-center justify-center"
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* main navigation items */}
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
        </div>

        {/* Bottom Section with Help & Logout - fixed at bottom */}
        <div className="p-4 border-t border-gray-100">
          {/* Help Navigation - if needed */}
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

          {/* Logout Button */}
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

      {/* Content margin spacer */}
      <div className={`${collapsed ? "w-[80px]" : "w-[250px]"} flex-shrink-0 transition-all duration-300`}></div>

      {/* Admin Profile Modal */}
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

            <div className="flex flex-col items-center mb-6">
              <div className="relative group mb-2">
                <Avatar 
                  src={profileImageUrl} 
                  name={adminData.name}
                  size="lg" 
                  loading={loading}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={24} className="text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <h4 className="font-bold text-xl mt-2">{adminData.name}</h4>
              <p className="text-gray-500 text-sm">{adminData.position}</p>
              <p className="text-sm text-blue-500 cursor-pointer mt-1 flex items-center" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} className="mr-1" /> Change Profile Picture
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Position</span>
                <span className="font-medium">{adminData.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Organizations</span>
                <span className="font-medium">{adminData.organizations.map((org) => <p key={org.id}>{org.name}</p>)}</span>
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

      {/* Logout Confirmation Popup */}
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
    </>
  );
};

export default AdminSidebar;