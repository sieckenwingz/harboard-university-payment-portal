import React, { useState, useEffect } from "react";
import PaymentPopup from "./PaymentPopup";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Calendar, Filter, Check, AlertTriangle, RefreshCw, X } from "lucide-react";
import { supabase } from "../../App";
import { StudentFee } from "../../models/StudentFee";
import { formatAmount, formatDate } from "../../Utils";

const LiabilitiesDashboard = () => {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("Date Range");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [amountFilter, setAmountFilter] = useState("Amount");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLiability, setSelectedLiability] = useState(null);
  
  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true)

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User fetch error:', userError)
        setLoading(false)
        return
      }

      const { data: feesData, error: feesError } = await supabase
        .from('student_fees')
        .select('*, payment_id(*), fee_id(*, period_id(*)), student_id(*)')
        .eq('student_id', user.id);

      if (feesError) {
        console.error('Fees fetch error:', feesError)
      } else {
        const result = [];
        feesData.forEach((fee, _) => {
          result.push(new StudentFee(fee));
        });
        setFees(result);
      }
      setLoading(false)
    }

    fetchFees()
  }, [])

  // Helper function to get semester display text from periodId
  const getSemesterText = (fee) => {
    if (!fee || !fee.feeId) return "N/A";
    if (typeof fee.feeId !== 'object') return "N/A";
    
    // Access period information
    if (fee.feeId.periodId && typeof fee.feeId.periodId === 'object') {
      const periodSemester = fee.feeId.periodId.semester;
      
      // Format the semester for display
      if (periodSemester) {
        // If the semester is stored as an enum or numeric value, format it
        if (periodSemester === "FIRST") return "First";
        if (periodSemester === "SECOND") return "Second";
        if (periodSemester === "SUMMER") return "Summer";
        
        // Otherwise, return the semester as is
        return periodSemester;
      }
    }
    
    return "N/A";
  };

  const rowsPerPage = 5;

  const handleDropdownChange = (e, filterType) => {
    if (filterType === "Date Range") setDateRange(e.target.value);
    else if (filterType === "Status") setStatusFilter(e.target.value);
    else if (filterType === "Amount") setAmountFilter(e.target.value);
  };

  const updateLiabilityStatus = (liabilityId, newStatus) => {
    setFees(prevLiabilities => 
      prevLiabilities.map(item => 
        item.id === liabilityId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Update the filteredLiabilities function with proper null checks and semester search
  const filteredLiabilities = fees.filter((item) => {
    // Filter by status (Paid Unpaid Under Review Rejected)
    if (statusFilter !== "Status" && statusFilter !== item.status) return false;
    
    // Filter by search term with null checks
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Check if fee name exists and contains search term
      const nameMatch = item.feeId?.name ? 
        item.feeId.name.toLowerCase().includes(searchTermLower) : false;
      
      // Check if status exists and contains search term
      const statusMatch = item.status ? 
        item.status.toLowerCase().includes(searchTermLower) : false;
      
      // Check for amount match - convert to string first
      const amountMatch = item.feeId?.amount ? 
        formatAmount(item.feeId.amount).toLowerCase().includes(searchTermLower) : false;
      
      // Check for due date match
      const dueDateMatch = item.feeId?.deadline ? 
        formatDate(item.feeId.deadline).toLowerCase().includes(searchTermLower) : false;
      
      // Check for semester match from periodId
      const semesterMatch = getSemesterText(item).toLowerCase().includes(searchTermLower);
      
      // If none of the fields match, exclude this item
      if (!nameMatch && !statusMatch && !amountMatch && !dueDateMatch && !semesterMatch) {
        return false;
      }
    }
    return true;
  });

  let displayLiabilities = [...filteredLiabilities];
  if (amountFilter === "High to Low") {
    displayLiabilities.sort((a, b) => parseFloat(b.feeId.amount) - parseFloat(a.feeId.amount));
  } else if (amountFilter === "Low to High") {
    displayLiabilities.sort((a, b) => parseFloat(a.feeId.amount) - parseFloat(b.feeId.amount));
  }

  const totalPages = Math.ceil(displayLiabilities.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLiabilities = displayLiabilities.slice(startIndex, startIndex + rowsPerPage);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return { 
          color: "#15aa07", 
          icon: <Check size={16} className="mr-1" />, 
          bgColor: "bg-green-100",
          borderColor: "border-green-300"
        };
      case "Unpaid":
        return { 
          color: "#e53e3e", 
          icon: <AlertTriangle size={16} className="mr-1" />, 
          bgColor: "bg-red-100",
          borderColor: "border-red-300"
        };
      case "Under Review":
        return { 
          color: "#dd6b20", 
          icon: <RefreshCw size={16} className="mr-1" />, 
          bgColor: "bg-orange-100",
          borderColor: "border-orange-300"
        };
      case "Rejected":
        return { 
          color: "#718096", 
          icon: <X size={16} className="mr-1" />, 
          bgColor: "bg-gray-100",
          borderColor: "border-gray-300"
        };
      default:
        return { 
          color: "#718096", 
          icon: "", 
          bgColor: "bg-gray-100",
          borderColor: "border-gray-300"
        };
    }
  };

  const getSummary = () => {
    const paid = fees.filter(item => item.status === "Paid").length;
    const unpaid = fees.filter(item => item.status === "Unpaid").length;
    const underReview = fees.filter(item => item.status === "Under Review").length;
    const rejected = fees.filter(item => item.status === "Rejected").length;
    
    return { paid, unpaid, underReview, rejected };
  };

  const summary = getSummary();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Liabilities Overview
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600 font-medium">Paid</p>
              <p className="text-2xl font-bold text-green-700">{summary.paid}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Check size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-red-600 font-medium">Unpaid</p>
              <p className="text-2xl font-bold text-red-700">{summary.unpaid}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-600 font-medium">Under Review</p>
              <p className="text-2xl font-bold text-orange-700">{summary.underReview}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <RefreshCw size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-gray-700">{summary.rejected}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <X size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => handleDropdownChange(e, "Date Range")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
              <option>This year</option>
            </select>
            <Calendar className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleDropdownChange(e, "Status")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Under Review</option>
              <option>Rejected</option>
            </select>
            <Filter className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>

          <div className="relative">
            <select
              value={amountFilter}
              onChange={(e) => handleDropdownChange(e, "Amount")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              
              <option>High to Low</option>
              <option>Low to High</option>
            </select>
            <span className="absolute left-2 top-2.5 text-gray-500 font-medium">₱</span>
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
        </div>

        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fee name, semester, amount, due date..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {/* Table Header - Semester column before Amount */}
      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">FEE NAME</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">SEMESTER</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">AMOUNT</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">DUE DATE</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">STATUS</span>
      </div>

      {loading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : currentLiabilities.length === 0 ? (
        <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          No liabilities found.
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentLiabilities.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <div
                key={item.id}
                className="w-full flex justify-between py-4 px-4 border-b cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedLiability(item)}
              >
                <span style={{ width: "20%" }} className="text-gray-700 font-medium">{item.feeId.name}</span>
                {/* Semester column before Amount */}
                <span style={{ width: "15%" }} className="text-gray-700">{getSemesterText(item)}</span>
                <span style={{ width: "15%" }} className="text-gray-700">{formatAmount(item.feeId.amount)}</span>
                <span style={{ width: "15%" }} className="text-gray-700">
                  {item.feeId ? (item.feeId.deadline != null ? formatDate(item.feeId.deadline) : "No due date") : "No due date"}
                </span>
                <span style={{ width: "15%" }} className="flex items-center">
                  <span 
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${statusStyle.bgColor} border ${statusStyle.borderColor}`} 
                    style={{ color: statusStyle.color }}
                  >
                    {statusStyle.icon}
                    {item.status}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Popup */}
      <PaymentPopup
        show={selectedLiability !== null}
        selectedLiability={selectedLiability}
        onClose={() => setSelectedLiability(null)}
        onStatusChange={(newStatus) => {
          if (selectedLiability) {
            updateLiabilityStatus(selectedLiability.id, newStatus);
          }
        }}
      />
    </div>
  );
};

export default LiabilitiesDashboard;