import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { AcademicYear, Period } from '../../../models/Period';
import { StudentPeriod } from '../../../models/StudentPeriod';

interface UseStudentPeriodsResult {
    studentPeriods: StudentPeriod[];
    loading: boolean;
    error: Error | null;
}

export const useStudentPeriods = (organizationId: number, periodId: number): UseStudentPeriodsResult => {
    const [studentPeriods, setStudentPeriods] = useState<StudentPeriod[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchOrgs = async () => {
            const { data, error } = await supabase
                .from('student_periods')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('period_id', periodId);

            if (error) {
                setError(error as Error);
            } else if (data) {
                setStudentPeriods(data.map((e) => new StudentPeriod(e)))
            }

            setLoading(false);
        };

        fetchOrgs();
    }, []);

    return { studentPeriods, loading, error };
};
