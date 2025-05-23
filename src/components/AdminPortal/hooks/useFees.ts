import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { Status } from '../../../models/Status';
import { Fee } from '../../../models/Fee';

interface UseFeesResult {
    fees: Fee[];
    loading: boolean;
    error: Error | null;
    refetchFees: () => Promise<Fee[]>;
}

export const useFees = (orgId: number): UseFeesResult => {
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const refetchFees = async () => {
        setLoading(true);
        let all: Fee[] = [];
        const { data, error } = orgId ? 
            await supabase
                .from('fees')
                .select('*, organization_id(*), period_id(*)')
                .eq('organization_id', orgId) 
            : await supabase
                .from('fees')
                .select('*, organization_id(*), period_id(*)');
    
        if (error) {
            setError(error as Error);
        } else if (data) {
            all = data.map((d) => new Fee(d));
            setFees(all);
        }

        setLoading(false);
        return all;
    };

    useEffect(() => {
        refetchFees();
    }, [orgId]);
  
    return { fees, loading, error, refetchFees };
};