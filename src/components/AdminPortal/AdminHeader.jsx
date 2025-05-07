// components/AdminPortal/AdminHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../App";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleHeaderClick = async () => {
    // Sign out the user and then navigate to landing page
    await supabase.auth.signOut();
    // Also clear the admin flag
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  return (
    <div className="w-full h-[71px] bg-white shadow-md flex items-center px-6 z-10">
      <div 
        className="flex items-center space-x-4 cursor-pointer" 
        onClick={handleHeaderClick}
      >
        <img 
          src="/src/assets/headerLogo.png" 
          alt="Harboard University Logo" 
          className="w-12 h-12 object-contain mr-3"
        />
        <div className="text-[#800000] text-2xl font-normal font-['Tinos'] tracking-wide">
          THE HARBOARD UNIVERSITY
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;