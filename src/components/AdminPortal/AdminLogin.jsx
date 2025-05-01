import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../App"; // adjust path as needed

const AdminLogin = () => {
  const [email, setEmail] = useState(""); // using email for login
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.error_description || error.message);
      setLoading(false);
      return;
    }

    // Check that the user exists in the "admins" table
    if (data?.user) {
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        alert("Access Denied: You are not authorized as an admin.");
        // Optionally, sign the user out so they are not kept in an incorrect session
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Flag the session as an admin session (for route guards)
      localStorage.setItem("isAdmin", "true");
      navigate("/admin-dashboard");
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
            <h1 className="text-black text-[32px] font-semibold">Admin Login</h1>
            <p className="text-gray-600 text-[18px] font-light">
              Welcome to Student Payment Portal
            </p>
          </div>

          {/* Wrap the login fields in a form so Enter can trigger submission */}
          <form onSubmit={handleLogin} className="w-full mt-6">
            <div className="w-full">
              <label className="text-[#1f1f1f] text-lg sm:text-xl font-normal">
                Email
              </label>
              <input
                type="email"
                className="w-full mt-2 p-3 bg-[#f7f6ff] rounded-lg shadow-inner text-lg"
                placeholder="Enter your admin email"
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
              {loading ? "Loading..." : "Login"}
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

export default AdminLogin;
