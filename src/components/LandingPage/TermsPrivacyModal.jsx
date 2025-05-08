// src/components/LandingPage/TermsPrivacyModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TermsPrivacyModal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState("terms");
  const [isExiting, setIsExiting] = useState(false);

  // Handle escape key to close the modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && show) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [show]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
      setActiveTab("terms"); // Reset to terms tab when closing
    }, 300);
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: { 
        duration: 0.2
      }
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          initial="hidden"
          animate={isExiting ? "exit" : "visible"}
          exit="exit"
          variants={backdropVariants}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white w-full max-w-4xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with tabs */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
              <div className="flex justify-between items-center px-6 pt-4">
                <h2 className="text-xl font-bold text-gray-800">Legal Information</h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b pt-2">
                <button
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "terms"
                      ? "text-[#800000] border-b-2 border-[#800000]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("terms")}
                >
                  Terms of Service
                </button>
                <button
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "privacy"
                      ? "text-[#800000] border-b-2 border-[#800000]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("privacy")}
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Content area - scrollable */}
            <div className="overflow-y-auto p-6 max-h-[calc(80vh-120px)]">
              {activeTab === "terms" ? (
                <div className="terms-content">
                  <h3 className="text-lg font-bold text-[#800000] mb-4">Terms of Service</h3>
                  <p className="mb-4">
                    These Terms of Service ("Terms") govern your access to and use of The Harboard University Student Payment Portal. By accessing or using the Portal, you agree to be bound by these Terms.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">1. Acceptance of Terms</h4>
                  <p className="mb-4">
                    By accessing and using The Harboard University Student Payment Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Portal.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">2. User Accounts</h4>
                  <p className="mb-4">
                    To access and use the Portal, you must register for a user account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Provide accurate, current, and complete information during the registration process.</li>
                    <li>Maintain and promptly update your account information.</li>
                    <li>Keep your password secure and confidential.</li>
                    <li>Be solely responsible for all activities that occur under your account.</li>
                    <li>Notify us immediately of any unauthorized use of your account or any other breach of security.</li>
                  </ul>

                  <h4 className="text-md font-semibold mb-2 mt-6">3. Payment Processing</h4>
                  <p className="mb-4">
                    The Portal facilitates the payment of school fees and other liabilities. By using our payment services, you agree to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Provide accurate payment information.</li>
                    <li>Authorize us to charge your chosen payment method for fees owed.</li>
                    <li>Be responsible for any additional charges or fees imposed by your payment provider.</li>
                    <li>Submit valid and authentic payment receipts when using manual verification options.</li>
                  </ul>

                  <h4 className="text-md font-semibold mb-2 mt-6">4. User Conduct</h4>
                  <p className="mb-4">
                    While using the Portal, you agree not to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Violate any applicable laws or regulations.</li>
                    <li>Submit false or misleading information.</li>
                    <li>Attempt to gain unauthorized access to other user accounts or system areas.</li>
                    <li>Upload malicious software or content.</li>
                    <li>Interfere with the proper functioning of the Portal.</li>
                  </ul>

                  <h4 className="text-md font-semibold mb-2 mt-6">5. Modifications to Terms</h4>
                  <p className="mb-4">
                    The Harboard University reserves the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on the Portal. Your continued use of the Portal after such changes constitutes your acceptance of the revised Terms.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">6. Limitation of Liability</h4>
                  <p className="mb-4">
                    To the maximum extent permitted by law, The Harboard University shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your access to or use of the Portal.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">7. Governing Law</h4>
                  <p className="mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in the Philippines.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">8. Contact Information</h4>
                  <p className="mb-4">
                    If you have any questions about these Terms, please contact us at finance@harboard.edu.
                  </p>

                  <p className="text-sm text-gray-500 mt-6">
                    Last updated: May 01, 2025
                  </p>
                </div>
              ) : (
                <div className="privacy-content">
                  <h3 className="text-lg font-bold text-[#800000] mb-4">Privacy Policy</h3>
                  <p className="mb-4">
                    This Privacy Policy explains how The Harboard University collects, uses, and protects your personal information when you use the Student Payment Portal. We are committed to protecting your privacy and ensuring the security of your personal information.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">1. Information We Collect</h4>
                  <p className="mb-4">
                    We collect the following types of information when you use the Portal:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Personal Information:</strong> Name, student ID, email address, phone number, and other identifying information necessary for account management.</li>
                    <li><strong>Payment Information:</strong> Transaction details, payment receipts, and payment references when you make payments through the Portal.</li>
                    <li><strong>Usage Information:</strong> Information about how you access and use the Portal, including login timestamps, IP address, browser type, and pages visited.</li>
                    <li><strong>Device Information:</strong> Information about the device you use to access the Portal, including device type, operating system, and unique device identifiers.</li>
                  </ul>

                  <h4 className="text-md font-semibold mb-2 mt-6">2. How We Use Your Information</h4>
                  <p className="mb-4">
                    We use your information for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>To process and verify your payments.</li>
                    <li>To maintain and manage your student account.</li>
                    <li>To send payment confirmations and notifications about your account.</li>
                    <li>To provide customer support and respond to your inquiries.</li>
                    <li>To improve the Portal's functionality and user experience.</li>
                    <li>To detect and prevent fraudulent activities or unauthorized access.</li>
                    <li>To comply with legal obligations and enforce our terms of service.</li>
                  </ul>

                  <h4 className="text-md font-semibold mb-2 mt-6">3. Data Security</h4>
                  <p className="mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, alteration, or disclosure. While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">4. Data Retention</h4>
                  <p className="mb-4">
                    We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. Payment records may be kept for a minimum of seven years as required by applicable financial regulations.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">5. Your Rights</h4>
                  <p className="mb-4">
                    Depending on your location, you may have certain rights regarding your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>The right to access your personal information.</li>
                    <li>The right to correct inaccurate or incomplete information.</li>
                    <li>The right to request deletion of your personal information.</li>
                    <li>The right to restrict or object to certain processing of your personal information.</li>
                    <li>The right to data portability.</li>
                  </ul>
                  <p className="mb-4">
                    To exercise these rights, please contact us at privacy@harboard.edu.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">6. Third-Party Services</h4>
                  <p className="mb-4">
                    The Portal may use third-party services for payment processing (such as GCash). These third parties have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these third-party services.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">7. Cookies and Similar Technologies</h4>
                  <p className="mb-4">
                    The Portal may use cookies and similar tracking technologies to enhance your user experience, analyze usage patterns, and improve our services. You can control cookie settings through your browser preferences.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">8. Changes to This Privacy Policy</h4>
                  <p className="mb-4">
                    We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on the Portal and updating the "Last updated" date.
                  </p>

                  <h4 className="text-md font-semibold mb-2 mt-6">9. Contact Information</h4>
                  <p className="mb-4">
                    If you have any questions or concerns about this Privacy Policy, please contact us at privacy@harboard.edu.
                  </p>

                  <p className="text-sm text-gray-500 mt-6">
                    Last updated: May 01, 2025
                  </p>
                </div>
              )}
            </div>

            {/* Footer with accept button */}
            <div className="bg-white sticky bottom-0 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors shadow-sm"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsPrivacyModal;