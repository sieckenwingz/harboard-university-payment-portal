// components/StudentPortal/Header.jsx
import React from "react";
import { supabase } from "../../App";

const Header = () => {
  const handleHeaderClick = async () => {
    try {
      // Sign out the user
      await supabase.auth.signOut();
      
      // Force a complete page reload and redirect to student login
      window.location.href = "/student-login";
    } catch (error) {
      console.error("Error during header logout:", error);
      // Fallback in case of error
      window.location.href = "/student-login";
    }
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

export default Header;