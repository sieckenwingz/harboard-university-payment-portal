import React, { useRef } from "react";
import { X, Download, Printer } from "lucide-react";
import html2pdf from "html2pdf.js";
import useUserData from "./hooks/useUserData";
import { formatAmount, formatDate } from "../../Utils";
import logo from "../../assets/logo.png"; // Import the real logo

// Separate function for direct downloading without showing UI
export const generateAndDownloadReceipt = (payment, userData) => {
  // Create a temporary div element (but don't append to DOM)
  const tempDiv = document.createElement('div');
  
  // Use userData parameter or fallback
  const fullName = userData?.firstName && userData?.lastName ? 
    `${userData.firstName} ${userData.lastName}` : "Student Name";
  const srCode = userData?.srCode || "SR-XXXXX";
  
  // Render receipt content to the temp div
  tempDiv.innerHTML = `
    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <!-- Receipt Header -->
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center">
          <img 
            src="${logo}" 
            alt="Harboard University Logo" 
            class="w-12 h-12 mr-3 object-contain"
          />
          <div class="font-tinos text-lg font-bold text-[#a63f42]">
            THE HARBOARD UNIVERSITY
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg">OFFICIAL RECEIPT</p>
          <p class="text-gray-600 text-sm mt-1">Receipt #: ${payment.receiptNumber}</p>
          <p class="text-gray-600 text-sm">Date: ${formatDate(payment.approvalDate)}</p>
        </div>
      </div>
      
      <div class="border-t border-b border-gray-200 py-4 my-4">
        <!-- Student Information -->
        <div class="mb-4">
          <h3 class="font-bold text-gray-700 mb-2 pb-1 border-b text-sm">STUDENT INFORMATION</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-gray-600">Name:</p>
              <p class="font-medium">${fullName}</p>
            </div>
            <div>
              <p class="text-gray-600">Student ID:</p>
              <p class="font-medium">${srCode}</p>
            </div>
            <div>
              <p class="text-gray-600">Program:</p>
              <p class="font-medium">Bachelor of Science in Computer Engineering</p>
            </div>
            <div>
              <p class="text-gray-600">Year Level:</p>
              <p class="font-medium">3rd Year</p>
            </div>
          </div>
        </div>
        
        <!-- Payment Details -->
        <div class="mb-4">
          <h3 class="font-bold text-gray-700 mb-2 pb-1 border-b text-sm">PAYMENT DETAILS</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-2">Description</th>
                <th class="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100">
                <td class="py-2">${payment.feeName}</td>
                <td class="py-2 text-right">${formatAmount(payment.amount)}</td>
              </tr>
              <tr>
                <td class="py-2 font-bold">Total Amount</td>
                <td class="py-2 text-right font-bold">${formatAmount(payment.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Transaction Information -->
        <div>
          <h3 class="font-bold text-gray-700 mb-2 pb-1 border-b text-sm">TRANSACTION INFORMATION</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-gray-600">Transaction ID:</p>
              <p class="font-medium">${payment.id}</p>
            </div>
            <div>
              <p class="text-gray-600">Payment Date:</p>
              <p class="font-medium">${formatDate(payment.paymentDate)}</p>
            </div>
            <div>
              <p class="text-gray-600">Reference Number:</p>
              <p class="font-medium">${payment.referenceNumber}</p>
            </div>
            <div>
              <p class="text-gray-600">Approved By:</p>
              <p class="font-medium">${payment.approvedBy}</p>
            </div>
            <div>
              <p class="text-gray-600">Approval Date:</p>
              <p class="font-medium">${formatDate(payment.approvalDate)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Authentication stamp -->
      <div class="flex justify-between items-center mt-4">
        <div class="w-1/3">
          <p class="text-gray-500 text-xs">Processed by:</p>
          <div class="border-b border-gray-300 mt-8 mb-1"></div>
          <p class="text-center text-xs">Finance Officer</p>
        </div>
        
        <div class="w-1/3 flex justify-center">
          <div class="border-2 border-[#a63f42] w-24 h-24 rounded-full flex items-center justify-center rotate-[-15deg]">
            <p class="text-[#a63f42] font-bold text-center text-xs">
              PAYMENT<br/>VERIFIED
            </p>
          </div>
        </div>
        
        <div class="w-1/3 flex justify-end">
          <div>
            <p class="text-gray-500 text-xs">Verified by:</p>
            <div class="border-b border-gray-300 mt-8 mb-1"></div>
            <p class="text-center text-xs">Accounting Head</p>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>This is an electronically generated receipt and does not require a physical signature.</p>
        <p>For questions or concerns regarding this receipt, please contact the Finance Office.</p>
        <p class="font-medium mt-1">Thank you for your payment!</p>
      </div>
    </div>
  `;
  
  // Generate and download PDF
  const opt = {
    margin: 0.5,
    filename: `Receipt-${payment.receiptNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  try {
    html2pdf()
      .set(opt)
      .from(tempDiv)
      .save()
      .then(() => {
        // Clean up - remove the temporary div
        document.body.removeChild(tempDiv);
      })
      .catch(error => {
        console.error("Error generating PDF:", error);
        // Still try to remove the temp div
        document.body.removeChild(tempDiv);
      });
  } catch (error) {
    console.error("Error with html2pdf:", error);
    // Make sure we always clean up
    document.body.removeChild(tempDiv);
  }
};

const ReceiptViewer = ({ payment, onClose }) => {
  const receiptRef = useRef(null);
  const { userData, getFullName } = useUserData();
  const fullName = getFullName();
  
  // download receipt as pdf
  const handleDownload = () => {
    try {
      const element = receiptRef.current;
      const opt = {
        margin: 0.5,
        filename: `Receipt-${payment.receiptNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Payment Receipt</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload} 
              className="receipt-download-button flex items-center px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
            >
              <Download size={16} className="mr-1" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Receipt Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-64px)]">
          <div ref={receiptRef} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {/* Receipt Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <img 
                  src={logo} 
                  alt="Harboard University Logo" 
                  className="w-12 h-12 mr-3 object-contain"
                />
                <div className="font-tinos text-lg font-bold text-[#a63f42]">
                  THE HARBOARD UNIVERSITY
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">OFFICIAL RECEIPT</p>
                <p className="text-gray-600 text-sm mt-1">Receipt #: {payment.receiptNumber}</p>
                <p className="text-gray-600 text-sm">Date: {formatDate(payment.approvalDate)}</p>
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 my-4">
              {/* Student Information */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-700 mb-2 pb-1 border-b text-sm">STUDENT INFORMATION</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{fullName || "Student Name"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Student ID:</p>
                    <p className="font-medium">{userData?.srCode || "SR-XXXXX"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Program:</p>
                    <p className="font-medium">Bachelor of Science in Computer Engineering</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Year Level:</p>
                    <p className="font-medium">3rd Year</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-700 mb-2 pb-1 border-b text-sm">PAYMENT DETAILS</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">{payment.feeName}</td>
                      <td className="py-2 text-right">{formatAmount(payment.amount)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Total Amount</td>
                      <td className="py-2 text-right font-bold">{formatAmount(payment.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Transaction Information */}
              <div>
                <h3 className="font-bold text-gray-700 mb-2 pb-1 border-b text-sm">TRANSACTION INFORMATION</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Transaction ID:</p>
                    <p className="font-medium">{payment.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Date:</p>
                    <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reference Number:</p>
                    <p className="font-medium">{payment.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Approved By:</p>
                    <p className="font-medium">{payment.approvedBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Approval Date:</p>
                    <p className="font-medium">{formatDate(payment.approvalDate)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Authentication stamp */}
            <div className="flex justify-between items-center mt-4">
              <div className="w-1/3">
                <p className="text-gray-500 text-xs">Processed by:</p>
                <div className="border-b border-gray-300 mt-8 mb-1"></div>
                <p className="text-center text-xs">Finance Officer</p>
              </div>
              
              <div className="w-1/3 flex justify-center">
                <div className="border-2 border-[#a63f42] w-24 h-24 rounded-full flex items-center justify-center rotate-[-15deg]">
                  <p className="text-[#a63f42] font-bold text-center text-xs">
                    PAYMENT<br/>VERIFIED
                  </p>
                </div>
              </div>
              
              <div className="w-1/3 flex justify-end">
                <div>
                  <p className="text-gray-500 text-xs">Verified by:</p>
                  <div className="border-b border-gray-300 mt-8 mb-1"></div>
                  <p className="text-center text-xs">Accounting Head</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
              <p>This is an electronically generated receipt and does not require a physical signature.</p>
              <p>For questions or concerns regarding this receipt, please contact the Finance Office.</p>
              <p className="font-medium mt-1">Thank you for your payment!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;