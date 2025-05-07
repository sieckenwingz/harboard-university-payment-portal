// hooks/useOrganizationsWithFeeCount.js
import { useEffect, useState } from 'react';
import { supabase } from '../../../App';
import { AcademicYear, Period } from '../../../models/Period';

interface UseOrganizationsWithFeeCountResult {
    periods: Period[];
    yearPeriods: Record<AcademicYear, Period[]>;
    loading: boolean;
    error: Error | null;
}
  
export const usePeriods = (): UseOrganizationsWithFeeCountResult => {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [yearPeriods, setYearPeriods] = useState<Record<AcademicYear, Period[]>>(<Record<AcademicYear, Period[]>>{});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);



  useEffect(() => {
    const mapByYear = periods.reduce<Record<AcademicYear, Period[]>>((acc, period) => {
        if (!acc[period.year]) {
          acc[period.year] = [];
        }
        acc[period.year].push(period);
        return acc;
      }, {} as Record<AcademicYear, Period[]>);

    setYearPeriods(mapByYear);
  }, [periods])

    useEffect(() => {
        const fetchOrgs = async () => {
            const { data, error } = await supabase
                .from('periods')
                .select('*');

            if (error) {
                setError(error as Error);
            } else if (data) {
                const camelCaseOrgs = data.map((org) => new Period(org));
                setPeriods(camelCaseOrgs)
            }

            setLoading(false);
        };

        fetchOrgs();
    }, []);

    return { periods, yearPeriods, loading, error };
};
