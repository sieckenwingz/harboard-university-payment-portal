import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { StudentFee } from '../../../models/StudentFee';
import { Status } from '../../../models/Status';

interface UseStudentFeesResult {
    studentFees: StudentFee[];
    verifiedStudentFees: StudentFee[];
    rejectedStudentFees: StudentFee[];
    loading: boolean;
    error: Error | null;
}

export const useStudentFees = (feeId: string | null): UseStudentFeesResult => {
    const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
    const [verifiedStudentFees, setVerifiedStudentFees] = useState<StudentFee[]>([]);
    const [rejectedStudentFees, setRejectedStudentFees] = useState<StudentFee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
  
    useEffect(() => {
        if (!feeId) return;
    
        const fetchFees = async () => {
            setLoading(true);
            let all: StudentFee[] = [];
            const { data, error } = await supabase
                .from('student_fees')
                .select('*, student_id(*), payment_id(*), fee_id(*, organization_id(*))')
                .eq('fee_id', feeId);
        
            if (error) {
                setError(error as Error);
            } else if (data) {
                all = data.map((d) => new StudentFee(d));
            }

            setStudentFees(all.filter((fee) => fee.status == Status.UNDER_REVIEW));
            setVerifiedStudentFees(all.filter((fee) => fee.status == Status.PAID));
            setRejectedStudentFees(all.filter((fee) => fee.status == Status.REJECTED));
    
            setLoading(false);
        };
    
        fetchFees();
    }, [feeId]);
  
    return { studentFees, verifiedStudentFees, rejectedStudentFees, loading, error };
};
