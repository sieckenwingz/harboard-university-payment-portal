import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { StudentFee } from '../../../models/StudentFee';
import { Status } from '../../../models/Status';
import { Student } from '../../../models/Student';

interface UseStudentFeesResult {
    allStudentFees: StudentFee[];
    pendingStudentFees: StudentFee[];
    verifiedStudentFees: StudentFee[];
    rejectedStudentFees: StudentFee[];
    unpaidStudentFees: StudentFee[];
    loading: boolean;
    error: Error | null;
}

export const useStudentFees = (feeId: string | null, orgIds: number[] | null): UseStudentFeesResult => {
    const [allStudentFees, setAllStudentFees] = useState<StudentFee[]>([]);
    const [pendingStudentFees, setPendingStudentFees] = useState<StudentFee[]>([]);
    const [verifiedStudentFees, setVerifiedStudentFees] = useState<StudentFee[]>([]);
    const [rejectedStudentFees, setRejectedStudentFees] = useState<StudentFee[]>([]);
    const [unpaidStudentFees, setUnpaidStudentFees] = useState<StudentFee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
  
    const fetchFees = async () => {       
        if (!feeId && (!orgIds || orgIds.length === 0)) return;

        setLoading(true);
        let all: StudentFee[] = [];
        const { data, error } = feeId ? 
            await supabase
                .from('student_fees')
                .select('*, student_id(*), payment_id(*), fee_id(*, organization_id(*))')
                .eq('fee_id', feeId) 
            : await supabase
                .from('student_fees')
                .select('*, student_id(*), payment_id(*), fee_id!inner(*, organization_id!inner(*))')
                .in('fee_id.organization_id.id', orgIds!);
    
        if (error) {
            setError(error as Error);
        } else if (data) {
            all = data.map((d) => new StudentFee(d));
            setAllStudentFees(all);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchFees();
    }, [feeId, orgIds]);

    useEffect(() => {
        setPendingStudentFees(allStudentFees.filter((fee) => fee.status == Status.UNDER_REVIEW));
        setVerifiedStudentFees(allStudentFees.filter((fee) => fee.status == Status.PAID));
        setRejectedStudentFees(allStudentFees.filter((fee) => fee.status == Status.REJECTED));
        setUnpaidStudentFees(allStudentFees.filter((fee) => fee.paymentId == null));
    }, [allStudentFees]);

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
  
    return { allStudentFees, pendingStudentFees, verifiedStudentFees, rejectedStudentFees, unpaidStudentFees, loading, error };
};
