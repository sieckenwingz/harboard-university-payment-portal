// components/auth/StudentLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../../App";
import { Eye, EyeOff } from "lucide-react";
import student from "../../assets/student.png";
import loginpic from "../../assets/loginpic.png";

const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorField, setErrorField] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorField(null); // Reset error state

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: rememberMe
        }
      });

      if (error) {
        setErrorField("credentials");
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (studentError || !studentData) {
          setErrorField("credentials");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem("userEmail", email);
        }
        navigate("/dashboard");
      }
    } catch (e) {
      setErrorField("credentials");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToLanding = () => {
    navigate('/');
  };

  // Function to navigate to landing page and then scroll to contact section
  const navigateToContact = () => {
    // First navigate to landing page
    navigate('/');
    
    // Then scroll to contact section after a short delay to ensure page loads
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="relative w-screen h-screen flex font-roboto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f6f7f9] to-white z-0"></div>
      
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#800000]/5 z-0"></div>
      <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-[#f3ce73]/10 z-0"></div>

      <div className="absolute right-0 bottom-0 w-full h-72 bg-no-repeat bg-right-bottom opacity-5 z-0"></div>
      
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#800000]/5 transform rotate-45 origin-bottom-right"></div>
        <div className="absolute top-3/4 -right-1/4 w-1/2 h-1/2 bg-[#f3ce73]/10 transform rotate-45"></div>
      </div>
      
      {/* Fixed header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md py-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start px-4 sm:px-8">
          <div 
            onClick={navigateToLanding}
            className="flex items-center gap-2 sm:gap-4 cursor-pointer"
          >
            <img 
              src={student}
              alt="Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-transform duration-300 hover:scale-105" 
            />
            <div className="text-[#800000] text-xs sm:text-sm md:text-xl font-tinos">
              THE HARBOARD UNIVERSITY
            </div>
          </div>
        </div>
      </header>

      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 pt-20 relative z-10">

        <div className="hidden md:flex w-full md:w-1/2 h-full items-center justify-center p-4 lg:p-8 relative">
          <div className="relative w-full max-w-md">

            <div className="absolute inset-0 bg-[#800000] opacity-15 rounded-2xl transform rotate-3"></div>
            <div className="absolute inset-0 bg-[#f3ce73] opacity-25 rounded-2xl transform -rotate-3"></div>
            
            {/*  benefits */}
            <div className="relative bg-white p-4 lg:p-8 rounded-2xl shadow-xl border border-gray-200 z-10">
              <h2 className="text-xl lg:text-2xl font-bold text-[#800000] mb-4">Student Payment Portal Benefits</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                  <p className="text-sm lg:text-base">Real-time tracking of your account liabilities</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                  <p className="text-sm lg:text-base">Convenient payments via GCash with zero fees</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                  <p className="text-sm lg:text-base">Digital receipts accessible anytime</p>
                </li>
              </ul>
            </div>
          </div>
          

          <div className="absolute right-[-1rem] bottom-0 w-64 md:w-72 lg:w-96 h-auto z-20 pointer-events-none">
            <img 
              src={loginpic}
              alt="Student pointing" 
              className="w-full h-auto transform -scale-x-100"
            />
          </div>
        </div>

        {/*  login form */}
        <div className="w-full md:w-1/2 flex justify-center items-center py-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden z-10">

            <div className="absolute top-0 right-0 w-32 h-32 bg-[#800000] opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f3ce73] opacity-10 rounded-full transform -translate-x-16 translate-y-16"></div>
            
            <div className="w-full text-center mb-6 relative">
              <h1 className="text-[#800000] text-2xl sm:text-3xl font-raleway font-bold">
                Student Login
              </h1>
              <div className="mt-2 h-1 w-24 bg-[#f3ce73] mx-auto rounded-full"></div>
            </div>

            <form onSubmit={handleLogin} className="w-full">
              <div className="w-full mb-4">
                <label className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                      errorField === "credentials" ? "border-red-200 bg-red-50/50" : "border-gray-300 bg-white"
                    } focus:outline-none focus:ring-2 focus:ring-[#800000]/30 transition-all shadow-sm border text-sm sm:text-base`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorField) setErrorField(null);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const passwordInput = document.querySelector('input[type="password"]');
                        if (passwordInput) passwordInput.focus();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="w-full mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm sm:text-base font-medium">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                      errorField === "credentials" ? "border-red-200 bg-red-50/50" : "border-gray-300 bg-white"
                    } focus:outline-none focus:ring-2 focus:ring-[#800000]/30 transition-all shadow-sm border text-sm sm:text-base`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorField) setErrorField(null);
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="sm:w-5 sm:h-5" />
                    ) : (
                      <Eye size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {errorField === "credentials" && (
                <div className="mt-2 text-red-500 text-sm text-center animated fadeIn">
                  Invalid credentials. Please check your email and password.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 sm:py-3 bg-[#800000] hover:bg-[#600000] text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl glow-effect text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
              
              <div className="text-center mt-6 text-sm sm:text-base">
                <span className="text-gray-600">Need help? </span>
                <button 
                  onClick={navigateToContact}
                  className="text-[#800000] hover:underline font-medium bg-transparent border-none cursor-pointer"
                >
                  Contact Support
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-600 border-t border-gray-200 shadow-inner z-10">
        © 2025 The Harboard University. All rights reserved.
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Roboto:wght@400;500;700&family=Tinos:wght@400&display=swap');
        
        .glow-effect {
          box-shadow: 0 0 15px rgba(128, 0, 0, 0.3);
          transition: all 0.3s ease;
          transform: translateZ(0); 
        }
        .glow-effect:hover {
          box-shadow: 0 0 25px rgba(128, 0, 0, 0.5);
          transform: translateY(-2px);
        }

        /* Mobile-first responsive styles */
        @media (max-width: 640px) {
          .glow-effect {
            box-shadow: 0 0 10px rgba(128, 0, 0, 0.2);
          }
          .glow-effect:hover {
            box-shadow: 0 0 15px rgba(128, 0, 0, 0.4);
          }
        }

        /* Add subtle animation for the background */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Ensure page always fills the viewport */
        html, body, #root {
          height: 100%;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default StudentLogin;