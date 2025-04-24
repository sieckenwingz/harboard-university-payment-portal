// components/StudentPortal/LiabilitiesDashboard.jsx
import React, { useState, useEffect } from "react";
import PaymentPopup from "./PaymentPopup";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Calendar, Filter, Check, AlertTriangle, RefreshCw, X } from "lucide-react";

const LiabilitiesDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("All liabilities");
  const [dateRange, setDateRange] = useState("Date Range");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [amountFilter, setAmountFilter] = useState("Amount");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLiability, setSelectedLiability] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Define liability categories
  const schoolFees = [
    "Tuition Fee",
    "Miscellaneous Fee",
    "Laboratory Fee",
    "Library Fee",
    "Enrollment Fee",
    "Computer Lab Fee",
    "Student ID Fee",
    "Student Development Fee",
    "Building/Facility Fee",
    "Course Materials Fee"
  ];
  
  const membershipFees = [
    "Student Council Fee",
    "College of Engineering Fee",
    "Sports Team Fee",
    "Club Membership Fee",
    "Peer Support Group Fee",
    "Student Government Fee",
    "Student Publication Fee",
    "Environmental Club Fee",
    "Social Club Fee",
    "National Honor Society Fee"
  ];
  
  // Generate sample liabilities with proper categories
  const generateLiabilities = () => {
    const result = [];
    // Generate School Fees
    schoolFees.forEach((fee, i) => {
      result.push({
        id: i + 1,
        name: fee,
        type: "School Fee",
        amount: `${(i + 1) * 500 + 1000}`,
        dueDate: `2025-05-${(i % 30) + 1}`,
        status: ["Paid", "Unpaid", "Under Review", "Rejected"][i % 4],
        accountName: "John Doe",
        accountNumber: "1234567890",
        referenceNumber: `REF${100000 + i}`
      });
    });
    
    // Generate Membership Fees
    membershipFees.forEach((fee, i) => {
      result.push({
        id: i + 11,
        name: fee,
        type: "Membership Fee",
        amount: `${(i + 1) * 100 + 200}`,
        dueDate: `2025-05-${(i % 30) + 1}`,
        status: ["Paid", "Unpaid", "Under Review", "Rejected"][i % 4],
        accountName: "John Doe",
        accountNumber: "1234567890",
        referenceNumber: `REF${200000 + i}`
      });
    });
    
    return result;
  };
  
  const [liabilities, setLiabilities] = useState(generateLiabilities());

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const rowsPerPage = 5;

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const handleDropdownChange = (e, filterType) => {
    if (filterType === "Date Range") setDateRange(e.target.value);
    else if (filterType === "Status") setStatusFilter(e.target.value);
    else if (filterType === "Amount") setAmountFilter(e.target.value);
  };

  const updateLiabilityStatus = (liabilityId, newStatus) => {
    setLiabilities(prevLiabilities => 
      prevLiabilities.map(item => 
        item.id === liabilityId ? { ...item, status: newStatus } : item
      )
    );
  };

  const filteredLiabilities = liabilities.filter((item) => {
    // Filter by fee type (School Fee or Membership Fee)
    if (selectedFilter === "School Fee" && item.type !== "School Fee") return false;
    if (selectedFilter === "Membership Fee" && item.type !== "Membership Fee") return false;
    
    // Filter by status
    if (statusFilter !== "Status" && statusFilter !== item.status) return false;
    
    // Filter by search term
    if (searchTerm &&
      !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.status.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.dueDate.includes(searchTerm) &&
      !item.amount.includes(searchTerm)) {
      return false;
    }
    return true;
  });

  let displayLiabilities = [...filteredLiabilities];
  if (amountFilter === "High to Low") {
    displayLiabilities.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  } else if (amountFilter === "Low to High") {
    displayLiabilities.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
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
    const paid = liabilities.filter(item => item.status === "Paid").length;
    const unpaid = liabilities.filter(item => item.status === "Unpaid").length;
    const underReview = liabilities.filter(item => item.status === "Under Review").length;
    const rejected = liabilities.filter(item => item.status === "Rejected").length;
    
    return { paid, unpaid, underReview, rejected };
  };

  const summary = getSummary();

  // Format date to more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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

      <div className="w-full flex items-center border-b pb-2 mt-6 gap-8">
        {["All liabilities", "School Fee", "Membership Fee"].map((filter) => (
          <span
            key={filter}
            className={`cursor-pointer px-2 pb-1 transition-all duration-200 ease-in-out ${
              selectedFilter === filter
                ? "text-[#a63f42] font-semibold border-b-2 border-[#a63f42]"
                : "text-gray-600 hover:text-[#a63f42] border-b-2 border-transparent"
            }`}
            onClick={() => handleFilterClick(filter)}
          >
            {filter}
          </span>
        ))}
      </div>

      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => handleDropdownChange(e, "Date Range")}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>Date Range</option>
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
              <option>Status</option>
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
              <option>Amount</option>
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
            placeholder="Search by fee name, fee type, status..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "25%" }} className="text-gray-700 font-semibold">FEE NAME</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">TYPE</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">AMOUNT</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">DUE DATE</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">STATUS</span>
      </div>

      {isLoading ? (
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
                <span style={{ width: "25%" }} className="text-gray-700 font-medium">{item.name}</span>
                <span style={{ width: "20%" }} className="text-gray-700">{item.type}</span>
                <span style={{ width: "15%" }} className="text-gray-700">₱{item.amount}</span>
                <span style={{ width: "20%" }} className="text-gray-700">{formatDate(item.dueDate)}</span>
                <span style={{ width: "20%" }} className="flex items-center">
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