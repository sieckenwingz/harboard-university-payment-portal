//management
// disregard pero wag idelete

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter, ArrowLeft, Tag, CheckCircle, XCircle } from "lucide-react";

const LiabilityPage = () => {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const [liabilities, setLiabilities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const generateLiabilities = () => {
      const result = [];
      const allFeeTypes = [...schoolFees, ...membershipFees];
      
      const totalLiabilities = Math.floor(Math.random() * 10) + 15;
      
      for (let i = 0; i < totalLiabilities; i++) {
        const isSchoolFee = Math.random() > 0.4; 
        const feeType = isSchoolFee 
          ? schoolFees[Math.floor(Math.random() * schoolFees.length)]
          : membershipFees[Math.floor(Math.random() * membershipFees.length)];
        
        const amount = isSchoolFee 
          ? Math.floor(Math.random() * 5000) + 1000 
          : Math.floor(Math.random() * 200) + 50;   
        
        const isVerified = Math.random() > 0.3; 
        
        result.push({
          id: i + 1,
          feeType,
          category: isSchoolFee ? "School Fee" : "Membership Fee",
          amount,
          semester: Math.random() > 0.5 ? "First Semester" : "Second Semester",
          academicYear: "2024-2025",
          isVerified,
          dateAdded: new Date(2025, 3, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
        });
      }
      
      return result;
    };

    setTimeout(() => {
      setLiabilities(generateLiabilities());
      setIsLoading(false);
    }, 800);
  }, [id]);

  const rowsPerPage = 5;

  const filteredLiabilities = liabilities.filter((item) => {

    if (categoryFilter === "School Fees" && item.category !== "School Fee") return false;
    if (categoryFilter === "Membership Fees" && item.category !== "Membership Fee") return false;
    
    if (statusFilter === "Verified" && !item.isVerified) return false;
    if (statusFilter === "Unverified" && item.isVerified) return false;
    
    if (searchTerm &&
      !item.feeType.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.amount.toString().includes(searchTerm) &&
      !item.semester.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredLiabilities.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLiabilities = filteredLiabilities.slice(startIndex, startIndex + rowsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="p-2 mr-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {decodeURIComponent(name)} - Liabilities
        </h1>
      </div>

      {/* Filters */}
      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>All Categories</option>
              <option>School Fees</option>
              <option>Membership Fees</option>
            </select>
            <Tag className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>All Status</option>
              <option>Verified</option>
              <option>Unverified</option>
            </select>
            <Filter className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
        </div>

        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search liabilities..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-600 font-medium">Total Liabilities</p>
              <p className="text-2xl font-bold text-blue-700">{liabilities.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Tag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-600 font-medium">School Fees</p>
              <p className="text-2xl font-bold text-purple-700">
                {liabilities.filter(item => item.category === "School Fee").length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Tag size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-600 font-medium">Membership Fees</p>
              <p className="text-2xl font-bold text-indigo-700">
                {liabilities.filter(item => item.category === "Membership Fee").length}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Tag size={24} className="text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600 font-medium">Verified</p>
              <p className="text-2xl font-bold text-green-700">
                {liabilities.filter(item => item.isVerified).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span className="w-1/6 text-gray-700 font-semibold">FEE TYPE</span>
        <span className="w-1/6 text-gray-700 font-semibold">CATEGORY</span>
        <span className="w-1/6 text-gray-700 font-semibold">AMOUNT</span>
        <span className="w-1/6 text-gray-700 font-semibold">SEMESTER</span>
        <span className="w-1/6 text-gray-700 font-semibold">STATUS</span>
        <span className="w-1/6 text-gray-700 font-semibold">ACTIONS</span>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : currentLiabilities.length === 0 ? (
        <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          No liabilities found with the current filters.
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentLiabilities.map((item) => (
            <div
              key={item.id}
              className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50"
            >
              <span className="w-1/6 text-gray-700 font-medium">{item.feeType}</span>
              <span className="w-1/6">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs {
                  item.category === "School Fee" 
                    ? "bg-purple-100 text-purple-800 border border-purple-200" 
                    : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                }`}>
                  {item.category}
                </span>
              </span>
              <span className="w-1/6 text-gray-700">{formatCurrency(item.amount)}</span>
              <span className="w-1/6 text-gray-700">{item.semester}</span>
              <span className="w-1/6">
                {item.isVerified ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle size={12} className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-200">
                    <XCircle size={12} className="mr-1" /> Unverified
                  </span>
                )}
              </span>
              <span className="w-1/6">
                <button 
                  className={`px-3 py-1.5 ${
                    item.isVerified 
                      ? "bg-gray-500 hover:bg-gray-600" 
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-md text-xs transition-colors duration-200 flex items-center justify-center`}
                  onClick={() => {
                    setLiabilities(prevLiabilities =>
                      prevLiabilities.map(liability =>
                        liability.id === item.id
                          ? { ...liability, isVerified: !liability.isVerified }
                          : liability
                      )
                    );
                  }}
                >
                  {item.isVerified ? "Mark Unverified" : "Verify"}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="w-full flex items-center justify-between mt-6 px-4">
        <span className="text-sm text-gray-600">
          Showing page {currentPage} of {totalPages || 1}
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
            {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
              const pageNum = currentPage <= 3 
                ? i + 1 
                : currentPage >= (totalPages || 1) - 2 
                  ? (totalPages || 1) - 4 + i 
                  : currentPage - 2 + i;
              
              if (pageNum <= (totalPages || 1) && pageNum > 0) {
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
            onClick={() => setCurrentPage((prev) => Math.min(totalPages || 1, prev + 1))}
            disabled={currentPage === (totalPages || 1)}
            className={`p-2 px-4 rounded-lg shadow border text-sm flex items-center ${
              currentPage === (totalPages || 1) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiabilityPage;