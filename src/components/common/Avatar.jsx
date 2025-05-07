// src/components/common/Avatar.jsx
import React from "react";
import { Loader2 } from "lucide-react";

const Avatar = ({ src, name, size = "md", loading = false }) => {
  // Size mapping
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  // Get first letter of name for fallback
  const getInitial = () => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-[#a63f42] text-white font-bold flex justify-center items-center text-lg ring-4 ring-[#a63f42]/20`}>
        <Loader2 size={size === "sm" ? 14 : size === "md" ? 18 : 24} className="animate-spin" />
      </div>
    );
  }
  
  // Display image if available, otherwise show initial
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[#a63f42] text-white font-bold flex justify-center items-center overflow-hidden ring-4 ring-[#a63f42]/20`}>
      {src ? (
        <img 
          src={src} 
          alt={`${name}'s profile`} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = getInitial();
          }}
        />
      ) : (
        <span className="text-lg">{getInitial()}</span>
      )}
    </div>
  );
};

export default Avatar;