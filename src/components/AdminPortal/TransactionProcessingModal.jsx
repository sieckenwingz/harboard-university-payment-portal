//modal for gcash processing

import React from "react";
import { X, FileText, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const TransactionProcessingModal = ({
  isParsing,
  parseResults,
  formatAmount,
  onClose,
  onVerifyAllMatched,
  onRejectAllUnmatched
}) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto relative w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            GCash Transaction Processing
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isParsing}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        {isParsing ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a63f42] mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Processing GCash transaction history...</p>
            <p className="text-sm text-gray-500 mt-2">Extracting transaction data and matching with student payments</p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <FileText size={20} className="text-[#a63f42] mr-2" />
                <h3 className="text-lg font-medium">OCR Results</h3>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Total Transactions Processed:</span>
                  <span className="font-medium">{parseResults.gcashHistory.length}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-green-700">Matched Student Payments:</span>
                  <span className="font-medium text-green-700">{parseResults.matched.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-maroon">Unmatched Student Payments:</span>
                  <span className="font-medium text-maroon">{parseResults.unmatched.length}</span>
                </div>
              </div>
            </div>
            
            {parseResults.matched.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Matched Payments</h3>
                  <button
                    onClick={onVerifyAllMatched}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                  >
                    <CheckCircle size={16} className="mr-1.5" /> 
                    Verify All Matched
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 overflow-auto max-h-48">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-gray-700 uppercase border-b">
                        <th className="px-2 py-2 text-left">Student</th>
                        <th className="px-2 py-2 text-left">SR Code</th>
                        <th className="px-2 py-2 text-left">Reference No.</th>
                        <th className="px-2 py-2 text-left">Amount</th>
                        <th className="px-2 py-2 text-left">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResults.matched.map(student => (
                        <tr key={student.id} className="border-b border-green-100">
                          <td className="px-2 py-2 whitespace-nowrap">{student.name}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{student.srCode}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{student.referenceNo}</td>
                          <td className="px-2 py-2 text-left whitespace-nowrap">{formatAmount(student.amountPaid)}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{student.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {parseResults.unmatched.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Unmatched Payments</h3>
                  <button
                    onClick={onRejectAllUnmatched}
                    className="px-3 py-1.5 bg-maroon text-white rounded-md hover:bg-red-700 flex items-center text-sm"
                  >
                    <XCircle size={16} className="mr-1.5" /> 
                    Reject All Unmatched
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-48">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-gray-700 uppercase border-b">
                        <th className="px-2 py-2 text-left">Student</th>
                        <th className="px-2 py-2 text-left">SR Code</th>
                        <th className="px-2 py-2 text-left">Reference No.</th>
                        <th className="px-2 py-2 text-left">Amount</th>
                        <th className="px-2 py-2 text-left">Payment Date</th>
                        <th className="px-2 py-2 text-left">Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResults.unmatched.map(student => (
                        <tr key={student.id} className="border-b border-gray-100">
                          <td className="px-2 py-2 whitespace-nowrap">{student.name}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{student.srCode}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{student.referenceNo}</td>
                          <td className="px-2 py-2 text-left whitespace-nowrap">{formatAmount(student.amountPaid)}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{student.date}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-maroon">
                            {student.verificationIssue === 'amount_mismatch' 
                              ? 'Amount mismatch' 
                              : 'No matching transaction'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TransactionProcessingModal;