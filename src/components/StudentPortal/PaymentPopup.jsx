import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../App';
import { processOcr } from '../../lib/ocr/Ocr';
import { uploadReceiptAndInsertPayment } from '../../lib/data/UploadPayment';
import { formatAmount, formatDate } from '../../Utils';

const PaymentPopup = ({ show, onClose, selectedLiability, onStatusChange }) => {
  const {user, _} = useAuth();

  const [refNoEdit, setRefNoEdit] = useState(null);
  const [amountEdit, setAmountEdit] = useState(null);
  const [dateEdit, setDateEdit] = useState(null);

  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showFirstPopup, setShowFirstPopup] = useState(true);
  const [showSecondPopup, setShowSecondPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if we're in "view" mode or "payment" mode
  const isViewMode = selectedLiability && selectedLiability.status !== "Unpaid";

  /**
   * Fetch QR code URL when the selectedLiability changes
   */
  useEffect(() => {
    async function fetchImage() {
      if (selectedLiability?.feeId?.qrCode == null) return;

      const { data, error } = await supabase
        .storage
        .from('fee-qr-codes')
        .createSignedUrl(selectedLiability?.feeId?.qrCode, 60); // path inside bucket

      if (data?.signedUrl) {
        setQrCodeUrl(data.signedUrl);
      } else {
        console.error(error);
      }
    }

    fetchImage();
  }, [selectedLiability?.feeId?.qrCode]);

  /**
   * Reset edit field values everytime the selectedLiability changes
   */
  useEffect(() => {
    setRefNoEdit(selectedLiability?.paymentId?.refNo);
    setAmountEdit(selectedLiability?.paymentId?.amount);
    setDateEdit(selectedLiability?.paymentId?.paymentDate);
  }, [selectedLiability]);

  /**
   * Fetch receipt image URL when the selectedLiability changes
   */
  useEffect(() => {
    async function fetchImage() {
      if (selectedLiability?.paymentId == null) return;

      const { data, error } = await supabase
        .storage
        .from('receipts')
        .createSignedUrl(selectedLiability.paymentId.receiptPath, 60); // path inside bucket

      if (data?.signedUrl) {
        setReceiptUrl(data.signedUrl);
      } else {
        console.error(error);
      }
    }

    fetchImage();
  }, [selectedLiability?.paymentId?.receiptPath]);

  useEffect(() => {
    // Reset states when main popup visibility changes
    if (show && selectedLiability) {
      // For statuses other than "Unpaid", show second popup directly
      if (selectedLiability.status !== "Unpaid") {
        setShowFirstPopup(false);
        setShowSecondPopup(true);
      } else {
        setShowFirstPopup(true);
        setShowSecondPopup(false);
      }
      setShowPopup(false);
      setReceiptUploaded(false);
      setIsExiting(false);
    }
  }, [show, selectedLiability]);

  if (!show) return null;

  const handleOcr = async (file) => {
    if (!file) {
      alert('Please upload an image first.');
      return;
    }

    setLoading(true);
    
    const data = await processOcr(file);

    setRefNoEdit(data.refNo);
    setAmountEdit(data.amount);
    setDateEdit(data.date);

    setLoading(false);

    // transition between popups
    setIsExiting(true);
    setTimeout(() => {
      setShowFirstPopup(false);
      setShowSecondPopup(true);
      setIsExiting(false);
    }, 500);
  };

  const handleUploadReceipt = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReceiptFile(file);
      handleOcr(URL.createObjectURL(file));     
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

  const handleConfirmReceipt = async () => {
    setLoading(true);

    const { error } = await uploadReceiptAndInsertPayment({
      userId: user.id, 
      receiptFile: receiptFile, 
      amount: amountEdit, 
      refNo: refNoEdit, 
      date: dateEdit, 
      selectedLiabilityId: selectedLiability.id,
    });

    setLoading(false);
    if (error) {
      alert('Error submitting payment. Please check your internet connection and ensure the receipt you\'re uploading hasn\'t been submitted before.');
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setShowSecondPopup(false);
        setIsExiting(false);
        
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
    }
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
    return selectedLiability?.feeName || selectedLiability?.feeId.name || "Computer Lab Fee";
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
                {selectedLiability?.feeId.collectorName}<br />
                {selectedLiability?.feeId.accountNumber}<br />
                {formatAmount(selectedLiability?.feeId.amount)}<br />
                {formatDate(selectedLiability?.feeId.deadline)}
              </div>

              <div className="absolute left-[213px] top-[95px] w-[200px] h-[200px] border-4 border-maroon flex items-center justify-center">
                {selectedLiability?.feeId?.qrCode ? <img className="w-full h-full object-cover" src={qrCodeUrl} alt="QR Code" />
                : <span className="text-black text-lg text-center">QR Code</span>}
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

              <div className={`absolute left-[344px] top-[474px] w-[143px] h-[46px] rounded-lg overflow-hidden ${loading ? 'bg-gray-300' : 'bg-yellow'}`}>
                <button 
                  disabled={loading}
                  onClick={handleUploadReceipt} 
                  className="w-full h-full flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
                  style={{ transition: "all 0.2s ease" }}
                >
                  {loading ? 'Processing...' : receiptUploaded ? 'Receipt Uploaded' : 'Upload Receipt'}
                </button>
              </div>

              <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECOND POPUP - CONFIRM RECEIPT or VIEW RECEIPT */}
      <AnimatePresence mode="wait">
        {showSecondPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
            {...backdropAnimation}
            key="second-popup"
          >
            <motion.div
              className="w-[800px] h-[600px] relative bg-neutral-50 rounded-[15px] shadow-lg overflow-hidden"
              variants={popupAnimation}
              initial="initial"
              animate={isExiting ? "exit" : "animate"}
              exit="exit"
            >
              {/* Header with title */}
              <div className="absolute top-[20px] left-0 right-0 px-6">
                <h2 className="text-lg font-bold">
                  {isViewMode ? "Payment Receipt" : "Upload Receipt"}
                </h2>
              </div>

              {/* Subtitle - visible and clearly aligned */}
              <div className="absolute top-[60px] left-0 right-0 px-6 text-black text-base font-medium">
                {selectedLiability?.status === "Unpaid" 
                  ? "Please check if the details are correct."
                  : "Payment Details"
                }
              </div>

              {/* Receipt image area - larger size for better visibility */}
              <div className="absolute left-[90px] top-[100px] w-[250px] h-[400px] rounded-[9px] border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                {receiptFile ? (
                  <img className="w-full h-full object-contain" src={URL.createObjectURL(receiptFile)} alt="Uploaded Receipt" />
                ) : receiptUrl ? (
                  <img className="w-full h-full object-contain" src={receiptUrl} alt="Uploaded Receipt" />
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    {selectedLiability?.status !== "Unpaid" ? "Receipt Image" : "No receipt uploaded yet"}
                  </div>
                )}
              </div>

              {/* Payment Details - GRID LAYOUT with better spacing */}
              <div className="absolute left-[370px] top-[100px] w-[370px]">
                <div className="grid grid-cols-[160px_1fr] gap-y-6">
                  <div className="text-black text-base font-semibold">Payment for:</div>
                  <div className="text-black text-base font-normal truncate" title={getFeeName()}>
                    {getFeeName()}
                  </div>
                  
                  <div className="text-black text-base font-semibold">Account Name:</div>
                  <div className="text-black text-base font-normal truncate" title={selectedLiability?.feeId.collectorName}>
                    {selectedLiability?.feeId.collectorName}
                  </div>
                  
                  <div className="text-black text-base font-semibold">Account Number:</div>
                  <div className="text-black text-base font-normal truncate" title={selectedLiability?.feeId.accountNumber}>
                    {selectedLiability?.feeId.accountNumber}
                  </div>
                  
                  <div className="text-black text-base font-semibold">Fee amount:</div>
                  <div className="text-black text-base font-normal truncate" title={selectedLiability?.feeId.accountNumber}>
                    {formatAmount(selectedLiability?.feeId.amount)}
                  </div>

                  <hr style={{ margin: '20px 0', borderColor: '#ccc' }} />
                  <hr style={{ margin: '20px 0', borderColor: '#ccc' }} />
                  
                  <div className="text-black text-base font-semibold">Reference Number:</div>
                  <div className="text-black text-base font-normal truncate" title={refNoEdit}>
                    {refNoEdit}
                  </div>
                  
                  <div className="text-black text-base font-semibold">Amount paid:</div>
                  <div className="text-black text-base font-normal truncate" title={formatAmount(amountEdit || selectedLiability?.feeId?.amount)}>
                    {formatAmount(amountEdit || selectedLiability?.feeId?.amount)}
                  </div>
                  
                  <div className="text-black text-base font-semibold">Date of Payment:</div>
                  <div className="text-black text-base font-normal">
                    {formatDate(dateEdit || selectedLiability?.paymentId?.paymentDate)}
                  </div>
                  
                  {isViewMode && selectedLiability.status === "Paid" && (
                    <>
                      <div className="text-black text-base font-semibold">Status:</div>
                      <div className="text-green-600 text-base font-medium">
                        Verified
                      </div>
                      
                      <div className="text-black text-base font-semibold">Verification Date:</div>
                      <div className="text-black text-base font-normal">
                        {formatDate(selectedLiability.paymentId?.statusLastChangedAt)}
                      </div>
                    </>
                  )}
                  
                  {isViewMode && selectedLiability.status === "Rejected" && (
                    <>
                      <div className="text-black text-base font-semibold">Status:</div>
                      <div className="text-red-600 text-base font-medium">
                        Rejected
                      </div>
                      
                      <div className="text-black text-base font-semibold">Reason:</div>
                      <div className="text-red-600 text-base font-normal">
                        {selectedLiability.rejectionReason || "Payment verification failed"}
                      </div>
                    </>
                  )}
                  
                  {isViewMode && selectedLiability.status === "Under Review" && (
                    <>
                      <div className="text-black text-base font-semibold">Status:</div>
                      <div className="text-orange-600 text-base font-medium">
                        Under Review
                      </div>
                      
                      <div className="text-black text-base font-semibold">Submitted:</div>
                      <div className="text-black text-base font-normal">
                        {formatDate(selectedLiability.paymentId?.createdAt)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Buttons */}
              {selectedLiability?.status === "Unpaid" ? (
                <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 flex space-x-8">
                  <button 
                    onClick={handleCloseSecondPopup} 
                    className="w-[143px] h-[46px] bg-white rounded-lg border border-black/30 flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (selectedLiability.amount != amountEdit) {
                        let ans = confirm('The fee amount does not match the amount paid. Comfirm anyway?');
                        if (!ans) {
                          return;
                        }
                      }
                      handleConfirmReceipt();
                    }} 
                    className="w-[143px] h-[46px] bg-yellow rounded-lg flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
                    style={{ transition: "all 0.2s ease" }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              ) : (
                <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2">
                  <button 
                    onClick={handleCloseSecondPopup} 
                    className="w-[143px] h-[46px] bg-white rounded-lg border border-black/30 flex items-center justify-center text-black text-base font-normal transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
                  >
                    Close
                  </button>
                </div>
              )}
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

export default PaymentPopup;