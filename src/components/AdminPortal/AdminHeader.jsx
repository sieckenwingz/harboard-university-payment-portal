import React from "react";

const AdminHeader = () => {
  return (
    <div className="w-full h-[71px] bg-white shadow-md flex items-center px-6 z-10">
      <div className="flex items-center space-x-4">
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
