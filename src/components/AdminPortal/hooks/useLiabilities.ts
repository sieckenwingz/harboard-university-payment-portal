// src/components/AdminPortal/hooks/useLiabilities.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../../App';
import { getAllFees, getFeesByOrganization } from '../../../helpers/FeeHelpers';
import { Fee } from '../../../models/Fee';

// Define interfaces for our data structures
interface OrganizationWithLiabilities {
  id: number;
  organization: string;
  liabilities: Fee[];
  count: number;
}

export const useLiabilities = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithLiabilities[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationsWithCounts = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch organizations
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id, name');
        
      if (orgError) throw orgError;
      
      // Fetch all fees
      const fees = await getAllFees();
      
      if (!fees) {
        throw new Error('Failed to fetch fees');
      }
      
      // Count liabilities per organization
      const orgsWithCounts: OrganizationWithLiabilities[] = orgs.map(org => {
        const orgFees = fees.filter(fee => {
          const feeOrgId = typeof fee.organizationId === 'object' 
            ? fee.organizationId.id 
            : fee.organizationId;
          return feeOrgId === org.id;
        });
        
        return {
          id: org.id,
          organization: org.name,
          liabilities: orgFees,
          count: orgFees.length
        };
      });
      
      setOrganizations(orgsWithCounts);
    } catch (err: any) {
      console.error('Error fetching organizations with counts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getLiabilitiesByOrganization = async (orgId: number): Promise<Fee[]> => {
    try {
      const fees = await getFeesByOrganization(orgId);
      return fees || [];
    } catch (err: any) {
      console.error(`Error fetching liabilities for organization ${orgId}:`, err);
      setError(err.message);
      return [];
    }
  };

  // Load organizations on initial mount
  useEffect(() => {
    fetchOrganizationsWithCounts();
  }, []);

  return {
    organizations,
    isLoading,
    error,
    refreshOrganizations: fetchOrganizationsWithCounts,
    getLiabilitiesByOrganization
  };
};