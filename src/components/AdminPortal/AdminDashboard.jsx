// src/components/AdminPortal/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter, Users, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import ViewDetailsPopup from "./ViewDetailsPopup"; 
import { supabase } from "../../App";
import { useOrganizationsWithFeeCount } from "./hooks/useOrganizationsWithFeeCount";
import { parseStatus } from "../../models/Status";
import { AcademicYear, parseAcademicYear, parseSemester } from "../../models/Period";
import { getEnumKeyByValue } from "../../helpers/EnumHelpers";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null); 
  const { organizations, loading, error } = useOrganizationsWithFeeCount();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const rowsPerPage = 5;

  const handleDropdownChange = (e, filterType) => {
    if (filterType === "Status") {
      console.log("Setting status filter to:", e.target.value);
      setStatusFilter(e.target.value);
      setCurrentPage(1);
    }
  };

  // Navigate to organization liabilities page
  const navigateToOrganizationLiabilities = (organization) => {
    navigate(`/organization-liabilities/${organization.id}`, { state: { organization } });
  };

  // Open popup with organization details
  const openOrganizationPopup = (organization, e) => {
    e.stopPropagation(); // Stop event propagation to prevent row click
    setSelectedOrganization(organization);
    setShowPopup(true);
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedOrganization(null);
  };

  // Handle data changes from popup if needed
  const handlePopupDataChange = (organizationId, newData) => {
    // updateOrganizationData(organizationId, newData);
    closePopup();
  };

  const filteredOrganizations = organizations.filter((item) => {
    // Add debugging to see what's happening
    // console.log("Item:", item.name, "Pending:", item.pendingFeeCount, "Filter:", statusFilter);

    // If all orgs have pendingFeeCount < 10, they'd all be "Low Priority"
    if (statusFilter === "High Priority" && item.pendingFeeCount < 20) {
      return false;
    }
    
    if (statusFilter === "Medium Priority" && 
       (item.pendingFeeCount < 10 || item.pendingFeeCount >= 20)) {
      return false;
    }
    
    if (statusFilter === "Low Priority" && item.pendingFeeCount >= 10) {
      return false;
    }
    
    // Search term filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  let displayOrganizations = [...filteredOrganizations];

  const totalPages = Math.ceil(displayOrganizations.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentOrganizations = displayOrganizations.slice(startIndex, startIndex + rowsPerPage);

  const getPriorityStyle = (pendingCount) => {
    if (pendingCount >= 20) {
      return { 
        color: "#e53e3e", 
        icon: <AlertTriangle size={16} className="mr-1" />, 
        bgColor: "bg-red-100",
        borderColor: "border-red-300",
        label: "High Priority"
      };
    } else if (pendingCount >= 10) {
      return { 
        color: "#dd6b20", 
        icon: <RefreshCw size={16} className="mr-1" />, 
        bgColor: "bg-orange-100",
        borderColor: "border-orange-300",
        label: "Medium Priority"
      };
    } else {
      return { 
        color: "#15aa07", 
        icon: <CheckCircle size={16} className="mr-1" />, 
        bgColor: "bg-green-100",
        borderColor: "border-green-300",
        label: "Low Priority"
      };
    }
  };

  const getSummary = () => {
    const academic = organizations.length;
    const highPriority = organizations.filter(item => item.pendingFeeCount >= 20).length;
    const mediumPriority = organizations.filter(item => item.pendingFeeCount >= 10 && item.pendingFeeCount < 20).length;
    const lowPriority = organizations.filter(item => item.pendingFeeCount < 10).length;
    
    return { academic, highPriority, mediumPriority, lowPriority };
  };

  const summary = getSummary();

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Organizations Overview
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-600 font-medium">Total Organizations</p>
              <p className="text-2xl font-bold text-blue-700">{summary.academic}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-red-600 font-medium">High Priority</p>
              <p className="text-2xl font-bold text-red-700">{summary.highPriority}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-600 font-medium">Medium Priority</p>
              <p className="text-2xl font-bold text-orange-700">{summary.mediumPriority}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <RefreshCw size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600 font-medium">Low Priority</p>
              <p className="text-2xl font-bold text-green-700">{summary.lowPriority}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        <div className="flex gap-2 items-center">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => handleDropdownChange(e, "Status")}
            className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            >
            <option>Status</option>
            <option>High Priority</option>
            <option>Medium Priority</option>
              <option>Low Priority</option>
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
            placeholder="Search by organization name..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "60%" }} className="text-gray-700 font-semibold">ORGANIZATION</span>
        <span style={{ width: "40%" }} className="text-gray-700 font-semibold">STATUS</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">ACTIONS</span>
      </div>

      {loading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : currentOrganizations.length === 0 ? (
        <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          No organizations found.
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentOrganizations.map((item) => {
            const priorityStyle = getPriorityStyle(item.pendingFeeCount);
            return (
              <div
                key={item.id}
                className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToOrganizationLiabilities(item)}
              >
                <span style={{ width: "60%" }} className="text-gray-700 font-medium">{item.name}</span>
                <span style={{ width: "40%" }} className="flex items-center">
                <span 
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${priorityStyle.bgColor} border ${priorityStyle.borderColor}`} 
                  style={{ color: priorityStyle.color }}
                  >
                  {priorityStyle.icon}
                  {item.pendingFeeCount} unpaid students
                </span>
                </span>
                <span style={{ width: "20%" }}>
                  <button 
                    onClick={(e) => openOrganizationPopup(item, e)}
                    className="px-3 py-1.5 bg-[#a63f42] text-white rounded-md text-sm hover:bg-[#8a3538] transition-colors duration-200 flex items-center justify-center"
                  >
                    View Details
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

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

      <ViewDetailsPopup
        show={showPopup} 
        organizationData={selectedOrganization} 
        onClose={closePopup} 
        onDataChange={handlePopupDataChange} 
      />
    </div>
  );
};

export default AdminDashboard;