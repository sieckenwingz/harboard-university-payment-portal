import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { AcademicYear, Period } from '../../../models/Period';
import { StudentPeriod } from '../../../models/StudentPeriod';
import { Student } from '../../../models/Student';

interface UseUntaggedStudentsResult {
    untaggedStudents: Student[];
    loading: boolean;
    error: Error | null;
}

export const useUntaggedStudents = (feeId: number): UseUntaggedStudentsResult => {
    const [untaggedStudents, setUntaggedStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchOrgs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .rpc('get_students_untagged', { m_fee_id: feeId });

            if (error) {
                setError(error as Error);
            } else if (data) {
                const students = data.map((data) => new Student(data));
                setUntaggedStudents(students)
            }

            setLoading(false);
        };

        fetchOrgs();
    }, [feeId]);

    return { untaggedStudents, loading, error };
};
