import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { Status } from '../../../models/Status';
import { Fee } from '../../../models/Fee';

interface UseFeesResult {
    fees: Fee[];
    loading: boolean;
    error: Error | null;
}

export const useFees = (orgId: number): UseFeesResult => {
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchFees = async () => {
            
            setLoading(true);
            let all: Fee[] = [];
            const { data, error } = await supabase
                .from('fees')
                .select('*, organization_id(*), period_id(*)')
                .eq('organization_id', orgId);
        
            if (error) {
                setError(error as Error);
            } else if (data) {
                all = data.map((d) => new Fee(d));
                setFees(all);
            }
    
            setLoading(false);
        };

        fetchFees();
    }, []);
  
    return { fees, loading, error };
};
