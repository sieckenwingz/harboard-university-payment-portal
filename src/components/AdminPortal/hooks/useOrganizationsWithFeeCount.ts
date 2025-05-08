// hooks/useOrganizationsWithFeeCount.js
import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { toCamelCase } from '../../../Utils';

export interface OrganizationWithFeeCount {
    id: string;
    name: string;
    feeCount: number;  // No. of fees under an organization
    pendingVerificationFeeCount: number;  // Fees with [Status.UNDER_REVIEW]
    unsettledFeeCount: number;  // Actually UNPAID fees, not just tagged students
}

interface UseOrganizationsWithFeeCountResult {
    organizations: OrganizationWithFeeCount[];
    loading: boolean;
    error: Error | null;
}

export const useOrganizationsWithFeeCount = (): UseOrganizationsWithFeeCountResult => {
    const [organizations, setOrganizations] = useState<OrganizationWithFeeCount[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                // Get all organizations
                const { data: orgsData, error: orgsError } = await supabase
                    .from('organizations')
                    .select('*');

                if (orgsError) throw orgsError;

                // For each organization, fetch the student fees data to count unpaid fees
                const enhancedOrgs = await Promise.all(orgsData.map(async (org) => {
                    // Get all fees for this organization
                    const { data: orgFees, error: feesError } = await supabase
                        .from('fees')
                        .select('id')
                        .eq('organization_id', org.id);
                        
                    if (feesError) throw feesError;
                    
                    // If no fees, return default values
                    if (!orgFees || orgFees.length === 0) {
                        return {
                            ...org,
                            feeCount: 0,
                            pendingVerificationFeeCount: 0,
                            unsettledFeeCount: 0
                        };
                    }
                    
                    // Get all fee ids for this organization
                    const feeIds = orgFees.map(fee => fee.id);
                    
                    // Get student fees that have either no payment or payment with UNDER_REVIEW status
                    const { data: studentFees, error: studentFeesError } = await supabase
                        .from('student_fees')
                        .select('*, payment_id(*)')
                        .in('fee_id', feeIds);
                        
                    if (studentFeesError) throw studentFeesError;
                    
                    // Count for pending verification (UNDER_REVIEW)
                    const pendingCount = studentFees.filter(sf => 
                        sf.payment_id && sf.payment_id.status === 'UNDER_REVIEW'
                    ).length;
                    
                    // Count for truly unpaid/unsettled (no payment record)
                    const unpaidCount = studentFees.filter(sf => !sf.payment_id).length;
                    
                    return {
                        ...org,
                        feeCount: orgFees.length,
                        pendingVerificationFeeCount: pendingCount,
                        unsettledFeeCount: unpaidCount
                    };
                }));

                // Convert to camelCase and set state
                const camelCaseOrgs = enhancedOrgs.map(org => toCamelCase(org));
                setOrganizations(camelCaseOrgs as OrganizationWithFeeCount[]);
            } catch (err) {
                console.error('Error fetching organizations with counts:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrgs();
    }, []);

    return { organizations, loading, error };
};