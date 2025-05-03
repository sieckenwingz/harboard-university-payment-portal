// hooks/useOrganizationsWithFeeCount.js
import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { Fee } from '../../../models/Fee';

export class FeeWithPendingCount extends Fee {
    pendingFeeCount: number;

    constructor(data: Record<string, any>) {
        super(data);
        this.pendingFeeCount = data.pending_count;
    }
}

interface UseOrganizationFeesWithPendingCountResult {
    fees: Fee[];
    loading: boolean;
    error: Error | null;
}

export const useOrganizationFeesWithPendingCount = (organizationId: string | null): UseOrganizationFeesWithPendingCountResult => {
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
  
    useEffect(() => {
        if (!organizationId) return;
    
        const fetchFees = async () => {
            setLoading(true);
            const { data, error } = await supabase
            .from('fees_with_pending_count')
            .select('*')
            .eq('organization_id', organizationId);
    
            if (error) {
                setError(error as Error);
            } else if (data) {
                setFees(data.map((d) => new FeeWithPendingCount(d)));
            }
    
            setLoading(false);
        };
    
        fetchFees();
    }, [organizationId]);
  
    return { fees, loading, error };
};
