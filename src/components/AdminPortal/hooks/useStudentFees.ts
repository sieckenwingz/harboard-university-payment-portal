import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { StudentFee } from '../../../models/StudentFee';
import { Status } from '../../../models/Status';
import { Student } from '../../../models/Student';

interface UseStudentFeesResult {
    studentFees: StudentFee[];
    verifiedStudentFees: StudentFee[];
    rejectedStudentFees: StudentFee[];
    loading: boolean;
    error: Error | null;
}

export const useStudentFees = (feeId: string | null): UseStudentFeesResult => {
    const [allFees, setAllFees] = useState<StudentFee[]>([]);
    const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
    const [verifiedStudentFees, setVerifiedStudentFees] = useState<StudentFee[]>([]);
    const [rejectedStudentFees, setRejectedStudentFees] = useState<StudentFee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
  
    const fetchFees = async () => {
        if (!feeId) return;
        
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
            setAllFees(all);
        }

        setLoading(false);
    };

    useEffect(() => {
        setStudentFees(allFees.filter((fee) => fee.status == Status.UNDER_REVIEW));
        setVerifiedStudentFees(allFees.filter((fee) => fee.status == Status.PAID));
        setRejectedStudentFees(allFees.filter((fee) => fee.status == Status.REJECTED));
    }, [allFees]);

    useEffect(() => {
        fetchFees();

        if (!feeId) return;

        // Subscribe to changes in student_fees table
        const channel = supabase.channel(`student-fees-${feeId}`)
            .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'payments',
            },
            (payload) => {
                /**
                 * TODO: Optimize
                 * 
                 * This currently refetches ALL student_fees whenever the payments
                 * table changes.
                 */
                fetchFees();
            })
            .subscribe();

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [feeId]);
  
    return { studentFees, verifiedStudentFees, rejectedStudentFees, loading, error };
};
