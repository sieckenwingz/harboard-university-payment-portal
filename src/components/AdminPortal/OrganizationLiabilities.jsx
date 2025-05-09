import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter, Tag, Calendar, Smartphone } from "lucide-react";
import { useOrganizationFeesWithPendingCount } from "./hooks/useOrganizationFeesWithPendingCount";
import { usePeriods } from "./hooks/usePeriods";
import { formatAmount } from "../../Utils";
import { supabase } from "../../App";

const OrganizationLiabilities = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { organization } = location.state || {};
  
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [unpaidCounts, setUnpaidCounts] = useState({});
  const [error, setError] = useState(null);
  const [periodMap, setPeriodMap] = useState({});

  // Fetch fees for the organization
  const { fees, loading: feesLoading, error: feesError } = useOrganizationFeesWithPendingCount(organizationId);
  
  // Fetch all periods using the existing hook
  const { periods, loading: periodsLoading, error: periodsError } = usePeriods();

  // Create a map of period IDs to semester information for quick lookup
  useEffect(() => {
    if (periods && periods.length > 0) {
      const map = {};
      periods.forEach(period => {
        map[period.id] = formatSemester(period.semester);
      });
      setPeriodMap(map);
      console.log("Period map created:", map);
    }
  }, [periods]);

  useEffect(() => {
    if (!organization) {
      navigate("/");
      return;
    }

    // Fetch unpaid counts for each fee
    const fetchUnpaidCounts = async () => {
      if (!fees || !fees.length) return;

      try {
        // For each fee, count the student_fees with no payment_id
        const unpaidCountsByFee = {};
        
        await Promise.all(fees.map(async (fee) => {
          const { data, error } = await supabase
            .from('student_fees')
            .select('count')
            .eq('fee_id', fee.id)
            .is('payment_id', null);
            
          if (error) throw error;
          
          // The count result is in data[0].count
          unpaidCountsByFee[fee.id] = data[0]?.count || 0;
        }));
        
        setUnpaidCounts(unpaidCountsByFee);
      } catch (err) {
        console.error("Error fetching unpaid counts:", err);
        setError(err.message);
      }
    };

    fetchUnpaidCounts();
  }, [organization, navigate, fees]);

  // Show error if something went wrong
  if (error || feesError || periodsError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-500 font-medium">
          Error: {error || feesError?.message || periodsError?.message}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#a63f42] text-white rounded-md"
        >
          Reload page
        </button>
      </div>
    );
  }

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

  // Helper function to format semester values
  const formatSemester = (semester) => {
    // Handle both string and numeric representations
    if (semester === "FIRST" || semester === 1 || semester === "1") return "First";
    if (semester === "SECOND" || semester === 2 || semester === "2") return "Second";
    if (semester === "SUMMER" || semester === 3 || semester === "3") return "Summer";
    
    // If it's already a display format like "First Semester", just return it
    if (typeof semester === 'string' && 
        (semester.includes("First") || 
         semester.includes("Second") || 
         semester.includes("Summer"))) {
      return semester;
    }
    
    // Otherwise, return as is
    return semester || "N/A";
  };

  // Get semester information using the period map
  const getSemester = (fee) => {
    if (!fee) return "N/A";
    
    try {
      // First check the periodMap using different possible period ID locations
      let periodId;

      // Try to get period ID from various possible locations
      if (typeof fee.periodId === 'object' && fee.periodId?.id) {
        periodId = fee.periodId.id;
      } else if (typeof fee.period_id === 'object' && fee.period_id?.id) {
        periodId = fee.period_id.id;
      } else if (typeof fee.period === 'object' && fee.period?.id) {
        periodId = fee.period.id;
      } else {
        // Try direct values
        periodId = fee.periodId || fee.period_id || fee.period;
      }
      
      // If we found a period ID and it exists in our map, return the semester
      if (periodId && periodMap[periodId]) {
        return periodMap[periodId];
      }
      
      // Fall back to checking for semester in the fee object itself
      if (typeof fee.semester === 'string' || typeof fee.semester === 'number') {
        return formatSemester(fee.semester);
      }
      
      // As a last resort, look for semester info in period objects
      if (typeof fee.periodId === 'object' && fee.periodId?.semester) {
        return formatSemester(fee.periodId.semester);
      }
      if (typeof fee.period_id === 'object' && fee.period_id?.semester) {
        return formatSemester(fee.period_id.semester);
      }
      if (typeof fee.period === 'object' && fee.period?.semester) {
        return formatSemester(fee.period.semester);
      }
      
      // If we still haven't found anything, return N/A
      return "N/A";
    } catch (err) {
      console.error("Error getting semester:", err);
      return "N/A";
    }
  };

  // Format GCash number to always start with 0
  const formatGCashNumber = (number) => {
    if (!number) return "N/A";
    
    // Convert to string if it's not already
    const gcashStr = String(number);
    
    // If it already starts with 0, return as is
    if (gcashStr.startsWith('0')) {
      return gcashStr;
    }
    
    // Otherwise, add 0 at the beginning
    return '0' + gcashStr;
  };

  // Get GCash number from fee
  const getGCashNumber = (fee) => {
    if (!fee) return "N/A";
    
    try {
      // Try different possible property names
      const accountNumber = 
        fee.accountNumber || 
        fee.account_number || 
        fee.gcashNumber || 
        fee.gcash_number;
        
      return formatGCashNumber(accountNumber);
    } catch (err) {
      console.error("Error getting GCash number:", err);
      return "N/A";
    }
  };

  // Safely filter liabilities with null checks
  const filteredLiabilities = (fees || []).filter((item) => {
    // filter by category
    
    
    // filter by search term with null checks
    if (searchTerm && searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      const nameMatch = item.name ? item.name.toLowerCase().includes(search) : false;
      const categoryMatch = item.category ? item.category.toLowerCase().includes(search) : false;
      
      // If neither name nor category matches, filter it out
      if (!nameMatch && !categoryMatch) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLiabilities.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLiabilities = filteredLiabilities.slice(startIndex, startIndex + rowsPerPage);

  // Get the actual count of pending verifications for all fees
  const getTotalPendingVerifications = () => {
    return (fees || []).reduce((total, item) => total + (item.pendingVerificationFeeCount || 0), 0);
  };

  // Get the actual total of unpaid student fees
  const getTotalUnpaidCount = () => {
    // Sum up all the unpaid counts from our state
    return Object.values(unpaidCounts).reduce((sum, count) => sum + (count || 0), 0);
  };

  const isLoading = feesLoading || periodsLoading;

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
            {organization?.name || "Organization"} - Liabilities
          </h1>
          <p className="text-gray-600 mt-1">
            {getTotalPendingVerifications()} pending student payments, {getTotalUnpaidCount()} unpaid across {fees ? fees.length : 0} liabilities
          </p>
        </div>
      </div>

      <div className="w-full flex items-center mt-6 gap-6 flex-wrap">
        {/* removed filtering ng membership fees/school 
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
            <Tag className="absolute left-2 top-2.5 text-gray-500" size={18} />
            <ChevronDown className="absolute right-2 top-2.5 text-gray-500" size={16} />
          </div>
        </div>
        */}

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

      {/* Table Header - Rearranged columns with new GCash column */}
      <div className="w-full flex justify-between py-4 mt-6 border-b bg-gray-50 px-4 rounded-t-lg">
        <span style={{ width: "20%" }} className="text-gray-700 font-semibold">LIABILITY NAME</span>
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">ACADEMIC YEAR</span>
        <span style={{ width: "10%" }} className="text-gray-700 font-semibold">SEMESTER</span>
        <span style={{ width: "12%" }} className="text-gray-700 font-semibold">AMOUNT</span>
        <span style={{ width: "18%" }} className="text-gray-700 font-semibold">GCASH NUMBER</span>
        
        <span style={{ width: "15%" }} className="text-gray-700 font-semibold">PAYMENT DUE</span>
        <span style={{ width: "10%" }} className="text-gray-700 font-semibold">STATUS</span>
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
            // Use our unpaidCounts state to show the actual unpaid count
            const unpaidCount = unpaidCounts[item.id] || 0;
            const semester = getSemester(item);
            const gcashNumber = getGCashNumber(item);
            const academicYear = item.academicYear || item.academic_year || item.period?.academicYear || "N/A";
            
            return (
              <div
                key={item.id}
                className="w-full flex justify-between py-4 px-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToStudentPayments(item)}
              >
                <span style={{ width: "20%" }} className="text-gray-700 font-medium">
                  {item.name || "Unnamed Liability"}
                </span>
                <span style={{ width: "15%" }} className="text-gray-600">
                  {academicYear}
                </span>
                <span style={{ width: "11%" }} className="text-gray-600">
                  {semester}
                </span>
                <span style={{ width: "12%" }} className="text-gray-600">
                  {formatAmount(item.amount)}
                </span>
                <span style={{ width: "18%" }} className="text-gray-600">
                  {gcashNumber}
                </span>
                <span style={{ width: "13%" }} className="text-gray-600">
                  {item.formattedDeadline || "No deadline"}
                </span>
                <span style={{ width: "12%" }}>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-orange-100 border border-orange-300 text-orange-700">
                    {unpaidCount} unpaid students
                  </span>
                </span>
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