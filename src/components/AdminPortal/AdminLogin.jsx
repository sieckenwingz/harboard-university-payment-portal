// components/StudentPortal/StudentLogin.jsx
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [adminID, setadminID] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log("Logging in with:", { adminID, password, rememberMe });
    navigate("/admin-dashboard");
  };

  return (
    <div className="w-screen h-screen flex items-center bg-white font-['Roboto']">
      <img
        className="absolute w-full h-full object-cover"
        src="/thu bg.png" 
        alt="Background"
      />

      <div className="relative w-full h-full flex justify-end items-center px-4 sm:px-8">
        <div className="absolute right-[100px] top-[180px] w-[450px] h-[500px] bg-neutral-50 rounded-[10px] shadow-md border border-[#64cafb] backdrop-blur-md flex flex-col items-center p-8">
          <div className="w-full text-left">
            <h1 className="text-black text-[32px] font-semibold">Admin Login</h1>
            <p className="text-gray-600 text-[18px] font-light">
              Welcome to Student Payment Portal
            </p>
          </div>

          {/* sr input */}
          <div className="w-full mt-6">
            <label className="text-[#1f1f1f] text-lg sm:text-xl font-normal">
              SR-code
            </label>
            <input
              type="text"
              className="w-full mt-2 p-3 bg-[#f7f6ff] rounded-lg shadow-inner text-lg"
              placeholder="Enter your Admin ID"
              value={adminID}
              onChange={(e) => setadminID(e.target.value)}
            />
          </div>

          {/* pass input */}
          <div className="w-full mt-4">
            <label className="text-[#1f1f1f] text-lg sm:text-xl font-normal">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-2 p-3 bg-[#f7f6ff] rounded-lg shadow-inner text-lg"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* remember n forgot */}
          <div className="w-full mt-4 flex flex-col sm:flex-row justify-between items-center text-base">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <a href="#" className="text-gray-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* login button */}
          <button
            onClick={handleLogin}
            className="w-full sm:w-40 h-12 mt-6 bg-[#f3ce73] rounded-lg text-[#1f1f1f] text-lg sm:text-xl font-normal hover:bg-[#e3be63] transition"
          >
            Login
          </button>
        </div>
      </div>

      {/* univ name */}
      <div className="absolute left-[42px] top-[37px] text-white text-[40px] font-regular font-['Tinos'] tracking-wide">
        THE HARBOARD UNIVERSITY
      </div>
    </div>
  );
};

export default AdminLogin;