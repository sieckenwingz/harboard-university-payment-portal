// 1st nav sa liabilities sidebar
// department overview

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter, Users, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import ViewDetailsPopup from "./ViewDetailsPopup"; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null); 
  
  // sample academic departments data
  const universityDepartments = [
    "College of Engineering",
    "College of Business",
    "College of Arts and Sciences",
    "College of Education",
    "College of Medicine",
    "College of Law",
    "College of Architecture",
    "College of Agriculture",
    "College of Fine Arts",
    "College of Information Technology"
  ];
  
  // sample departments data
  const generateDepartments = () => {
    const result = [];
    // departments
    universityDepartments.forEach((dept, i) => {
      result.push({
        id: i + 1,
        name: dept,
        type: "Academic Department",
        pendingVerifications: Math.floor(Math.random() * 30) + 1,
        lastUpdate: `2025-04-${(i % 25) + 1}`
      });
    });
    
    return result;
  };
  
  const [departments, setDepartments] = useState(generateDepartments());

  useEffect(() => {
    // loading data simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const rowsPerPage = 5;

  const handleDropdownChange = (e, filterType) => {
    if (filterType === "Status") setStatusFilter(e.target.value);
  };

  const updateDepartmentData = (departmentId, newData) => {
    setDepartments(prevDepartments => 
      prevDepartments.map(item => 
        item.id === departmentId ? { ...item, ...newData } : item
      )
    );
  };

  //to navigate to department liabilities page
  const navigateToDepartmentLiabilities = (department) => {
    navigate(`/department-liabilities/${department.id}`, { state: { department } });
  };

  //to open popup with department details
  const openDepartmentPopup = (department, e) => {
    e.stopPropagation(); // Stop event propagation to prevent row click
    setSelectedDepartment(department);
    setShowPopup(true);
  };

  // to close popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedDepartment(null);
  };

  //to handle data changes from popup if needed
  const handlePopupDataChange = (departmentId, newData) => {
    updateDepartmentData(departmentId, newData);
    closePopup();
  };

  const filteredDepartments = departments.filter((item) => {
    // filter by verification status (High, Medium, Low)
    if (statusFilter === "High Priority" && item.pendingVerifications < 20) return false;
    if (statusFilter === "Medium Priority" && (item.pendingVerifications < 10 || item.pendingVerifications >= 20)) return false;
    if (statusFilter === "Low Priority" && item.pendingVerifications >= 10) return false;
    
    // filter by search term
    if (searchTerm &&
      !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.type.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  let displayDepartments = [...filteredDepartments];

  const totalPages = Math.ceil(displayDepartments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentDepartments = displayDepartments.slice(startIndex, startIndex + rowsPerPage);

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
    const academic = departments.length;
    const highPriority = departments.filter(item => item.pendingVerifications >= 20).length;
    const mediumPriority = departments.filter(item => item.pendingVerifications >= 10 && item.pendingVerifications < 20).length;
    const lowPriority = departments.filter(item => item.pendingVerifications < 10).length;
    
    return { academic, highPriority, mediumPriority, lowPriority };
  };

  const summary = getSummary();

  // date format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Department Overview
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-600 font-medium">Total Departments</p>
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
            placeholder="Search by department name..."
            className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "40%" }} className="text-gray-700 font-semibold">DEPARTMENT</span>
        <span style={{ width: "40%" }} className="text-gray-700 font-semibold">STATUS</span>
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">ACTIONS</span>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
        </div>
      ) : currentDepartments.length === 0 ? (
        <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
          No departments found.
        </div>
      ) : (
        <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
          {currentDepartments.map((item) => {
            const priorityStyle = getPriorityStyle(item.pendingVerifications);
            return (
              <div
                key={item.id}
                className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToDepartmentLiabilities(item)}
              >
                <span style={{ width: "40%" }} className="text-gray-700 font-medium">{item.name}</span>
                <span style={{ width: "40%" }} className="flex items-center">
                  <span 
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${priorityStyle.bgColor} border ${priorityStyle.borderColor}`} 
                    style={{ color: priorityStyle.color }}
                  >
                    {priorityStyle.icon}
                    {item.pendingVerifications} pending liabilities
                  </span>
                </span>
                <span style={{ width: "20%" }}>
                  <button 
                    onClick={(e) => openDepartmentPopup(item, e)}
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

      <ViewDetailsPopup
        show={showPopup} 
        departmentData={selectedDepartment} 
        onClose={closePopup} 
        onDataChange={handlePopupDataChange} 
      />
    </div>
  );
};

export default AdminDashboard;