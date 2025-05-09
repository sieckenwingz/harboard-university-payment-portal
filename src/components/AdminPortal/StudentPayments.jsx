// 3rd nav sa liabilities sidebar
// "liability name" - student payments

import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Upload,
  FileText,
  Filter,
  X,
  RefreshCw
} from "lucide-react";
import PaymentReceiptModal from "./PaymentReceiptModal";
import TransactionProcessingModal from "./TransactionProcessingModal";
import ConfirmationModal from "./ConfirmationModal";
import { useStudentFees } from "./hooks/useStudentFees";
import { useConfirmFee } from "./hooks/verification/useConfirmFee";
import { useRejectFee } from "./hooks/verification/useRejectFee";
import pdfToText from "react-pdftotext";
import { checkTransactionDetails, extractGcashTransactions } from "../../TransactionUtils";
import { useBulkConfirmFee } from "./hooks/verification/useBulkConfirmFee";
import { formatAmount, formatDate } from "../../Utils";

const StudentPayments = () => {
  const { organizationId, liabilityId: feeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { organization, liability } = location.state || {};
  const fileInputRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ show: false, type: null, studentId: null });
  const [isExiting, setIsExiting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [parseResults, setParseResults] = useState({
    matched: [],
    unmatched: [],
    gcashHistory: []
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    showMatched: true,
    showUnmatched: true
  });

  const { allStudentFees, pendingStudentFees, verifiedStudentFees, rejectedStudentFees, unpaidStudentFees, loading, error } = useStudentFees(feeId);
  const { confirmFee } = useConfirmFee();
  const { rejectFee } = useRejectFee();

  const [confirmingPayment, setConfirmingPayment] = useState(null);

  const { bulkConfirmFee } = useBulkConfirmFee();

  const rowsPerPage = 5;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewReceipt = (student, e) => {
    if (e) e.stopPropagation();
    setSelectedStudentFee(student);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentId, e) => {
    if (e) e.stopPropagation();

    setConfirmingPayment(paymentId.id); // show the loading icon

    const { _, error: err } = await confirmFee(paymentId.id);
    setShowPaymentModal(false);

    setConfirmingPayment(null); // reset

    if (!err) {
      setConfirmationModal({
        show: true,
        type: 'confirm',
        studentId: ''
      })
    } else {
      console.log('confirm error')
    }
  };

  const handleRejectPayment = async (paymentId, e) => {
    if (e) e.stopPropagation();

    setRejectingPayment(paymentId.id); // show the loading icon
    
    const { _, error: err } = await rejectFee(paymentId.id);
    setShowPaymentModal(false);

    setRejectingPayment(null); // reset

    if (!err) {
      setConfirmationModal({
        show: true,
        type: 'reject',
        studentId: ''
      });
    } else {
      console.log('confirm error')
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handlePdfData = (text) => {
    const transactions = extractGcashTransactions(text);

    // For more efficient searching using refNo
    const refNoIndexed = Object.fromEntries(transactions.map(trans => [trans.refNo, trans]));
    
    const matched = [];
    for (const s of pendingStudentFees) {
      const transactionFound = refNoIndexed[s.paymentId.refNo];
      if (transactionFound) {
        const transactionValid = checkTransactionDetails(transactionFound, s.paymentId);
        if (transactionValid) {
          matched.push({'studentFee': s, 'transaction': transactionFound});
        }
      }
    }
  
    setParseResults({
      matched: matched,
      unmatched: [],
      gcashHistory: transactions
    });

    setIsParsing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // reset file input value to allow re-uploading the same file
    e.target.value = "";

    setIsParsing(true);
    setShowOCRModal(true);
    pdfToText(file)
      .then(text => handlePdfData(text))
      .catch(error => {
        console.error("Failed to extract text from pdf");
        setShowOCRModal(false);
        setIsParsing(false);
        alert('Error while extracting transaction info')
      })
  };

  const getFilteredData = () => {
    let activeData;
    
    if (activeTab === "pending") {
      activeData = pendingStudentFees;
    } else if (activeTab === "verified") {
      activeData = verifiedStudentFees;
    } else if (activeTab === "rejected") {
      activeData = rejectedStudentFees;
    } else {
      activeData = unpaidStudentFees;
    }
    
    return activeData.filter((student) => {
      if (searchTerm && 
        !student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.srCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (activeTab === "pending" && parseResults.matched.length > 0) {
        const isMatched = parseResults.matched.some(s => s.id === student.id);
        
        if (isMatched && !filterOptions.showMatched) return false;
        if (!isMatched && !filterOptions.showUnmatched) return false;
      }
      
      return true;
    });
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPageData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const isStudentMatched = (studentId) => {
    return parseResults.matched.some(matchResult => matchResult.studentFee.studentId.id === studentId);
  };

  const onVerifyAllMatched = async (e) => {
    if (e) e.stopPropagation();
    const paymentIds = parseResults.matched.map((matchResult) => matchResult.studentFee.paymentId.id);
    const { _, error: err } = await bulkConfirmFee(paymentIds);
    setShowPaymentModal(false);
    if (!err) {
      setConfirmationModal({
        show: true,
        type: 'bulk_confirm',
        studentId: ''
      })
    } else {
      console.log('bulk confirm error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleGoBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {liability?.name} - Student Payments
          </h1>
          <p className="text-gray-600 mt-1">
            {pendingStudentFees.length} pending, {verifiedStudentFees.length} verified, {rejectedStudentFees.length} rejected, {unpaidStudentFees.length} unpaid
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-lg font-semibold text-gray-700 mr-2">Liability Amount:</span>
          <span className="text-lg text-gray-800">{liability && formatAmount(liability.amount, 2)}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, SR code, ref #..."
              className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>
          
          {activeTab === 'pending' && 
            <button
              disabled={pendingStudentFees.length == 0}
              onClick={handleUploadClick}
              className={pendingStudentFees.length == 0 ? "flex items-center px-4 py-2 bg-gray-300 text-gray-100 rounded-md" : "flex items-center px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538] transition-colors"}
            >
              <Upload size={16} className="mr-2" />
              Upload GCash History
            </button>
}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
          />
          
          {/* Show filter button when OCR results are available */}
          {parseResults.matched.length > 0 && activeTab === "pending" && (
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center px-3 py-2 rounded-md border ${showFilterDropdown ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50`}
              >
                <Filter size={16} className="mr-2 text-gray-600" />
                <span className="text-sm">Filter</span>
                <ChevronDown size={14} className="ml-1 text-gray-600" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-700 mb-2">Show Results</div>
                    <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterOptions.showMatched}
                        onChange={() => setFilterOptions(prev => ({...prev, showMatched: !prev.showMatched}))}
                        className="mr-2"
                      />
                      <span className="text-sm">Matched Transactions</span>
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterOptions.showUnmatched}
                        onChange={() => setFilterOptions(prev => ({...prev, showUnmatched: !prev.showUnmatched}))}
                        className="mr-2"
                      />
                      <span className="text-sm">Unmatched Transactions</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Reset filters button */}
          {parseResults.matched.length > 0 && (
            <button
              onClick={() => {
                setParseResults({ matched: [], unmatched: [], gcashHistory: [] });
                setFilterOptions({ showMatched: true, showUnmatched: true });
              }}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              title="Reset OCR Results"
            >
              <RefreshCw size={16} className="mr-1" />
              <span className="text-sm">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
        <div className="flex border-b mb-6">
        <button
            className={`px-4 py-2 ${activeTab === "pending" 
            ? "text-[#a63f42] border-b-2 border-[#a63f42] font-semibold" 
            : "text-gray-500 hover:text-gray-700 font-medium"}`}
            onClick={() => handleTabChange("pending")}
        >
            Pending Verification
        </button>
        <button
            className={`px-4 py-2 ${activeTab === "verified" 
            ? "text-[#a63f42] border-b-2 border-[#a63f42] font-semibold" 
            : "text-gray-500 hover:text-gray-700 font-medium"}`}
            onClick={() => handleTabChange("verified")}
        >
            Verified Payments
        </button>
        <button
            className={`px-4 py-2 ${activeTab === "rejected" 
            ? "text-[#a63f42] border-b-2 border-[#a63f42] font-semibold" 
            : "text-gray-500 hover:text-gray-700 font-medium"}`}
            onClick={() => handleTabChange("rejected")}
        >
            Rejected Payments
        </button>
        <button
            className={`px-4 py-2 ${activeTab === "unpaid" 
            ? "text-[#a63f42] border-b-2 border-[#a63f42] font-semibold" 
            : "text-gray-500 hover:text-gray-700 font-medium"}`}
            onClick={() => handleTabChange("unpaid")}
        >
            Unpaid
        </button>
        </div>

      {/* Table Headers based on active tab */}
      <div className="w-full flex justify-between py-4 border-b bg-gray-50 px-4 rounded-t-lg">
        {/* Pending Tab Headers */}
        {activeTab === "pending" && (
          <>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">STUDENT NAME</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">AMOUNT PAID</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">PAYMENT DATE</span>
            <span style={{ width: "25%" }} className="text-gray-700 font-semibold">REFERENCE NO.</span>
            <span style={{ width: "20%" }} className="text-gray-700 font-semibold">ACTION</span>
          </>
        )}
        
        {/* Verified Tab Headers */}
        {activeTab === "verified" && (
          <>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">STUDENT NAME</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">AMOUNT PAID</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">PAYMENT DATE</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">REFERENCE NO.</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">VERIFICATION DATE</span>
            <span style={{ width: "15%" }} className="text-gray-700 font-semibold">ACTION</span>
          </>
        )}
        
        {/* Rejected Tab Headers */}
        {activeTab === "rejected" && (
          <>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">STUDENT NAME</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">AMOUNT PAID</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">PAYMENT DATE</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">REFERENCE NO.</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">REJECTED DATE</span>
            <span style={{ width: "15%" }} className="text-gray-700 font-semibold">ACTION</span>
          </>
        )}

        {/* Unpaid Tab Headers */}
        {activeTab === "unpaid" && (
          <>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">STUDENT NAME</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">AMOUNT</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">DATE TAGGED</span>
          </>
        )}
      </div>

      {loading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : currentPageData.length === 0 ? (
        <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          {activeTab === "pending" 
            ? "No pending payments found." 
            : activeTab === "verified" 
              ? "No verified payments found." 
              : "No rejected payments found."}
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentPageData.map((studentFee) => (
            <div
              key={studentFee.id}
              className={`w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 ${
                activeTab === "pending" && isStudentMatched(studentFee.studentId.id) ? "bg-green-50" : ""
              }`}
            >
              {/* Pending Tab Row */}
              {activeTab === "pending" && (
                <>
                  <div style={{ width: "30%" }} className="text-gray-700">
                    <span className="font-medium">{studentFee.studentId.first_name} {studentFee.studentId.getFullName()}</span>
                    <div className="text-xs text-gray-500">{studentFee.studentId.srCode}</div>
                    {isStudentMatched(studentFee.studentId.id) && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Matched
                      </span>
                    )}
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(studentFee.paymentId?.amount)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(studentFee.paymentId?.paymentDate)}</span>
                  <span style={{ width: "25%" }} className="text-gray-600">{studentFee.paymentId?.refNo}</span>
                  <span style={{ width: "20%" }} className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleViewReceipt(studentFee, e)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => handleConfirmPayment(studentFee.paymentId, e)}
                      className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      title="Confirm Payment"
                      disabled={confirmingPayment === studentFee.paymentId?.id}
                    >
                      {confirmingPayment === studentFee.paymentId?.id ? (
                        <div className="animate-spin h-5 w-5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    </button>
                    <button
                      onClick={(e) => handleRejectPayment(studentFee.paymentId, e)}
                      className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      title="Reject Payment"
                      disabled={rejectingPayment === studentFee.paymentId?.id}
                    >
                      {rejectingPayment === studentFee.paymentId?.id ? (
                        <div className="animate-spin h-5 w-5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                      <XCircle size={18} />
                      )}
                    </button>
                  </span>
                </>
              )}
              
              {/* Verified Tab Row */}
              {activeTab === "verified" && (
                <>
                  <div style={{ width: "30%" }} className="text-gray-700">
                    <span className="font-medium">{studentFee.studentId.first_name} {studentFee.studentId.getFullName()}</span>
                    <div className="text-xs text-gray-500">{studentFee.studentId.srCode}</div>
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(studentFee.paymentId?.amount)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(studentFee.paymentId?.paymentDate)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{studentFee.paymentId?.refNo}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(studentFee.paymentId?.statusLastChangedAt)}</span>
                  <span style={{ width: "15%" }} className="flex items-center">
                    <button
                      onClick={(e) => handleViewReceipt(studentFee, e)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                  </span>
                </>
              )}
              
              {/* Rejected Tab Row */}
              {activeTab === "rejected" && (
                <>
                  <div style={{ width: "30%" }} className="text-gray-700">
                    <span className="font-medium">{studentFee.studentId.first_name} {studentFee.studentId.getFullName()}</span>
                    <div className="text-xs text-gray-500">{studentFee.studentId.srCode}</div>
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(studentFee.paymentId?.amount)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(studentFee.paymentId?.paymentDate)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{studentFee.paymentId?.refNo}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(studentFee.paymentId?.statusLastChangedAt)}</span>
                  <span style={{ width: "15%" }} className="flex items-center">
                    <button
                      onClick={(e) => handleViewReceipt(studentFee, e)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                  </span>
                </>
              )}
              
              {/* Unpaid Tab Row */}
              {activeTab === "unpaid" && (
                <>
                  <div style={{ width: "30%" }} className="text-gray-700">
                    <span className="font-medium">{studentFee.studentId.first_name} {studentFee.studentId.getFullName()}</span>
                    <div className="text-xs text-gray-500">{studentFee.studentId.srCode}</div>
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(studentFee.feeId?.amount)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(studentFee.createdAt)}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full flex items-center justify-between mt-6 px-4">
          <span className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 px-4 rounded-lg shadow border text-sm flex items-center ${
                currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 
                  ? i + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + i 
                    : currentPage - 2 + i;
                
                if (pageNum <= totalPages && pageNum > 0) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md mx-0.5 ${
                        currentPage === pageNum 
                          ? "bg-[#a63f42] text-white" 
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 px-4 rounded-lg shadow border text-sm flex items-center ${
                currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showPaymentModal && selectedStudentFee && (
        <PaymentReceiptModal
          studentFee={selectedStudentFee}
          formatAmount={formatAmount}
          formatDate={formatDate}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={activeTab === "pending" ? handleConfirmPayment : null}
          onReject={activeTab === "pending" ? handleRejectPayment : null}
        />
      )}

      {/* OCR Processing Modal */}
      {showOCRModal && (
        <TransactionProcessingModal
          isParsing={isParsing}
          parseResults={parseResults}
          formatAmount={formatAmount}
          onClose={() => setShowOCRModal(false)}
          onVerifyAllMatched={onVerifyAllMatched}
          onRejectAllUnmatched={() => {}}
        />
      )}

      {/* Confirmation Modals */}
      {confirmationModal.show && (
        <ConfirmationModal
          type={confirmationModal.type}
          isExiting={isExiting}
          onClose={() => {
            setIsExiting(true);
            setTimeout(() => {
              setConfirmationModal({ show: false, type: null, studentId: null });
              setShowOCRModal(false);
            }, 500);
          }}
        />
      )}
    </div>
  );
};

export default StudentPayments;