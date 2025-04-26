import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const [srCode, setSrCode] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Mock user database for demonstration
  const mockUsers = [
    { srCode: "22-04756", password: "password123" },
    { srCode: "22-02812", password: "test123" }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!srCode.trim()) {
      newErrors.srCode = "SR-code is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const user = mockUsers.find(
        user => user.srCode === srCode && user.password === password
      );
      
      if (user) {
        console.log("Logging in with:", { srCode, password, rememberMe });
        // Store user data in local storage if remember me is checked
        if (rememberMe) {
          localStorage.setItem("srCode", srCode);
        }
        navigate("/dashboard");
      } else {
        // Check if the SR-code exists but password is wrong
        const srCodeExists = mockUsers.some(user => user.srCode === srCode);
        if (srCodeExists) {
          setErrors({ auth: "Invalid password" });
        } else {
          setErrors({ auth: "SR-code not registered" });
        }
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-screen h-screen flex items-center bg-white font-['Roboto']">
      <img
        className="absolute w-full h-full object-cover"
        src="/thu bg.png" 
        alt="Background"
      />

      <div className="relative w-full h-full flex justify-center md:justify-end items-center px-4 sm:px-8">
        <div className="absolute md:right-[100px] top-[50%] md:top-[180px] transform translate-y-[-50%] md:translate-y-0 w-[90%] max-w-[450px] h-auto md:h-[500px] bg-neutral-50 rounded-[10px] shadow-md border border-[#64cafb] backdrop-blur-md flex flex-col items-center p-4 sm:p-8">
          <div className="w-full text-left">
            <h1 className="text-black text-[28px] md:text-[32px] font-semibold">Student Login</h1>
            <p className="text-gray-600 text-[16px] md:text-[18px] font-light">
              Welcome to Student Payment Portal
            </p>
          </div>

          {errors.auth && (
            <div className="w-full mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
              {errors.auth}
            </div>
          )}

          {/* sr input */}
          <div className="w-full mt-4 md:mt-6">
            <label className="text-[#1f1f1f] text-base md:text-lg font-normal">
              SR-code
            </label>
            <input
              type="text"
              className={`w-full mt-2 p-2 md:p-3 bg-[#f7f6ff] rounded-lg shadow-inner text-base md:text-lg ${
                errors.srCode ? "border border-red-500" : ""
              }`}
              placeholder="Enter your SR-code"
              value={srCode}
              onChange={(e) => {
                setSrCode(e.target.value);
                if (errors.srCode || errors.auth) {
                  setErrors((prev) => ({ ...prev, srCode: "", auth: "" }));
                }
              }}
            />
            {errors.srCode && (
              <p className="text-red-500 text-xs mt-1">{errors.srCode}</p>
            )}
          </div>

          {/* pass input */}
          <div className="w-full mt-3 md:mt-4">
            <label className="text-[#1f1f1f] text-base md:text-lg font-normal">
              Password
            </label>
            <input
              type="password"
              className={`w-full mt-2 p-2 md:p-3 bg-[#f7f6ff] rounded-lg shadow-inner text-base md:text-lg ${
                errors.password ? "border border-red-500" : ""
              }`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.auth) {
                  setErrors((prev) => ({ ...prev, password: "", auth: "" }));
                }
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* remember n forgot */}
          <div className="w-full mt-3 md:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm md:text-base">
            <label className="flex items-center text-gray-700 mb-2 sm:mb-0">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
          </div>

          {/* login button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full sm:w-40 h-10 md:h-12 mt-4 md:mt-6 bg-[#f3ce73] rounded-lg text-[#1f1f1f] text-base md:text-lg font-normal hover:bg-[#e3be63] transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </div>

      {/* univ name */}
      <div className="absolute left-4 sm:left-[42px] top-4 sm:top-[37px] text-white text-[24px] sm:text-[32px] md:text-[40px] font-regular font-['Tinos'] tracking-wide">
        THE HARBOARD UNIVERSITY
      </div>
    </div>
  );
};

export default StudentLogin;