import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  Check, 
  X,
  AlertTriangle,
  PhilippinePeso,
  Filter,
  Loader2
} from "lucide-react";
import ReceiptViewer, { generateAndDownloadReceipt } from "./ReceiptViewer";
import { formatDate, formatAmount } from '../../Utils';
import { supabase } from '../../App';
import { useAuth } from '../../context/AuthContext';
import useUserData from './hooks/useUserData';

const PaymentHistory = () => {
  const { user } = useAuth();
  const { userData, getFullName } = useUserData(); // Use the hook to get user data
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("All time");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [paymentType, setPaymentType] = useState("All Payments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showAlertMessage, setShowAlertMessage] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  
  const rowsPerPage = 5;

  // Fetch payment history from Supabase
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setIsLoading(true);
        
        if (!user) {
          console.error("No authenticated user found");
          setIsLoading(false);
          return;
        }

        // Query to get all student fees with their payments and fee details
        // for the current user
        const { data, error } = await supabase
          .from('student_fees')
          .select(`
            id,
            created_at,
            fee_id (
              id,
              name,
              amount,
              deadline,
              organization_id (name)
            ),
            payment_id (
              id,
              created_at,
              amount,
              ref_number,
              payment_date,
              status,
              status_last_changed_at,
              receipt_path,
              checked_by
            )
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform the data to match the expected format
        const payments = data
          .filter(fee => fee.payment_id) // Only include fees with payments
          .map(fee => ({
            id: fee.payment_id.id,
            feeName: fee.fee_id.name,
            amount: fee.payment_id.amount,
            paymentDate: fee.payment_id.payment_date,
            paymentMethod: "GCash", // Assuming all payments are made via GCash
            referenceNumber: fee.payment_id.ref_number,
            status: fee.payment_id.status === "PAID" ? "Approved" : 
                  fee.payment_id.status === "REJECTED" ? "Rejected" : "Under Review",
            receiptNumber: `RCPT-${fee.payment_id.id}`,
            approvedBy: fee.payment_id.checked_by ? "Admin User" : "-",
            approvalDate: fee.payment_id.status === "PAID" ? fee.payment_id.status_last_changed_at : "-",
            rejectionReason: fee.payment_id.status === "REJECTED" ? "Payment verification failed" : "",
            receiptPath: fee.payment_id.receipt_path,
            feeId: fee.fee_id.id,
            studentFeeId: fee.id
          }));

        setPaymentHistory(payments);
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  const handleViewReceipt = (e, payment) => {
    e.stopPropagation();
    if (payment.status === "Approved") {
      setSelectedPayment(payment);
      setShowReceiptViewer(true);
    } else {
      setShowAlertMessage(true);
      setTimeout(() => setShowAlertMessage(false), 3000);
    }
  };
  
  const handleDownload = (e, payment) => {
    e.stopPropagation();
    if (payment.status === "Approved") {
      // Pass userData directly to the function
      generateAndDownloadReceipt(payment, userData);
    } else {
      setShowAlertMessage(true);
      setTimeout(() => setShowAlertMessage(false), 3000);
    }
  };
  
  const handlePaymentClick = (payment) => {
    if (payment.status === "Approved") {
      setSelectedPayment(payment);
      setShowReceiptViewer(true);
    } else {
      setShowAlertMessage(true);
      setTimeout(() => setShowAlertMessage(false), 3000);
    }
  };
  
  const handleDropdownChange = (e, filterType) => {
    if (filterType === "Date Range") setDateRange(e.target.value);
    else if (filterType === "Sort Order") setSortOrder(e.target.value);
    else if (filterType === "Payment Type") setPaymentType(e.target.value);
    else if (filterType === "Status") setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  // Filter payment history based on search term and filters
  const filteredPayments = paymentHistory.filter((payment) => {
    // Filter by payment type
    if (paymentType === "School Fees" && !payment.feeName.includes("Fee")) return false;
    if (paymentType === "Membership Fees" && !payment.feeName.includes("Membership")) return false;
    
    // Filter by status
    if (statusFilter === "Successful" && payment.status !== "Approved") return false;
    if (statusFilter === "Failed" && payment.status !== "Rejected") return false;
    
    // Filter by date range
    if (dateRange === "Last 30 days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(payment.paymentDate) < thirtyDaysAgo) return false;
    } else if (dateRange === "Last 90 days") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (new Date(payment.paymentDate) < ninetyDaysAgo) return false;
    } else if (dateRange === "This semester") {
      // Assuming semester start date of January 1st of current year
      const currentYear = new Date().getFullYear();
      const semesterStart = new Date(`${currentYear}-01-01`);
      if (new Date(payment.paymentDate) < semesterStart) return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (payment.feeName && payment.feeName.toLowerCase().includes(searchTermLower)) ||
        (payment.id && payment.id.toString().toLowerCase().includes(searchTermLower)) ||
        (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(searchTermLower)) ||
        (payment.referenceNumber && payment.referenceNumber.toLowerCase().includes(searchTermLower))
      );
    }
    
    return true;
  });
  
  // Apply sorting
  let displayPayments = [...filteredPayments];
  if (sortOrder === "Newest First") {
    displayPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  } else if (sortOrder === "Oldest First") {
    displayPayments.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
  } else if (sortOrder === "Amount: High to Low") {
    displayPayments.sort((a, b) => b.amount - a.amount);
  } else if (sortOrder === "Amount: Low to High") {
    displayPayments.sort((a, b) => a.amount - b.amount);
  }
  
  const totalPages = Math.ceil(displayPayments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPayments = displayPayments.slice(startIndex, startIndex + rowsPerPage);
  
  // Summary statistics
  const getSummary = () => {
    const successful = paymentHistory.filter(p => p.status === "Approved").length;
    const failed = paymentHistory.filter(p => p.status === "Rejected").length;
    const availableReceipts = paymentHistory.filter(p => p.status === "Approved").length;
    
    return { successful, failed, availableReceipts };
  };
  
  const summary = getSummary();
  
  const getStatusStyle = (status) => {
    if (status === "Approved") {
      return {
        color: "#15aa07",
        bgColor: "bg-green-100",
        borderColor: "border-green-300",
        icon: <Check size={16} className="mr-1" />
      };
    } else {
      return {
        color: "#e53e3e",
        bgColor: "bg-red-100",
        borderColor: "border-red-300",
        icon: <X size={16} className="mr-1" />
      };
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Alert Message for Rejected Payments */}
      {showAlertMessage && (
        <div className="absolute top-4 right-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 shadow-md flex items-center z-50 animate-fade-in">
          <AlertTriangle size={20} className="mr-2" />
          <span>Under review or rejected transactions don't have receipts</span>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Payment History
        </h1>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600 font-medium">Total Successful Payments</p>
              <p className="text-2xl font-bold text-green-700">{summary.successful}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Check size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-red-600 font-medium">Total Failed Payments</p>
              <p className="text-2xl font-bold text-red-700">{summary.failed}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-600 font-medium">Available Receipts</p>
              <p className="text-2xl font-bold text-purple-700">{summary.availableReceipts}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Download size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => handleDropdownChange(e, "Date Range")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>All time</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This semester</option>
            </select>
            <Calendar className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
          
          <div className="relative">
            <select
              value={paymentType}
              onChange={(e) => handleDropdownChange(e, "Payment Type")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>All Payments</option>
              <option>School Fees</option>
              <option>Membership Fees</option>
            </select>
            <PhilippinePeso className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleDropdownChange(e, "Status")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>All Status</option>
              <option>Successful</option>
              <option>Failed</option>
            </select>
            <Filter className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
          
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => handleDropdownChange(e, "Sort Order")}
              className="pl-4 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Amount: High to Low</option>
              <option>Amount: Low to High</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
        </div>
        
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fee name, reference number, receipt number..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>
      
      {/* Table Header */}
      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "22%" }} className="text-gray-700 font-semibold">FEE NAME</span>
        <span style={{ width: "12%" }} className="text-gray-700 font-semibold">AMOUNT</span>
        <span style={{ width: "17%" }} className="text-gray-700 font-semibold">PAYMENT DATE</span>
        <span style={{ width: "17%" }} className="text-gray-700 font-semibold">REFERENCE #</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">RECEIPT #</span>
        <span style={{ width: "10%" }} className="text-gray-700 font-semibold">STATUS</span>
        <span style={{ width: "12%" }} className="text-gray-700 font-semibold text-center">ACTIONS</span>
      </div>
      
      {/* Table Content */}
      {isLoading ? (
        <div className="w-full flex justify-center items-center h-64">
          <Loader2 size={24} className="animate-spin text-[#a63f42]" />
        </div>
      ) : error ? (
        <div className="w-full flex justify-center items-center h-32 text-red-500 text-sm bg-gray-50 rounded-b-lg">
          Error loading payment records: {error}
        </div>
      ) : currentPayments.length === 0 ? (
        <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          No payment records found.
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentPayments.map((payment) => {
            const statusStyle = getStatusStyle(payment.status);
            return (
              <div
                key={payment.id}
                className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handlePaymentClick(payment)}
              >
                <span style={{ width: "22%" }} className="text-gray-700 font-medium">
                  {payment.feeName}
                </span>
                <span style={{ width: "12%" }} className="text-gray-700">{formatAmount(payment.amount)}</span>
                <span style={{ width: "17%" }} className="text-gray-700">{formatDate(payment.paymentDate)}</span>
                <span style={{ width: "17%" }} className="text-gray-700">{payment.referenceNumber}</span>
                <span style={{ width: "15%" }} className="text-gray-700">{payment.receiptNumber}</span>
                <span style={{ width: "10%" }} className="text-gray-700">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${statusStyle.bgColor} border ${statusStyle.borderColor}`} style={{ color: statusStyle.color }}>
                    {statusStyle.icon}
                    {payment.status}
                  </span>
                </span>
                <span style={{ width: "12%" }} className="flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => handleViewReceipt(e, payment)}
                    className={`p-2 rounded-full ${payment.status === "Approved" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-gray-100 text-gray-400"} transition-colors`}
                    title="View Receipt"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, payment)}
                    className={`p-2 rounded-full ${payment.status === "Approved" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-400"} transition-colors`}
                    title="Download Receipt as PDF"
                  >
                    <Download size={18} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 0 && (
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
      
      {/* Receipt Viewer Modal */}
      {showReceiptViewer && selectedPayment && (
        <ReceiptViewer 
          payment={selectedPayment} 
          onClose={() => setShowReceiptViewer(false)} 
        />
      )}
      
      {/* CSS animation for fade-in effect */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PaymentHistory;