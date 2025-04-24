import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentPopup = ({ show, onClose, selectedLiability, onStatusChange }) => {
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [showFirstPopup, setShowFirstPopup] = useState(true);
  const [showSecondPopup, setShowSecondPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // mock database (para matest lang) // to persist uploaded receipts across liability status changes
  const [receiptStore, setReceiptStore] = useState({});

  useEffect(() => {
    // Reset states when main popup visibility changes
    if (show && selectedLiability) {
      // Check if this liability already has a receipt in our mock store
      const existingReceipt = receiptStore[selectedLiability.id];
      
      // For statuses other than "Unpaid", show second popup directly
      if (selectedLiability.status !== "Unpaid") {
        setShowFirstPopup(false);
        setShowSecondPopup(true);
        
        // Use the stored receipt if available, otherwise create a placeholder
        if (existingReceipt) {
          setReceiptFile(existingReceipt);
        } else if (selectedLiability.status === "Paid" || selectedLiability.status === "Under Review") {
          // Simulate a receipt image for already paid/reviewed liabilities
          const mockReceiptUrl = `/api/placeholder/217/368?text=Receipt-${selectedLiability.id}`;
          setReceiptFile(mockReceiptUrl);
          
          // Store this mock receipt in our store for future reference
          setReceiptStore(prev => ({
            ...prev,
            [selectedLiability.id]: mockReceiptUrl
          }));
        }
      } else {
        setShowFirstPopup(true);
        setShowSecondPopup(false);
        // Check if we have a stored receipt even for unpaid liability (could happen if status was changed back)
        if (existingReceipt) {
          setReceiptFile(existingReceipt);
        } else {
          setReceiptFile(null);
        }
      }
      setShowPopup(false);
      setReceiptUploaded(false);
      setIsExiting(false);
    }
  }, [show, selectedLiability, receiptStore]);

  // date format
  const formatDate = (dateString) => {
    if (!dateString) return 'MM/DD/YYYY';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}/${day}/${year}`;
    } catch (e) {
      return dateString; // Fallback to original format
    }
  };

  if (!show) return null;

  const handleUploadReceipt = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newReceiptUrl = URL.createObjectURL(file);
      setReceiptFile(newReceiptUrl);
      setReceiptUploaded(true);
      
      // Store the uploaded receipt in our mock database
      if (selectedLiability) {
        setReceiptStore(prev => ({
          ...prev,
          [selectedLiability.id]: newReceiptUrl
        }));
      }
      
      // transition between popups
      setIsExiting(true);
      setTimeout(() => {
        setShowFirstPopup(false);
        setShowSecondPopup(true);
        setIsExiting(false);
      }, 500);
    }
  };

  const handleCloseSecondPopup = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowSecondPopup(false);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleConfirmReceipt = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowSecondPopup(false);
      setIsExiting(false);
      
      // Update the liability status to "Under Review"
      onStatusChange("Under Review");
      
      // Delay before showing the Payment Sent popup
      setTimeout(() => {
        setShowPopup(true);
        
        // Handle auto-close 
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setShowPopup(false);
            onClose();
          }, 500);
        }, 4000);
      }, 1000);
    }, 500);
  };

  // Animation configurations for popups
  const backdropAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const popupAnimation = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const checkIconAnimation = {
    initial: { pathLength: 0 },
    animate: { pathLength: 1, transition: { duration: 1, ease: 'easeInOut' } },
    exit: { pathLength: 0, transition: { duration: 0.5, ease: 'easeIn' } },
  };

  const circleAnimation = {
    initial: { scale: 0 },
    animate: { scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { scale: 0, transition: { duration: 0.5, ease: 'easeIn' } },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid": return "#15aa07";
      case "Unpaid": return "#e53e3e";
      case "Under Review": return "#dd6b20";
      case "Rejected": return "#718096";
      default: return "#718096";
    }
  };
  
  // Get the fee name from the liability
  const getFeeName = () => {
    return selectedLiability?.feeName || selectedLiability?.name || "Computer Lab Fee";
  };

  return (
    <>
      {/* FIRST POPUP - UPLOAD RECEIPT */}
      <AnimatePresence mode="wait">
        {showFirstPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30"
            {...backdropAnimation}
            key="first-popup"
          >
            <motion.div
              className="w-[627px] h-[578px] relative bg-neutral-50 rounded-[15px] shadow-lg overflow-hidden"
              variants={popupAnimation}
              initial="initial"
              animate={isExiting ? "exit" : "animate"}
              exit="exit"
            >
              <div className="absolute top-[60px] w-full text-center text-black text-base font-semibold">
                {getFeeName()}
              </div>

              <div className="absolute left-[163px] top-[348px] text-black text-base font-semibold">
                Account Name:<br />Account Number:<br />Amount:<br />Date of Payment:
              </div>

              <div className="absolute left-[342px] top-[348px] text-black text-base font-normal">
                {selectedLiability?.accountName || 'John Doe'}<br />
                {selectedLiability?.accountNumber || '1234567890'}<br />
                ₱{selectedLiability?.amount || '0.00'}<br />
                {formatDate(selectedLiability?.dueDate)}
              </div>

              <div className="absolute left-[213px] top-[95px] w-[200px] h-[200px] border-4 border-maroon flex items-center justify-center">
                <span className="text-black text-lg text-center">QR Code</span>
              </div>

              <div className="absolute left-[145px] top-[310px] w-[337px] text-center text-black text-sm font-normal">
                Scan QR or enter the details below for payment.
              </div>

              <div className="absolute left-[167px] top-[474px] w-[143px] h-[46px] bg-white rounded-lg border border-black/30 overflow-hidden">
                <button 
                  onClick={handleClose} 
                  className="w-full h-full flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
                >
                  Close
                </button>
              </div>

              <div className="absolute left-[344px] top-[474px] w-[143px] h-[46px] bg-yellow rounded-lg overflow-hidden">
                <button 
                  onClick={handleUploadReceipt} 
                  className="w-full h-full flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
                  style={{ transition: "all 0.2s ease" }}
                >
                  {receiptUploaded ? 'Receipt Uploaded' : 'Upload Receipt'}
                </button>
              </div>

              <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECOND POPUP - CONFIRM RECEIPT */}
      <AnimatePresence mode="wait">
        {showSecondPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
            {...backdropAnimation}
            key="second-popup"
          >
            <motion.div
              className="w-[754px] h-[483px] relative bg-neutral-50 rounded-[15px] shadow-lg overflow-hidden"
              variants={popupAnimation}
              initial="initial"
              animate={isExiting ? "exit" : "animate"}
              exit="exit"
            >
              {/* Title - properly centered and with spacing from image */}
              {selectedLiability?.status === "Unpaid" ? (
                <div className="absolute top-[40px] left-[343px] text-black text-sm font-normal">
                  Please check if the details are correct.
                </div>
              ) : (
                <div className="absolute top-[80px] left-14 right-0 text-center text-black text-lg font-semibold">
                  Uploaded Receipt
                </div>
              )}

              {/* Buttons */}
              {selectedLiability?.status === "Unpaid" ? (
                <>
                  <div className="absolute left-[343px] top-[380px] w-[143px] h-[46px] bg-white rounded-lg border border-black/30 overflow-hidden">
                    <button 
                      onClick={handleCloseSecondPopup} 
                      className="w-full h-full flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="absolute left-[515px] top-[380px] w-[143px] h-[46px] bg-yellow rounded-lg overflow-hidden">
                    <button 
                      onClick={handleConfirmReceipt} 
                      className="w-full h-full flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
                      style={{ transition: "all 0.2s ease" }}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute left-[400px] bottom-[90px] w-[143px] h-[46px] bg-white rounded-lg border border-black/30 overflow-hidden">
                  <button 
                    onClick={handleCloseSecondPopup} 
                    className="w-full h-full flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Receipt image area */}
              <div className="absolute left-[90px] top-[55px] w-[217px] h-[368px] rounded-[9px] border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                {receiptFile ? (
                  <img className="w-full h-full object-cover" src={receiptFile} alt="Uploaded Receipt" />
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    {selectedLiability?.status !== "Unpaid" ? "Receipt Image" : "No receipt uploaded yet"}
                  </div>
                )}
              </div>

              {/* Account details */}
              <div className="absolute left-[343px] top-[109px] text-black text-base font-semibold">
                Payment for:
              </div>
              
              <div className="absolute left-[522px] top-[109px] text-black text-base font-normal">
                {getFeeName()}
              </div>

              <div className="absolute left-[343px] top-[139px] text-black text-base font-semibold">
                Account Name:<br />Account Number:<br />Reference Number:<br />Amount:<br />Date of Payment:
              </div>

              <div className="absolute left-[522px] top-[139px] text-black text-base font-normal">
                {selectedLiability?.accountName || 'John Doe'}<br />
                {selectedLiability?.accountNumber || '1234567890'}<br />
                {selectedLiability?.referenceNumber || 'REF123456'}<br />
                ₱{selectedLiability?.amount || '0.00'}<br />
                {formatDate(selectedLiability?.dueDate)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS POPUP */}
      <AnimatePresence mode="wait">
        {showPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            {...backdropAnimation}
            key="success-popup"
          >
            <motion.div
              className="w-[418px] h-[278px] relative bg-neutral-50 rounded-[10px] shadow-lg z-60" 
              variants={popupAnimation}
              initial="initial"
              animate={isExiting ? "exit" : "animate"}
              exit="exit"
            >
              <div
                className="absolute top-[10px] right-[10px] text-black text-xl font-semibold cursor-pointer px-2 py-1 rounded hover:bg-gray-200 transition duration-150"
                onClick={() => {
                  setIsExiting(true);
                  setTimeout(() => {
                    setShowPopup(false);
                    onClose();
                  }, 500);
                }}
              >
                ×
              </div>

              {/* Payment Sent  */}
              <div className="absolute top-[136px] left-0 right-0 text-center text-[#15aa07] text-xl font-semibold">
                Payment sent!
              </div>

              {/* Status Update */}
              <div className="absolute top-[165px] left-0 right-0 text-center text-[15px] font-normal">
                Please wait for confirmation,<br />
                Check your notification for updates.
              </div>

              {/* CHECK ICON */}
              <motion.div
                className="absolute top-[59px] left-[173px] w-[72px] h-[72px] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#15aa07"
                    strokeWidth="4"
                    fill="none"
                    variants={circleAnimation}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                  <motion.path
                    d="M24 36l8 8L48 28"
                    stroke="#15aa07"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={checkIconAnimation}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

//  to support fee name searching
const searchLiabilities = (liabilities, searchTerm) => {
  if (!searchTerm) return liabilities;
  
  searchTerm = searchTerm.toLowerCase();
  return liabilities.filter(liability => 
    liability.feeName?.toLowerCase().includes(searchTerm) || 
    liability.name?.toLowerCase().includes(searchTerm) || // In case fee name is stored in 'name' property
    liability.accountName?.toLowerCase().includes(searchTerm) ||
    liability.accountNumber?.toLowerCase().includes(searchTerm)
  );
};

export default PaymentPopup;