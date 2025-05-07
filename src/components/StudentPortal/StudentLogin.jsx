// components/auth/StudentLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../App";
import { Eye, EyeOff } from "react-feather"; // Import eye icons from react-feather

const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (event) => {
    event.preventDefault(); // Triggered both by Enter key and button submit
    setLoading(true);
    setInvalidCredentials(false); // Reset invalid state

    // Attempt authentication via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      setInvalidCredentials(true);
      setLoading(false);
      return;
    }

    // Verify that the user is registered in the "students" table
    if (data?.user) {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (studentError || !studentData) {
        setInvalidCredentials(true);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } else {
      setInvalidCredentials(true);
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToLanding = () => {
    navigate('/');
  };

  const inputBorderClass = invalidCredentials 
    ? "border-red-300 bg-red-50" 
    : "border-gray-300 bg-[#f7f6ff]";

  return (
    <div className="w-screen h-screen flex items-center bg-white font-['Roboto']">
      <img
        className="absolute w-full h-full object-cover"
        src="/thu bg.png" 
        alt="Background"
      />

      <div className="relative w-full h-full flex justify-end items-center px-4 sm:px-8">
        <div className="absolute right-[100px] top-[180px] w-[450px] h-[500px] bg-neutral-50 rounded-[10px] shadow-md border border-[#64cafb] backdrop-blur-md flex flex-col items-center p-8">
          <div className="w-full text-left mb-2">
            <h1 className="text-black text-[32px] font-semibold">
              Student Login
            </h1>
            {/* Welcome text removed as requested */}
          </div>

          {/* Subtle error message */}
          {invalidCredentials && (
            <p className="w-full text-red-600 text-sm mb-4">
              Invalid credentials. Please check your email and password.
            </p>
          )}

          {/* Adding a spacer div when there's no error to prevent layout shift */}
          {!invalidCredentials && <div className="h-6"></div>}

          {/* Wrap the inputs and button in a form so Enter submits */}
          <form onSubmit={handleLogin} className="w-full mt-4">
            <div className="w-full">
              <label className="text-[#1f1f1f] text-lg sm:text-xl font-normal">
                Email
              </label>
              <input
                type="text"
                className={`w-full mt-2 p-3 rounded-lg shadow-inner text-lg border ${inputBorderClass}`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (invalidCredentials) setInvalidCredentials(false);
                }}
                required
              />
            </div>

            <div className="w-full mt-4">
              <label className="text-[#1f1f1f] text-lg sm:text-xl font-normal">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full mt-2 p-3 rounded-lg shadow-inner text-lg border ${inputBorderClass}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (invalidCredentials) setInvalidCredentials(false);
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="w-full mt-4 flex items-center text-base">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="block mx-auto w-full sm:w-40 h-12 mt-6 bg-[#f3ce73] rounded-lg text-[#1f1f1f] text-lg sm:text-xl font-normal hover:bg-[#e3be63] transition"
              disabled={loading}
            >
              {loading ? <span>Loading</span> : <span>Login</span>}
            </button>
          </form>
        </div>
      </div>

      <div 
        onClick={navigateToLanding}
        className="absolute left-[42px] top-[37px] text-white text-[40px] font-['Tinos'] tracking-wide cursor-pointer hover:text-[#f3ce73] transition-colors"
      >
        THE HARBOARD UNIVERSITY
      </div>
    </div>
  );
};

export default StudentLogin;