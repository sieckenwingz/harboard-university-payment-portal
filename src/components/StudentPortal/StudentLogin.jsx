import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../App";

const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (event) => {
    event.preventDefault(); // Triggered both by Enter key and button submit
    setLoading(true);

    // Attempt authentication via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert(error.error_description || error.message);
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
        alert("Access Denied: You are not authorized as a student.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } else {
      alert("Login unsuccessful");
    }
    setLoading(false);
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
            <h1 className="text-black text-[32px] font-semibold">
              Student Login
            </h1>
            <p className="text-gray-600 text-[18px] font-light">
              Welcome to Student Payment Portal
            </p>
          </div>

          {/* Wrap the inputs and button in a form so Enter submits */}
          <form onSubmit={handleLogin} className="w-full mt-6">
            <div className="w-full">
              <label className="text-[#1f1f1f] text-lg sm:text-xl font-normal">
                Email
              </label>
              <input
                type="text"
                className="w-full mt-2 p-3 bg-[#f7f6ff] rounded-lg shadow-inner text-lg"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

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

      <div className="absolute left-[42px] top-[37px] text-white text-[40px] font-['Tinos'] tracking-wide">
        THE HARBOARD UNIVERSITY
      </div>
    </div>
  );
};

export default StudentLogin;
