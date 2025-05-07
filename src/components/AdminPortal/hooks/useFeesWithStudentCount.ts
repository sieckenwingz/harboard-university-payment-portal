import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { Status } from '../../../models/Status';
import { Fee } from '../../../models/Fee';

export class FeeWithStudentCount extends Fee {
    studentCount: number;
    taggedCount: number;

    constructor(data: Record<string, any>) {
        super(data);
        this.studentCount = data.student_count;
        this.taggedCount = data.tagged_count;
    }
}

interface UseFeesWithStudentCountResult {
    fees: FeeWithStudentCount[];
    loading: boolean;
    error: Error | null;
    refetchFees: () => Promise<Fee[]>;
}

export const useFeesWithStudentCount = (orgId: number): UseFeesWithStudentCountResult => {
    const [fees, setFees] = useState<FeeWithStudentCount[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const refetchFees = async () => {
        setLoading(true);
        let all: FeeWithStudentCount[] = [];
        const { data, error } = orgId ? 
            await supabase
                .from('fees_with_student_count')
                .select('*, organization_id(*), period_id(*)')
                .eq('organization_id', orgId) 
            : await supabase
                .from('fees_with_student_count')
                .select('*, organization_id(*), period_id(*)');
    
        if (error) {
            setError(error as Error);
        } else if (data) {
            all = data.map((d) => new FeeWithStudentCount(d));
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