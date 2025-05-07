// 2nd nav sa liabilities dashboard
// "college of..." liabilities

import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { useOrganizationFeesWithPendingCount } from "./hooks/useOrganizationFeesWithPendingCount";

const OrganizationLiabilities = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { organization } = location.state || {};
  
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");

  const { fees, loading, error } = useOrganizationFeesWithPendingCount(organizationId);

  useEffect(() => {
    if (!organization) {
      navigate("/");
      return;
    }
  }, [organization, navigate]);

  const rowsPerPage = 5;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDropdownChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const navigateToStudentPayments = (liability) => {
    navigate(`/organizations/${organizationId}/liabilities/${liability.id}`, {
      state: { 
        organization, 
        liability 
      }
    });
  };

  const filteredLiabilities = fees.filter((item) => {
    // filter by category
    if (categoryFilter !== "All Categories" && item.category !== categoryFilter) return false;
    
    // filter by search term
    if (searchTerm &&
      !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLiabilities.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLiabilities = filteredLiabilities.slice(startIndex, startIndex + rowsPerPage);

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

  const getTotalPendingVerifications = () => {
    return fees.reduce((total, item) => total + item.pendingVerificationFeeCount, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleGoBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {organization?.name} Liabilities
          </h1>
          <p className="text-gray-600 mt-1">
            {getTotalPendingVerifications()} pending student payments across {fees.length} liabilities
          </p>
        </div>
      </div>

      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={handleDropdownChange}
              className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
              <option>All Categories</option>
              <option>School Fees</option>
              <option>Membership Fees</option>
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
            placeholder="Search liability name..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "25%" }} className="text-gray-700 font-semibold">LIABILITY NAME</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">AMOUNT</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">STATUS</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">PAYMENT DUE</span>
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
            return (
              <div
                key={item.id}
                className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToStudentPayments(item)}
              >
                <span style={{ width: "25%" }} className="text-gray-700 font-medium">{item.name}</span>
                <span style={{ width: "15%" }} className="text-gray-600">{formatAmount(item.amount)}</span>
                <span style={{ width: "20%" }}>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-orange-100 border border-orange-300 text-orange-700">
                    {item.pendingVerificationFeeCount} pending students
                  </span>
                </span>
                <span style={{ width: "20%" }} className="text-gray-600">{item.formattedDeadline}</span>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
};

export default OrganizationLiabilities;