import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import student1 from "../../assets/student1.png";
import student from "../../assets/student.png";
import student4 from "../../assets/student4.png";
import { Clock, Bell, FileText, Smartphone, Clock3, Shield, PhilippinePeso, Menu, X } from "lucide-react";
import TermsPrivacyModal from "./TermsPrivacyModal"; // Import the TermsPrivacyModal component

const fadeInUp = {
  hidden: { opacity: 0, y: 20 }, 
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4, 
      ease: "easeOut",
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4, 
      ease: "easeOut",
    },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: -30 }, 
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5, 
      ease: "easeOut",
    },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 30 }, 
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5, 
      ease: "easeOut",
    },
  },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.9 }, 
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4, 
      ease: "easeOut",
    },
  },
};

const useOnScreen = (ref, threshold = 0.1) => { 
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -5% 0px'
      }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold]);

  return isIntersecting;
};

const AnimatedSection = ({ children, className, variants = fadeInUp }) => {
  const ref = useRef(null);
  const isOnScreen = useOnScreen(ref);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isOnScreen ? "visible" : "hidden"}
      variants={variants}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false); // State for terms modal visibility

  const homeRef = useRef(null);
  const servicesRef = useRef(null);
  const faqsRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (sectionId) => {
    setIsScrolling(true);
    setIsMenuOpen(false); 
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      setTimeout(() => {
        setActiveSection(sectionId);
        setIsScrolling(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (isScrolling) return;

    let isScrollingTimeout;
    const handleScroll = () => {
      if (isScrollingTimeout) {
        clearTimeout(isScrollingTimeout);
      }
      
      isScrollingTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY + 100;
        
        const sections = [
          { id: "home", ref: homeRef },
          { id: "services", ref: servicesRef },
          { id: "faqs", ref: faqsRef },
          { id: "contact", ref: contactRef }
        ];

        for (const section of sections) {
          if (!section.ref.current) continue;
          
          const offsetTop = section.ref.current.offsetTop;
          const offsetHeight = section.ref.current.offsetHeight;
          
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }, 50); 
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (isScrollingTimeout) {
        clearTimeout(isScrollingTimeout);
      }
    };
  }, [isScrolling]);

  const features = [
    {
      title: "Real-time Tracking",
      text: "Monitor your account liabilities and upcoming payments real-time.",
      icon: <Clock size={32} className="text-[#800000]" />
    },
    {
      title: "Payment Reminders",
      text: "Receive timely notifications about your payment status.",
      icon: <Bell size={32} className="text-[#800000]" />
    },
    {
      title: "Digital Receipts",
      text: "Access payment receipts and transaction history anytime.",
      icon: <FileText size={32} className="text-[#800000]" />
    }
  ];

  const gcashBenefits = [
    { 
      title: "Zero Fees", 
      text: "No additional charges when paying with GCash.",
      icon: <PhilippinePeso size={24} className="text-[#002cb8]" />
    },
    { 
      title: "Convenient Payments", 
      text: "Skip the lines at school. Pay with just few taps.",
      icon: <Smartphone size={24} className="text-[#002cb8]" />
    },
    { 
      title: "24/7 Availability", 
      text: "Make payments anytime, anywhere.",
      icon: <Clock3 size={24} className="text-[#002cb8]" />
    },
    { 
      title: "Secure Transactions", 
      text: "Encrypted and protected transactions.",
      icon: <Shield size={24} className="text-[#002cb8]" />
    }
  ];

  // Function to open the terms modal
  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  return (
    <div className="bg-white font-roboto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Roboto:wght@400;500;700&family=Tinos:wght@400&display=swap');
        html {
          scroll-behavior: smooth;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px); /* Reduced from -10px to -8px */
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite; /* Slowed down from 5s to 6s */
          will-change: transform; /* Hardware acceleration hint */
        }
        
        .glow-effect {
          box-shadow: 0 0 15px rgba(128, 0, 0, 0.2);
          transition: box-shadow 0.3s ease;
          transform: translateZ(0); 
        }
        .glow-effect:hover {
          box-shadow: 0 0 25px rgba(128, 0, 0, 0.4);
        }
        
        /* Improve mobile menu animation */
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
          will-change: opacity, transform; 
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <header className="w-full bg-white shadow-md py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <img 
              src={student}
              alt="Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 transition-transform duration-300 hover:scale-105" 
            />
            <div className="text-[#800000] text-sm sm:text-xl font-tinos">
              THE HARBOARD UNIVERSITY
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex gap-8 text-base">
              <li 
                className={`cursor-pointer relative px-1 py-2 ${
                  activeSection === 'home' 
                    ? 'text-[#800000] font-bold' 
                    : 'text-gray-700 hover:text-[#800000]'
                }`}
                onClick={() => scrollToSection('home')}
              >
                Home
                {activeSection === 'home' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 h-0.5 bg-[#800000] w-full"
                    layoutId="navIndicator"
                    transition={{ type: "spring", duration: 0.3 }} 
                  />
                )}
              </li>
              <li 
                className={`cursor-pointer relative px-1 py-2 ${
                  activeSection === 'services' 
                    ? 'text-[#800000] font-bold' 
                    : 'text-gray-700 hover:text-[#800000]'
                }`}
                onClick={() => scrollToSection('services')}
              >
                Our Services
                {activeSection === 'services' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 h-0.5 bg-[#800000] w-full"
                    layoutId="navIndicator"
                    transition={{ type: "spring", duration: 0.3 }} 
                  />
                )}
              </li>
              <li 
                className={`cursor-pointer relative px-1 py-2 ${
                  activeSection === 'faqs' 
                    ? 'text-[#800000] font-bold' 
                    : 'text-gray-700 hover:text-[#800000]'
                }`}
                onClick={() => scrollToSection('faqs')}
              >
                FAQs
                {activeSection === 'faqs' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 h-0.5 bg-[#800000] w-full"
                    layoutId="navIndicator"
                    transition={{ type: "spring", duration: 0.3 }} 
                  />
                )}
              </li>
              <li 
                className={`cursor-pointer relative px-1 py-2 ${
                  activeSection === 'contact' 
                    ? 'text-[#800000] font-bold' 
                    : 'text-gray-700 hover:text-[#800000]'
                }`}
                onClick={() => scrollToSection('contact')}
              >
                Contact us
                {activeSection === 'contact' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 h-0.5 bg-[#800000] w-full"
                    layoutId="navIndicator"
                    transition={{ type: "spring", duration: 0.3 }} 
                  />
                )}
              </li>
            </ul>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? (
                <X size={24} className="text-[#800000]" />
              ) : (
                <Menu size={24} className="text-[#800000]" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white px-4 py-2 animate-fadeIn shadow-md">
            <ul className="flex flex-col space-y-3 py-2">
              <li 
                className={`cursor-pointer ${activeSection === 'home' ? 'text-[#800000] font-bold' : 'text-gray-700'}`}
                onClick={() => scrollToSection('home')}
              >
                Home
              </li>
              <li 
                className={`cursor-pointer ${activeSection === 'services' ? 'text-[#800000] font-bold' : 'text-gray-700'}`}
                onClick={() => scrollToSection('services')}
              >
                Our Services
              </li>
              <li 
                className={`cursor-pointer ${activeSection === 'faqs' ? 'text-[#800000] font-bold' : 'text-gray-700'}`}
                onClick={() => scrollToSection('faqs')}
              >
                FAQs
              </li>
              <li 
                className={`cursor-pointer ${activeSection === 'contact' ? 'text-[#800000] font-bold' : 'text-gray-700'}`}
                onClick={() => scrollToSection('contact')}
              >
                Contact us
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" ref={homeRef} className="w-full bg-[#f6f7f9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-raleway font-bold mb-6"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                style={{ willChange: "opacity, transform" }}
              >
                <span className="text-[#800000]">Student </span>
                <br />
                <span className="text-yellow-400">Payment</span>
                <br />
                <span className="text-[#800000]">Portal</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }} 
                className="text-base sm:text-lg text-gray-700 mb-8 max-w-xl"
                style={{ willChange: "opacity, transform" }}
              >
                Designed for students of The Harboard University, this portal provides simple and reliable way to handle your liabilities, monitor dues, and send payments.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }} 
                style={{ willChange: "opacity, transform" }} 
              >
                <button 
                  className="bg-[#f3ce73] text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-[#e3be63] transition-colors w-full sm:w-auto glow-effect"
                  onClick={() => window.location.href = '/admin-login'}
                >
                  Admin Login
                </button>
                <button 
                  className="bg-[#800000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#600000] transition-colors w-full sm:w-auto glow-effect"
                  onClick={() => window.location.href = '/student-login'}
                >
                  Student Login
                </button>
              </motion.div>
            </div>
            
            <motion.div 
              className="w-full md:w-1/2 mt-8 md:mt-0"
              variants={fadeInLeft}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }} 
              style={{ willChange: "opacity, transform" }} 
            >
              <img 
                src={student1}
                alt="Student" 
                className="w-full max-w-xl mx-auto float-animation"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section*/}
      <section id="services" ref={servicesRef} className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-center mb-8 sm:mb-12">
              Why Use Our <span className="text-[#800000]">Payment Portal</span>?
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection 
                key={index}
                className="bg-[#f6f7f9] p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#ffd700]/20"
                variants={zoomIn}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#800000] mb-4">{feature.title}</h3>
                  <p className="text-gray-700">{feature.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* GCash Section */}
      <section id="gcash" className="py-12 sm:py-16 bg-[#f6f7f9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col-reverse md:flex-row gap-12 items-center">
            <AnimatedSection 
              className="w-full md:w-1/2"
              variants={fadeInRight}
            >
              <img 
                src={student4}
                alt="GCash Payment" 
                className="w-full max-w-xl mx-auto mt-8 md:mt-0 float-animation"
                style={{ animationDelay: "1s", willChange: "transform" }} 
              />
            </AnimatedSection>
            
            <div className="w-full md:w-1/2">
              <AnimatedSection>
                <h2 className="text-2xl sm:text-3xl font-raleway font-bold mb-6">
                  Pay with <span className="text-[#007aff]">GCash</span>
                </h2>
              </AnimatedSection>
              
              <div className="space-y-6">
                {gcashBenefits.map((item, index) => (
                  <AnimatedSection 
                    key={index}
                    variants={fadeInRight}
                    transition={{ delay: index * 0.1 }} 
                  >
                    <div className="flex items-start p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-300">
                      <div className="mr-3 mt-1 bg-blue-100 p-2 rounded-full transform transition-transform duration-300 hover:scale-110">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#002cb8] mb-2">{item.title}</h3>
                        <p className="text-gray-700">{item.text}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" ref={faqsRef} className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-center mb-8 sm:mb-12">
              Frequently Asked Questions
            </h2>
          </AnimatedSection>

          <div className="space-y-4">
            {[
              {
                question: "What fees are covered by the student payment portal?",
                answer: "The student payment portal handles all of the university's organization's membership fees. You can view a complete breakdown of your membership fees in the Liabilities section after logging in. Each fee includes details about payment deadlines and the specific department or organization collecting the payment."
              },
              {
                question: "How do I pay using GCash?",
                answer: "After logging in to your student portal, navigate to the Liabilities section, select the fee you wish to pay, and click Upload Receipt. You can then scan the QR code using your GCash app or enter your GCash number. Once payment is complete, upload your receipt through the portal for verification."
              },
              {
                question: "What should I do if my payment isn't showing as verified?",
                answer: "Payments typically take 24-48 hours to be verified by our finance department. If your payment hasn't been verified after 48 hours, please check your Notifications tab for any updates. For unresolved issues, contact our Finance Office at finance@harboard.edu with your receipt number and transaction details."
              }
            ].map((faq, index) => (
              <AnimatedSection
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-[#800000]/30"
                variants={index % 2 === 0 ? fadeInRight : fadeInLeft}
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-4 cursor-pointer">
                    <h3 className="font-medium text-gray-800 group-open:text-[#800000] transition-colors">{faq.question}</h3>
                    <span className="text-yellow-500 group-open:rotate-180 transition-transform duration-300">▼</span>
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-100 animate-fadeIn">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" ref={contactRef} className="bg-[#f6f7f9] text-gray-700 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16" />
                <div className="text-[#800000] text-base sm:text-xl font-tinos">THE HARBOARD UNIVERSITY</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a onClick={() => scrollToSection('home')} className="hover:text-[#800000] cursor-pointer">Home</a></li>
                <li><a onClick={() => scrollToSection('services')} className="hover:text-[#800000] cursor-pointer">Our Services</a></li>
                <li><a onClick={() => scrollToSection('faqs')} className="hover:text-[#800000] cursor-pointer">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={openTermsModal} 
                    className="hover:text-[#800000] cursor-pointer"
                  >
                    Terms & Privacy
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>finance@harboard.edu</li>
                <li>+1 (123) 456-7890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-6 text-center">
            <p>© 2025 The Harboard University</p>
          </div>
        </div>
      </footer>

      {/* Terms and Privacy Policy Modal */}
      <TermsPrivacyModal 
        show={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </div>
  );
}