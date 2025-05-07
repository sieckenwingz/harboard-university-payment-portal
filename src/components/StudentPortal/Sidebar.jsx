// src/components/StudentPortal/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Camera,
  Upload
} from "lucide-react";
import { supabase } from "../../App";
import useUserData from "./hooks/useUserData";
import Avatar from "../common/Avatar"; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Use our custom hook to get user data
  const { userData, loading, error, fetchUserData, getFullName, getAvatarLetter, getSrCode } = useUserData();

  // state for sidebar toggle collapse
  const [collapsed, setCollapsed] = useState(false);

  // state for showing/hiding logout confirmation popup
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // state for showing/hiding student profile modal
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // State for profile picture upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  
  // Get user details for display
  const fullName = getFullName();
  const firstName = userData?.firstName || "Loading...";
  const avatarLetter = getAvatarLetter();
  const srCode = getSrCode();
  
  // Fetch profile image on component mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        // First, get the authenticated user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          console.error('Error getting authenticated user:', authError);
          return;
        }
        
        const userId = authData.user.id;
        
        // List files in the bucket
        const { data: files, error: listError } = await supabase
          .storage
          .from('profile-images')
          .list();
          
        if (listError) {
          console.error('Error listing files:', listError);
          return;
        }
        
        // Find the exact file that starts with the user's ID
        // This ensures we don't get files with IDs that just contain this ID as a substring
        const userFile = files.find(file => 
          file.name.startsWith(userId + '_') // Must start with the ID followed by underscore
        );
        
        if (userFile) {
          // Get the signed URL for the profile image
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('profile-images')
            .createSignedUrl(userFile.name, 60 * 60); // 1 hour expiry
            
          if (urlError) {
            console.error('Error creating signed URL:', urlError);
            return;
          }
          
          if (urlData) {
            setProfileImageUrl(urlData.signedUrl);
          }
        } else {
          console.log('No profile image found for user:', userId);
        }
      } catch (error) {
        console.error("Error in fetchProfileImage:", error);
      }
    };
    
    if (userData) {
      fetchProfileImage();
    }
  }, [userData]);
  
  // Refetch user data when profile modal is opened
  useEffect(() => {
    if (showUserProfile) {
      fetchUserData();
    }
  }, [showUserProfile]);
  
  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingImage(true);
      
      // Get user ID
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
      
      // Create new filename with user ID and original name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${firstName.toLowerCase()}.${fileExt}`;
      
      // Upload the new image
      const { error: uploadError } = await supabase
        .storage
        .from('profile-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get URL of the uploaded image
      const { data: urlData } = await supabase
        .storage
        .from('profile-images')
        .createSignedUrl(fileName, 60 * 60);
      
      if (urlData) {
        setProfileImageUrl(urlData.signedUrl);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    } finally {
      setUploadingImage(false);
    }
  };
  
  // determines which page is currently selected based on route
  const getSelectedPage = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Liabilities";
    if (path === "/payment-history") return "Payment History";
    if (path === "/notifications") return "Notifications";
    if (path === "/help") return "Help";
    return "Liabilities"; // default fallback
  };

  const selectedPage = getSelectedPage();

  /**
   * Navigates to the selected sidebar page
   * @param {string} page - name of the page
   */
  const handleSidebarClick = (page) => {
    switch (page) {
      case "Liabilities":
        navigate("/dashboard");
        break;
      case "Payment History":
        navigate("/payment-history");
        break;
      case "Notifications":
        navigate("/notifications");
        break;
      case "Help":
        navigate("/help");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // triggers logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // proceeds with logout and redirects to login page
  const confirmLogout = async () => {
    setShowLogoutConfirm(false);  
    await supabase.auth.signOut();
    navigate('/student-login'); // Redirect to login page after sign out
  };

  // cancels logout action
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // toggles profile modal visibility
  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  // list of navigation links for the sidebar
  const sidebarItems = [
    { label: "Liabilities", icon: <LayoutDashboard size={18} /> },
    { label: "Payment History", icon: <History size={18} /> },
    { label: "Notifications", icon: <Bell size={18} /> },
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
                name={firstName} 
                loading={loading} 
              />
              {!collapsed && (
                <div className="ml-4">
                  <div className="font-semibold">{firstName}</div>
                  {loading ? (
                    <div className="text-xs text-gray-400">Loading...</div>
                  ) : (
                    <div className="text-xs text-gray-400">{srCode}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* toggle sidebar button */}
          <button
            className="absolute top-20 -right-0 bottom-0 my-auto transform bg-white border border-gray-200 rounded-l-full w-6 h-12 shadow-md hover:bg-[#f2f0ff] text-gray-600 hover:text-[#a63f42] z-10 flex items-center justify-center"
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
        
        {/* Bottom Section: Help & Logout - fixed at bottom */}
        <div className="p-4 border-t border-gray-100">
          {!collapsed && (
            <div className="text-xs font-semibold mb-2 text-gray-400">SUPPORT</div>
          )}

          {/* Help Navigation */}
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

      {/* Student Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 shadow-xl rounded-lg p-6 w-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Student Profile</h3>
              <button
                onClick={toggleUserProfile}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Student Profile Info */}
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 size={32} className="animate-spin text-[#a63f42]" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-6">
                <p>Error loading profile data</p>
                <button 
                  onClick={fetchUserData} 
                  className="mt-3 px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group mb-2">
                    <Avatar 
                      src={profileImageUrl} 
                      name={firstName} 
                      size="lg" 
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
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
                  <h4 className="font-bold text-xl">{fullName}</h4>
                  <p className="text-gray-500 text-sm">{srCode}</p>
                  <p className="text-sm text-blue-500 cursor-pointer mt-1 flex items-center" onClick={() => fileInputRef.current.click()}>
                    <Upload size={14} className="mr-1" /> Change Profile Picture
                  </p>
                </div>

                {/* Profile Details */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Program</span>
                    <span className="font-medium">BS Computer Engineering</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Year Level</span>
                    <span className="font-medium">3rd Year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enrollment Status</span>
                    <span className="font-medium text-green-600">Enrolled</span>
                  </div>
                </div>
              </>
            )}

            {/* Close Button */}
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

export default Sidebar;