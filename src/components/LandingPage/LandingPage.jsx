import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import studentIcon from "../../assets/student.png";
import adminIcon from "../../assets/admin.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior, Business Administration",
      text: "The new payment portal made tracking my tuition payments so much easier this semester!"
    },
    {
      name: "Michael Chen",
      role: "Freshman, Computer Science",
      text: "I love how I can see all my financial aid and pending charges in one place."
    },
    {
      name: "Olivia Rodriguez",
      role: "Junior, Psychology",
      text: "Setting up a payment was straightforward, and I get notifications before each due date."
    }
  ];

  // Cycle through testimonials automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[var(--maroon,#800000)] to-gray-900 text-white overflow-x-hidden">
      {/* Updated Announcement Banner */}
      <div className="bg-yellow-500 text-black py-3 px-4 text-center font-medium flex items-center justify-center">
        <span className="text-base"> </span>
      </div>

      {/* Improved Header Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative px-6">
        {/* Enhanced Background animation */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-yellow-300 rounded-full blur-[140px] opacity-10 top-10 left-[-80px]" />
          <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-[140px] opacity-15 top-60 right-20" />
          <div className="absolute w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-10 bottom-10 right-[-60px]" />
        </div>

        {/* Logo */}
        <motion.img
          src={logo}
          alt="Logo"
          className="w-36 h-36 z-10 hover:scale-105 transition-transform duration-300 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        />

        {/* University Name */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold font-['Tinos'] text-center mt-4 z-10"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          THE HARBOARD UNIVERSITY
        </motion.h1>

        {/* Payment System Name */}
        <motion.h2
          className="text-2xl md:text-3xl font-regular text-center mt-2 text-yellow-300 z-10"
          custom={1.5}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          Student Payment Portal
        </motion.h2>

        {/* Enhanced Motto / Quote */}
        <motion.p
          className="text-center text-lg italic mt-4 text-neutral-200 font-light z-10 max-w-2xl"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          "Empowering Minds, Building Futures."
        </motion.p>


        {/* Scroll Down */}
        <motion.p
          className="mt-12 text-neutral-300 text-sm animate-bounce z-10"
          custom={6}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          Scroll to continue ↓
        </motion.p>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-black/30 backdrop-blur-sm">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          Why Use Our Financial Portal?
        </motion.h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            className="bg-gradient-to-br from-maroon/40 to-black/40 p-6 rounded-xl backdrop-blur-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1}
          >
            <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-black text-xl">💰</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Liabilities Tracking</h3>
            <p className="text-neutral-300">Monitor your account liabilities, upcoming payments real-time.</p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="bg-gradient-to-br from-maroon/40 to-black/40 p-6 rounded-xl backdrop-blur-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1.5}
          >
            <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-black text-xl">🔔</div>
            <h3 className="text-xl font-semibold mb-2">Payment Reminders</h3>
            <p className="text-neutral-300">Receive timely notifications about upcoming dues and important deadlines.</p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="bg-gradient-to-br from-maroon/40 to-black/40 p-6 rounded-xl backdrop-blur-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={2}
          >
            <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-black text-xl">📄</div>
            <h3 className="text-xl font-semibold mb-2">Digital Receipts</h3>
            <p className="text-neutral-300">Access payment receipts and transaction history anytime.</p>
          </motion.div>
        </div>
      </section>
      
      {/* GCash Payment Section - ADDED */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-900/30 to-black/30">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center mb-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          Pay with GCash
        </motion.h2>
        
        <motion.p
          className="text-center text-lg mb-12 max-w-3xl mx-auto text-neutral-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={1}
        >
          Simple, fast, and secure payments - directly from your GCash wallet
        </motion.p>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-blue-500/20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1}
          >
            <h3 className="text-2xl font-bold mb-4 text-blue-400">How It Works</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</div>
                <p>Log in to your Student Financial Portal</p>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</div>
                <p>Select "Pay with GCash" and enter your payment amount</p>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</div>
                <p>Scan the QR code using your GCash app or enter your GCash number</p>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">4</div>
                <p>Confirm payment and receive your digital receipt instantly</p>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-blue-500/20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1.5}
          >
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Benefits</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-blue-400 text-2xl mr-3">✓</div>
                <div>
                  <h4 className="font-medium">Zero Transaction Fees</h4>
                  <p className="text-sm text-neutral-400">No additional charges when paying with GCash</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-blue-400 text-2xl mr-3">✓</div>
                <div>
                  <h4 className="font-medium">Instant Confirmation</h4>
                  <p className="text-sm text-neutral-400">Your payment is processed and confirmed immediately</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-blue-400 text-2xl mr-3">✓</div>
                <div>
                  <h4 className="font-medium">Available 24/7</h4>
                  <p className="text-sm text-neutral-400">Make payments anytime, anywhere</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-blue-400 text-2xl mr-3">✓</div>
                <div>
                  <h4 className="font-medium">Secure Transactions</h4>
                  <p className="text-sm text-neutral-400">All payments are encrypted and protected</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-black/20">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          Student Experiences
        </motion.h2>

        <motion.div 
          className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm p-8 rounded-xl relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={1}
        >
          <div className="text-5xl text-yellow-300/30 absolute top-4 left-4">"</div>
          <p className="text-lg italic mb-4 pt-6">{testimonials[currentTestimonial].text}</p>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
              {testimonials[currentTestimonial].name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="font-medium">{testimonials[currentTestimonial].name}</p>
              <p className="text-sm text-neutral-400">{testimonials[currentTestimonial].role}</p>
            </div>
          </div>
          
          {/* Testimonial Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full ${currentTestimonial === index ? 'bg-yellow-400' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: "When are tuition payments due?",
              answer: "Tuition payments for Spring 2025 are due by May 15, 2025. Please make your payment via GCash before this date to secure your enrollment."
            },
            {
              question: "How do I pay using GCash?",
              answer: "After logging in to the portal, click on 'Make Payment', select GCash as your payment method, and follow the on-screen instructions to complete your payment."
            },
            {
              question: "Is GCash the only payment method available?",
              answer: "Yes, currently we only accept payments through GCash. This helps us streamline the payment process and provide instant confirmations."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={index * 0.3 + 1}
            >
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer">
                  <h3 className="font-medium text-lg">{faq.question}</h3>
                  <span className="text-yellow-400 group-open:rotate-180 transition-transform duration-300">▼</span>
                </summary>
                <div className="p-6 pt-0 border-t border-white/10">
                  <p className="text-neutral-300">{faq.answer}</p>
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portal Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-black/50 text-white relative z-10">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center text-white mb-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          Access Your Portal
        </motion.h2>
        
        <motion.p
          className="text-center text-lg mb-12 max-w-3xl mx-auto text-neutral-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={1}
        >
          Manage your financial responsibilities with our secure online portal
        </motion.p>

        <div className="flex flex-col md:flex-row gap-10 z-10 items-center justify-center">
          {/* Student Card */}
          <motion.div
            onClick={() => navigate("/student-login")}
            className="cursor-pointer bg-white text-black p-10 rounded-3xl w-80 h-96 shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 transition-all duration-300 flex flex-col justify-between items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1}
          >
            <motion.img 
              src={studentIcon} 
              alt="Student" 
              className="w-24 h-24 rounded-full mb-4"
              initial="initial"
              animate="animate"
              variants={floatingAnimation}
            />
            <h3 className="text-2xl font-bold mb-2">Student Portal</h3>
            <p className="text-center text-sm text-gray-700 mb-4">
              View your balance, make payments via GCash, and monitor your dues with ease.
            </p>
            <button className="bg-maroon text-white py-2 px-6 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300">
              Student Login
            </button>
          </motion.div>

          {/* Admin Card */}
          <motion.div
            onClick={() => navigate("/admin-login")}
            className="cursor-pointer bg-white text-black p-10 rounded-3xl w-80 h-96 shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 transition-all duration-300 flex flex-col justify-between items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={2}
          >
            <motion.img 
              src={adminIcon} 
              alt="Admin" 
              className="w-24 h-24 rounded-full mb-4"
              initial="initial"
              animate="animate"
              variants={floatingAnimation}
            />
            <h3 className="text-2xl font-bold mb-2">Admin Portal</h3>
            <p className="text-center text-sm text-gray-700 mb-4">
              Process payments, manage student records, verify receipts, and oversee transactions efficiently.
            </p>
            <button className="bg-maroon text-white py-2 px-6 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300">
              Admin Login
            </button>
          </motion.div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="bg-yellow-500 text-black py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Need assistance with your payment?</h2>
            <p className="text-yellow-900">Our financial advisors are here to help you with GCash payments.</p>
          </div>
          <button className="bg-black text-white py-3 px-8 rounded-full hover:bg-maroon transition-all duration-300 whitespace-nowrap">
            Contact Support
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 text-neutral-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div>
              <img src={logo} alt="Logo" className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">The Harboard University</h3>
              <p className="text-sm max-w-xs">Empowering students with transparent financial management tools since 1997.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Financial Aid</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Scholarships</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">GCash Payments</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Tuition Rates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact Finance Office</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Technical Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>123 University Ave, Cambridge, MA</li>
                <li>finance@harboard.edu</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 The Harboard University. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;