// src/components/AdminPortal/hooks/useLiabilities.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../../App';

// Define interfaces for our data structures
interface OrganizationWithLiabilities {
  id: number;
  organization: string;
  liabilities: any[];
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
      
      // Get all fees to count them per organization
      const { data: allFees, error: feesError } = await supabase
        .from('fees')
        .select('*');
        
      if (feesError) throw feesError;
      
      // Process each organization to count its fees
      const orgsWithCounts: OrganizationWithLiabilities[] = orgs.map(org => {
        // Filter fees by this organization ID
        const orgFees = allFees.filter(fee => fee.organization_id === org.id);
        
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

  const getLiabilitiesByOrganization = async (orgId: number): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('organization_id', orgId);
        
      if (error) throw error;
      
      return data || [];
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