import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter, Eye } from "lucide-react";
import ManageReceiptView from "./ManageReceiptView";
import { useLiabilities } from "./hooks/useLiabilities";
import { useStudentFees } from "./hooks/useStudentFees";
import PaymentReceiptModal from "./PaymentReceiptModal";
import { useFees } from "./hooks/useFees";

const Management = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("liabilities");
  const [organizationFilter, setOrganizationFilter] = useState("All Organizations");
  const [liabilityFilter, setLiabilityFilter] = useState("All Liabilities");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedStudentFee, setSelectedReceipt] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { 
    organizations: organizationLiabilities, 
    isLoading, 
    error,
    refreshOrganizations
  } = useLiabilities();

  /**
   * TODO: Currently only showing student fees for the fee_id 1.
   */
  const { studentFees, verifiedStudentFees, rejectedStudentFees, loading, error: sfError } = useStudentFees(1);

  const rowsPerPage = 5;

  // Keep all the existing handlers
  const handleOrganizationFilterChange = (e) => {
    setOrganizationFilter(e.target.value);
  };

  const handleLiabilityFilterChange = (e) => {
    setLiabilityFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const navigateToManageDeptLiabs = (organization) => {
    // Find the organization data to pass to the next screen
    const orgData = organizationLiabilities.find(d => d.organization === organization);
    
    navigate(`/${organization.organization.replace(/\s+/g, '-').toLowerCase()}-liabilities`, { 
      state: { 
        organization: organization,
        organizationId: orgData?.id,
        liabilities: orgData?.liabilities || []
      } 
    });
  };

  const handleViewReceipt = (payment) => {
    setSelectedReceipt(payment);
    setShowPaymentModal(true);
  };

  // Filter organizations based on search
  const filteredOrganizations = organizationLiabilities.filter((item) => {
    if (searchTerm && 
        !item.organization.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Keep existing student payments filtering logic
  const filteredStudentPayments = studentFees.filter((item) => {
    if (organizationFilter !== "All Organizations" && item.organization !== organizationFilter) {
      return false;
    }

    if (liabilityFilter !== "All Liabilities" && item.liabilityName !== liabilityFilter) {
      return false;
    }

    if (statusFilter !== "All Status" && item.status !== statusFilter) {
      return false;
    }

    if (searchTerm &&
      !item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.studentId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  let displayData = activeTab === "liabilities" ? [...filteredOrganizations] : [...filteredStudentPayments];

  const totalPages = Math.ceil(displayData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = displayData.slice(startIndex, startIndex + rowsPerPage);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
    setOrganizationFilter("All Organizations");
    setLiabilityFilter("All Liabilities");
    setStatusFilter("All Status");
  };

  const getOrganizationOptions = () => {
    return ["All Organizations", ...organizationLiabilities.map(org => org.organization)];
  };

  const getLiabilityOptions = () => {
    const liabilityNames = [
      "All Liabilities",
      "Tuition Fee",
      "Laboratory Fee",
      "Library Fee",
      "Technology Fee",
      "Athletic Fee",
      "Student Council",
      "Engineering Society",
      "Business Club",
      "Arts Club",
      "Medical Society"
    ];
    return liabilityNames;
  };

  const getStatusOptions = () => {
    return ["All Status", "Accepted", "Rejected"];
  };

  // Render error message if there was an error fetching data
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">Error loading organizations: {error}</div>
          <button 
            onClick={refreshOrganizations}
            className="px-4 py-2 bg-[#a63f42] text-white rounded-md hover:bg-[#8a3538]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Liabilities Management
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 text-base transition-all duration-200 ease-in-out ${
            activeTab === "liabilities"
              ? "text-[#a63f42] font-semibold border-b-2 border-[#a63f42]"
              : "text-gray-500 font-medium hover:text-[#a63f42] border-b-2 border-transparent hover:border-gray-300"
          }`}
          onClick={() => changeTab("liabilities")}
        >
          Organization Liabilities
        </button>
        <button
          className={`py-3 px-6 text-base transition-all duration-200 ease-in-out ${
            activeTab === "payments"
              ? "text-[#a63f42] font-semibold border-b-2 border-[#a63f42]"
              : "text-gray-500 font-medium hover:text-[#a63f42] border-b-2 border-transparent hover:border-gray-300"
          }`}
          onClick={() => changeTab("payments")}
        >
          Student Payments
        </button>
      </div>

      {/* Organization Liabilities Tab Content */}
      {activeTab === "liabilities" && (
        <>
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organization..."
              className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>

          {/* Table Header */}
          <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
            <span style={{ width: "70%" }} className="text-gray-700 font-semibold">ORGANIZATION</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">LIABILITIES ASSIGNED</span>
          </div>

          {isLoading ? (
            <div className="w-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
              No organizations found.
            </div>
          ) : (
            <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
              {currentData.map((organization) => (
                <div
                  key={organization.organization}
                  className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigateToManageDeptLiabs(organization)}
                >
                  <span style={{ width: "70%" }} className="text-gray-700 font-medium">
                    {organization.organization}
                  </span>
                  <span style={{ width: "30%" }} className="text-red-700">
                    {organization.count} {organization.count === 1 ? 'liability' : 'liabilities'} assigned
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Student Payments Tab Content */}
      {activeTab === "payments" && (
        <>
          <div className="w-full flex items-center mt-6 gap-4 flex-wrap">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <select
                  value={organizationFilter}
                  onChange={handleOrganizationFilterChange}
                  className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
                >
                  {getOrganizationOptions().map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
                <Filter className="absolute left-2 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative">
                <select
                  value={liabilityFilter}
                  onChange={handleLiabilityFilterChange}
                  className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
                >
                  {getLiabilityOptions().map(liability => (
                    <option key={liability} value={liability}>{liability}</option>
                  ))}
                </select>
                <Filter className="absolute left-2 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="pl-8 pr-6 py-2 border rounded-md text-gray-700 w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
                >
                  {getStatusOptions().map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
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
                placeholder="Search by student name or ID..."
                className="pl-10 pr-4 py-2 border rounded-md text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-[#a63f42] focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            </div>
          </div>

          {/* Table Header */}
          <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
            <span style={{ width: "20%" }} className="text-gray-700 font-semibold">STUDENT NAME</span>
            <span style={{ width: "30%" }} className="text-gray-700 font-semibold">ORGANIZATION</span>
            <span style={{ width: "20%" }} className="text-gray-700 font-semibold">LIABILITY NAME</span>
            <span style={{ width: "15%" }} className="text-gray-700 font-semibold">STATUS</span>
            <span style={{ width: "15%" }} className="text-gray-700 font-semibold">PAYMENT DATE</span>
            <span style={{ width: "10%" }} className="text-gray-700 font-semibold text-center">ACTION</span>
          </div>

          {isLoading ? (
            <div className="w-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a63f42]"></div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="w-full flex justify-center items-center h-32 text-gray-500 text-sm bg-gray-50 rounded-b-lg">
              No payments found.
            </div>
          ) : (
            <div className="w-full flex flex-col rounded-b-lg overflow-hidden shadow-sm border border-gray-200">
              {currentData.map((payment) => (
                <div
                  key={payment.id}
                  className="w-full flex justify-between items-center py-4 px-4 border-b hover:bg-gray-50"
                >
                  <span style={{ width: "20%" }} className="text-gray-700 font-medium">
                    {payment.studentName}
                    <div className="text-xs text-gray-500">{payment.studentId.getFullName()}</div>
                  </span>
                  <span style={{ width: "30%" }} className="text-gray-700">
                    {payment.feeId.organizationId.name}
                  </span>
                  <span style={{ width: "20%" }} className="text-gray-700">
                    {payment.feeId.name}
                    <div className="text-xs text-gray-500">{payment.liabilityType}</div>
                  </span>
                  <span style={{ width: "15%" }} className="text-gray-700">
                    <span 
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${
                        payment.status === "Accepted" 
                          ? "bg-green-100 border border-green-300 text-green-800" 
                          : "bg-red-100 border border-red-300 text-red-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </span>
                  <span style={{ width: "15%" }} className="text-gray-700">
                    {formatDate(payment.paymentId.paymentDate)}
                  </span>
                  <span style={{ width: "10%" }} className="flex justify-center">
                    <button 
                      className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                      title="View Receipt"
                      onClick={() => handleViewReceipt(payment)}
                    >
                      <Eye size={18} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
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
            {Array.from({ length: totalPages > 0 ? Math.min(5, totalPages) : 1 }, (_, i) => {
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
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 px-4 rounded-lg shadow border text-sm flex items-center ${
              currentPage === totalPages || totalPages === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {showPaymentModal && selectedStudentFee && (
        <PaymentReceiptModal
          studentFee={selectedStudentFee}
          formatAmount={formatAmount}
          formatDate={formatDate}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={null}
          onReject={null}
        />
      )}
    </div>
  );
}

export default Management;