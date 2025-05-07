// view icon sa student payments
// management sidebar

import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { formatAmount, formatDate } from "../../Utils";

const ManageReceiptView = ({ receipt, onClose }) => {
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
            {receipt.receiptImage ? (
              <img 
                src={receipt.receiptImage} 
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
            {receipt.status === "Accepted" && (
              <>
                <br />Verified Date:<br />
                Verified By:
              </>
            )}
            {receipt.status === "Rejected" && (
              <>
                <br />Rejected Date:<br />
                Rejected By:<br />
                Reason:
              </>
            )}
          </div>

          {/* Payment details */}
          <div className="absolute left-[430px] top-0 font-medium">
            {receipt.liabilityName || 'Fee Payment'}<br />
            {receipt.studentName}<br />
            {receipt.studentId}<br />
            {receipt.referenceNo || 'N/A'}<br />
            {formatAmount(receipt.amount)}<br />
            {formatDate(receipt.paymentDate)}
            {receipt.status === "Accepted" && (
              <>
                <br />{formatDate(receipt.verifiedDate || receipt.paymentDate)}<br />
                {receipt.verifiedBy || 'System Admin'}
              </>
            )}
            {receipt.status === "Rejected" && (
              <>
                <br />{formatDate(receipt.rejectedDate || receipt.paymentDate)}<br />
                {receipt.rejectedBy || 'System Admin'}<br />
                <span className="text-red-600">{receipt.rejectionReason || 'Invalid payment documentation'}</span>
              </>
            )}
          </div>
          
          {receipt.transactionVerified && (
            <div className="absolute left-64 top-[280px] font-medium text-green-600">
              ✓ Verified by automatic transaction matching
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ManageReceiptView;