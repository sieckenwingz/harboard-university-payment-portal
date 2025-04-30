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
import { motion, AnimatePresence } from "framer-motion";
import PaymentReceiptModal from "./PaymentReceiptModal";
import TransactionProcessingModal from "./TransactionProcessingModal";
import ConfirmationModal from "./ConfirmationModal";

const StudentPayments = () => {
  const { departmentId, liabilityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { department, liability } = location.state || {};
  const fileInputRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ show: false, type: null, studentId: null });
  const [isExiting, setIsExiting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
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
  
  useEffect(() => {
    if (!liability) {
      navigate(`/departments/${departmentId}`);
      return;
    }
    
    setTimeout(() => {
      // sample data for pending and verified students
      const pendingStudentsSample = [
        {
          id: "s1",
          name: "John Doe",
          srCode: "22-04756",
          amountPaid: 15000,
          date: "2024-03-01",
          referenceNo: "0000201599770",
          receiptImage: "/api/placeholder/200/300",
          status: "pending"
        },
        {
          id: "s2",
          name: "Jane Smith",
          srCode: "22-02812",
          amountPaid: 5000,
          date: "2024-03-05",
          referenceNo: "0000508781961",
          receiptImage: "/api/placeholder/200/300",
          status: "pending"
        },
        {
          id: "s3",
          name: "Mike Johnson",
          srCode: "22-03105",
          amountPaid: 15000,
          date: "2024-03-07",
          referenceNo: "0000211147677",
          receiptImage: "/api/placeholder/200/300",
          status: "pending"
        },
        {
          id: "s4",
          name: "Sarah Williams",
          srCode: "22-09876",
          amountPaid: 5000,
          date: "2024-03-15",
          referenceNo: "0000225086095",
          receiptImage: "/api/placeholder/200/300",
          status: "pending"
        },
        {
          id: "s5",
          name: "Robert Brown",
          srCode: "22-01234",
          amountPaid: 15000,
          date: "2024-03-17",
          referenceNo: "0000026980425",
          receiptImage: "/api/placeholder/200/300",
          status: "pending"
        }
      ];
      
      const verifiedStudentsSample = [
        {
          id: "s6",
          name: "Emily Jones",
          srCode: "22-00756",
          amountPaid: 15000,
          date: "2024-02-28",
          referenceNo: "0000292500708",
          receiptImage: "/api/placeholder/200/300",
          status: "verified",
          verifiedDate: "2024-03-01",
          verifiedBy: "Admin User"
        },
        {
          id: "s7",
          name: "David Garcia",
          srCode: "22-09172",
          amountPaid: 5000,
          date: "2024-03-01",
          referenceNo: "0000292634162",
          receiptImage: "/api/placeholder/200/300",
          status: "verified",
          verifiedDate: "2024-03-02",
          verifiedBy: "Admin User"
        }
      ];
      
      const rejectedStudentsSample = [
        {
          id: "s8",
          name: "Alex Rodriguez",
          srCode: "22-06543",
          amountPaid: 15000,
          date: "2024-02-15",
          referenceNo: "0000123456789",
          receiptImage: "/api/placeholder/200/300",
          status: "rejected",
          rejectedDate: "2024-02-17",
          rejectedBy: "Admin User",
          rejectionReason: "Reference number not found"
        }
      ];
      
      setStudents(pendingStudentsSample);
      setVerifiedStudents(verifiedStudentsSample);
      setRejectedStudents(rejectedStudentsSample);
      setIsLoading(false);
    }, 800);
  }, [liability, departmentId, navigate]);

  const rowsPerPage = 5;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewReceipt = (student, e) => {
    if (e) e.stopPropagation();
    setSelectedReceipt(student);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (studentId, e) => {
    if (e) e.stopPropagation();
    setShowPaymentModal(false);
    setConfirmationModal({
      show: true,
      type: 'confirm',
      studentId
    });
  };

  const handleRejectPayment = (studentId, e) => {
    if (e) e.stopPropagation();
    setShowPaymentModal(false);
    setConfirmationModal({
      show: true,
      type: 'reject',
      studentId
    });
  };

  const processPaymentAction = () => {
    // get the student from pending list
    const student = students.find(s => s.id === confirmationModal.studentId);
    
    if (confirmationModal.type === 'confirm' && student) {
      // add to verified students
      const verifiedStudent = {
        ...student,
        status: "verified",
        verifiedDate: new Date().toISOString().split('T')[0],
        verifiedBy: "Admin User"
      };
      setVerifiedStudents(prev => [...prev, verifiedStudent]);
    } else if (confirmationModal.type === 'reject' && student) {
      // add to rejected students
      const rejectedStudent = {
        ...student,
        status: "rejected",
        rejectedDate: new Date().toISOString().split('T')[0],
        rejectedBy: "Admin User",
        rejectionReason: "Payment verification failed"
      };
      setRejectedStudents(prev => [...prev, rejectedStudent]);
    }
    
    // remove from pending students
    setStudents(prevStudents => 
      prevStudents.filter(s => s.id !== confirmationModal.studentId)
    );
    
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setConfirmationModal({ show: false, type: null, studentId: null });
    }, 500);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const parseGCashTransactionHistory = (text) => {
    const lines = text.split('\n');
    const transactions = [];
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Date and Time') && 
          lines[i].includes('Description') && 
          lines[i].includes('Reference No.')) {
        startIndex = i + 2; 
        break;
      }
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line === "" || line.startsWith("ENDING BALANCE") || line.startsWith("Total")) {
        continue;
      }
      
      // extract reference number (10+ digit number)
      const refNoMatch = line.match(/\d{10,}/);
      if (!refNoMatch) continue;
      
      const referenceNo = refNoMatch[0];
      
      // extract date 
      const dateMatch = line.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+[AP]M/);
      const date = dateMatch ? dateMatch[0] : "Unknown Date";
      
      // extract description
      let descriptionStart = line.indexOf(date) + date.length;
      let descriptionEnd = line.indexOf(referenceNo);
      let description = "Unknown";
      
      if (descriptionStart > 0 && descriptionEnd > descriptionStart) {
        description = line.substring(descriptionStart, descriptionEnd).trim();
      }
      
      // extract amount 
      const amountMatches = line.substring(descriptionEnd + referenceNo.length).match(/\d+\.\d{2}/g);
      let amount = 0;
      
      if (amountMatches && amountMatches.length > 0) {
        amount = parseFloat(amountMatches[0]);
      }
      
      transactions.push({
        date,
        description,
        referenceNo,
        amount
      });
    }
    
    return transactions;
  };

  const matchPaymentsWithTransactions = (students, transactions) => {
    const results = {
      matched: [],
      unmatched: []
    };
    
    students.forEach(student => {
      // Try to find a matching transaction by reference number
      const matchingTransaction = transactions.find(
        transaction => transaction.referenceNo === student.referenceNo
      );
      
      if (matchingTransaction) {
        // Check if amount matches approximately (allow small differences)
        const amountDifference = Math.abs(matchingTransaction.amount - student.amountPaid);
        const amountMatches = amountDifference < 1; 
        
        if (amountMatches) {
          results.matched.push({
            ...student,
            transactionVerified: true,
            verificationMethod: 'automatic',
            matchingTransaction
          });
        } else {
          results.unmatched.push({
            ...student,
            transactionVerified: false,
            verificationIssue: 'amount_mismatch',
            matchingTransaction
          });
        }
      } else {
        results.unmatched.push({
          ...student,
          transactionVerified: false,
          verificationIssue: 'no_matching_transaction'
        });
      }
    });
    
    return results;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // reset file input value to allow re-uploading the same file
    e.target.value = "";
    
    setIsParsing(true);
    setShowOCRModal(true);
    
    //sample lang
    // use OCR to extract text from the PDF
    setTimeout(() => {
      // the OCR result in a real app
      // hardcoded sample of the transaction history
      const mockOCRText = `GCash Transaction History
2024-02-01 to 2024-04-13
Date and Time Description Reference No. Debit Credit Balance
STARTING BALANCE 4127.18
2024-02-02 09:17 AM Buy Load Transaction for 09918826932 0000258854628 100.00 4027.18
2024-02-06 08:36 AM Payment to Foodpanda, Merchant Transaction Number: a5cl-kikh 0000264659411 291.00 3736.18
2024-02-06 09:21 AM Bills Payment to PLDT 0000264875622 1407.00 2329.18
2024-02-07 12:09 PM Buy Load Transaction for 09927054605 0000266567336 99.00 2230.18
2024-02-08 07:02 PM Payment to Foodpanda, Merchant Transaction Number: b5um-sedc 0000268562903 666.00 1564.18
2024-02-10 10:21 AM Payment to ePrime Business Solutions, Inc 0000971686991 134.69 1429.49
2024-02-16 03:07 PM Payment to Foodpanda, Merchant Transaction Number: e6mi-srnc 0000280325919 283.00 1146.49
2024-02-19 10:58 PM Transfer from 09927054605 to 09266126305 7015388757390 85.00 1231.49
2024-02-21 07:03 AM Payment to BAYAD - MERALCO ONLINE 0000787062739 550.28 681.21
2024-03-01 01:10 PM Transfer from 09752361784 to 09266126305 5015639053132 2000.00 2639.21
2024-03-01 02:24 PM Payment to Foodpanda, Merchant Transaction Number: a5cl-tjya 0000201599770 269.00 2370.21
2024-03-03 11:40 AM Buy Load Transaction for 09918826932 0000204849333 100.00 2270.21
2024-03-05 09:45 AM Payment to Shopee Philippines Inc 0000908872717 170.00 2100.21
2024-03-05 09:50 AM Payment to ShopeePay 0000508781961 306.00 1794.21
2024-03-06 09:37 AM Payment to ePrime Business Solutions, Inc 0000510416031 136.61 1657.60
2024-03-07 09:30 AM Payment to ADVANCED PLUS TECHNOLOGIES PTE.LTD. 0000211192274 172.00 1485.60
2024-03-07 09:33 AM Payment to Foodpanda, Merchant Transaction Number: a5cl-dvm9 0000211147677 48.00 1437.60
2024-03-15 08:28 PM Payment to Shopee Philippines Inc 0000225086095 175.00 912.09
2024-03-17 09:21 AM Payment to TikTok Shop 0000026980425 475.00 115.56`;
      
      // process the OCR text
      const transactions = parseGCashTransactionHistory(mockOCRText);
      const matchResults = matchPaymentsWithTransactions(students, transactions);
      
      setParseResults({
        matched: matchResults.matched,
        unmatched: matchResults.unmatched,
        gcashHistory: transactions
      });
      
      setIsParsing(false);
    }, 2000);
  };

  const handleVerifyAllMatched = () => {
    // process all matched transactions
    const matchedIds = parseResults.matched.map(student => student.id);
    
    // move all matched students to verified
    const newVerifiedStudents = parseResults.matched.map(student => ({
      ...student,
      status: "verified",
      verifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: "Admin User (Bulk Verification)",
      verificationMethod: "automatic-ocr"
    }));
    
    setVerifiedStudents(prev => [...prev, ...newVerifiedStudents]);
    setStudents(prev => prev.filter(student => !matchedIds.includes(student.id)));
    
    // close OCR modal
    setShowOCRModal(false);
  };

  const handleRejectAllUnmatched = () => {
    // process all unmatched transactions
    const unmatchedIds = parseResults.unmatched.map(student => student.id);
    
    // move all unmatched students to rejected
    const newRejectedStudents = parseResults.unmatched.map(student => ({
      ...student,
      status: "rejected",
      rejectedDate: new Date().toISOString().split('T')[0],
      rejectedBy: "Admin User (Bulk Rejection)",
      rejectionReason: student.verificationIssue === 'amount_mismatch' 
        ? "Amount mismatch with GCash transaction" 
        : "No matching transaction found"
    }));
    
    setRejectedStudents(prev => [...prev, ...newRejectedStudents]);
    setStudents(prev => prev.filter(student => !unmatchedIds.includes(student.id)));
    
    // close OCR modal
    setShowOCRModal(false);
  };

  const getFilteredData = () => {
    let activeData;
    
    if (activeTab === "pending") {
      activeData = students;
    } else if (activeTab === "verified") {
      activeData = verifiedStudents;
    } else {
      activeData = rejectedStudents;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const isStudentMatched = (studentId) => {
    return parseResults.matched.some(student => student.id === studentId);
  };

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
            {students.length} pending, {verifiedStudents.length} verified, {rejectedStudents.length} rejected
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-lg font-semibold text-gray-700 mr-2">Liability Amount:</span>
          <span className="text-lg text-gray-800">{liability && formatAmount(liability.amount)}</span>
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
          
          <button
            onClick={handleUploadClick}
            className="flex items-center px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538] transition-colors"
          >
            <Upload size={16} className="mr-2" />
            Upload GCash History
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
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
      </div>

      {isLoading ? (
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
          {currentPageData.map((student) => (
            <div
              key={student.id}
              className={`w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 ${
                activeTab === "pending" && isStudentMatched(student.id) ? "bg-green-50" : ""
              }`}
            >
              {/* Pending Tab Row */}
              {activeTab === "pending" && (
                <>
                  <div style={{ width: "30%" }} className="text-gray-700">
                    <span className="font-medium">{student.name}</span>
                    <div className="text-xs text-gray-500">{student.srCode}</div>
                    {isStudentMatched(student.id) && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Matched
                      </span>
                    )}
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(student.amountPaid)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(student.date)}</span>
                  <span style={{ width: "25%" }} className="text-gray-600">{student.referenceNo}</span>
                  <span style={{ width: "20%" }} className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleViewReceipt(student, e)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => handleConfirmPayment(student.id, e)}
                      className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      title="Confirm Payment"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={(e) => handleRejectPayment(student.id, e)}
                      className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      title="Reject Payment"
                    >
                      <XCircle size={18} />
                    </button>
                  </span>
                </>
              )}
              
              {/* Verified Tab Row */}
              {activeTab === "verified" && (
                <>
                  <div style={{ width: "30%" }} className="text-gray-700">
                    <span className="font-medium">{student.name}</span>
                    <div className="text-xs text-gray-500">{student.srCode}</div>
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(student.amountPaid)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(student.date)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{student.referenceNo}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(student.verifiedDate)}</span>
                  <span style={{ width: "15%" }} className="flex items-center">
                    <button
                      onClick={(e) => handleViewReceipt(student, e)}
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
                    <span className="font-medium">{student.name}</span>
                    <div className="text-xs text-gray-500">{student.srCode}</div>
                  </div>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatAmount(student.amountPaid)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(student.date)}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{student.referenceNo}</span>
                  <span style={{ width: "30%" }} className="text-gray-600">{formatDate(student.rejectedDate)}</span>
                  <span style={{ width: "15%" }} className="flex items-center">
                    <button
                      onClick={(e) => handleViewReceipt(student, e)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="View Receipt"
                    >
                      <Eye size={18} />
                    </button>
                  </span>
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
      {showPaymentModal && selectedReceipt && (
        <PaymentReceiptModal
          receipt={selectedReceipt}
          liability={liability}
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
          onVerifyAllMatched={handleVerifyAllMatched}
          onRejectAllUnmatched={handleRejectAllUnmatched}
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
              processPaymentAction();
            }, 500);
          }}
        />
      )}
    </div>
  );
};

export default StudentPayments;