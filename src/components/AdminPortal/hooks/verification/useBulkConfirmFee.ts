import { useState } from 'react';
import { supabase } from '../../../../App';
import { PostgrestError } from '@supabase/supabase-js';
import { useAuth } from '../../../../context/AuthContext';
import { Status } from '../../../../models/Status';
import { getEnumKeyByValue } from '../../../../helpers/EnumHelpers';

export const useBulkConfirmFee = () => {
  const {user, _} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [data, setData] = useState(null);

  const bulkConfirmFee = async (paymentIds: number[]) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.functions.invoke('bulk-resolve-payments', {
      body: {
        payment_ids: paymentIds,
        status: getEnumKeyByValue(Status, Status.PAID),
      }
    });

    if (error) {
      setError(error);
      setData(null);
    } else {
      setData(data);
    }

    setLoading(false);
    return { data, error };
  };

  return { bulkConfirmFee, loading, error, data };
};
