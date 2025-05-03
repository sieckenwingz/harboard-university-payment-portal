//view icon sa student payments sa liabilities sidebar

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../App";

const PaymentReceiptModal = ({ 
  studentFee, 
  formatAmount, 
  formatDate, 
  onClose, 
  onConfirm, 
  onReject 
}) => {
  const [receiptUrl, setReceiptUrl] = useState(null);

  /**
   * TODO: Move (Duplicate from PaymentPopup.jsx)
   * 
   * Automatically fetch the receipt signed url everytime the [receiptPath] of
   * the [selectedLiability] changes.
   */
  useEffect(() => {
    async function fetchImage() {
      if (studentFee?.paymentId == null) return;

      console.log(studentFee.paymentId.receiptPath);

      const { data, error } = await supabase
        .storage
        .from('receipts')
        .createSignedUrl(studentFee.paymentId.receiptPath, 60); // path inside bucket

      if (data?.signedUrl) {
        setReceiptUrl(data.signedUrl);
      } else {
        console.error(error);
      }
    }

    fetchImage();
  }, [studentFee?.paymentId?.receiptPath]);
    
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl mx-auto relative w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Payment Receipt</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="relative px-4 pb-60 pt-6">
          {/* Receipt image area */}
          <div className="absolute left-6 top-0 w-48 h-64 rounded-lg border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
            {receiptUrl ? (
              <img 
                src={receiptUrl}
                alt="Payment Receipt"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500 text-center p-4">
                Receipt Image
              </div>
            )}
          </div>
          
          {/* Payment details */}
          <div className="absolute left-64 top-0 text-gray-600 font-medium">
            Payment for:<br />
            Student Name:<br />
            SR Code:<br />
            Reference Number:<br />
            Amount:<br />
            Date of Payment:
            {studentFee.status === "verified" && (
              <>
                <br />Verified Date:<br />
                Verified By:
              </>
            )}
            {studentFee.status === "rejected" && (
              <>
                <br />Rejected Date:<br />
                Rejected By:<br />
                Reason:
              </>
            )}
          </div>

          {/* Payment details */}
          <div className="absolute left-[430px] top-0 font-medium">
            {studentFee.feeId.name}<br />
            {studentFee.studentId.getFullName()}<br />
            {studentFee.studentId.srCode}<br />
            {studentFee.paymentId.refNo}<br />
            {formatAmount(studentFee.paymentId.amount)}<br />
            {formatDate(studentFee.paymentId.paymentDate)}
            {studentFee.status === "verified" && (
              <>
                <br />{formatDate(studentFee.verifiedDate)}<br />
                {studentFee.verifiedBy}
              </>
            )}
            {studentFee.status === "rejected" && (
              <>
                <br />{formatDate(studentFee.rejectedDate)}<br />
                {studentFee.rejectedBy}<br />
                <span className="text-red-600">{studentFee.rejectionReason}</span>
              </>
            )}
          </div>
          
          {studentFee.transactionVerified && (
            <div className="absolute left-64 top-[280px] font-medium text-green-600">
              ✓ Verified by automatic transaction matching
            </div>
          )}
        </div>
        
        {onConfirm && onReject && (
          <div className="flex justify-end mt-4 gap-4">
            {onReject && (
              <button 
                onClick={() => onReject(studentFee.id)}
                className="px-4 py-2 text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: "#CA797C" }}
              >
                Reject
              </button>
            )}
            
            {onConfirm && (
              <button 
                onClick={() => onConfirm(studentFee.id)}
                className="px-4 py-2 text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: "#90D18A", color: "#000" }}
              >
                Confirm
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PaymentReceiptModal;
