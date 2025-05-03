// hooks/useOrganizationsWithFeeCount.js
import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { toCamelCase } from '../../../Utils';

export interface OrganizationWithFeeCount {
    id: string;
    name: string;
    feeCount: number;
    pendingFeeCount: number;
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
        const { data, error } = await supabase
            .from('organizations_with_fee_count')
            .select('id, name, fee_count, pending_fee_count');

        if (error) {
            setError(error as Error);
        } else if (data) {
            const camelCaseOrgs = data.map((org: any) => toCamelCase(org));
            setOrganizations(camelCaseOrgs as OrganizationWithFeeCount[]);
        }

        setLoading(false);
        };

        fetchOrgs();
    }, []);

    return { organizations, loading, error };
};
