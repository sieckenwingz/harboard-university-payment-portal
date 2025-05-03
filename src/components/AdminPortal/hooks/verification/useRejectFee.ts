import { useState } from 'react';
import { supabase } from '../../../../App';
import { PostgrestError } from '@supabase/supabase-js';
import { useAuth } from '../../../../context/AuthContext';
import { Status } from '../../../../models/Status';
import { getEnumKeyByValue } from '../../../../helpers/EnumHelpers';

export const useRejectFee = () => {
  const {user, _} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [data, setData] = useState(null);

  const rejectFee = async (paymentId: number) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('payments')
      .update({
        checked_by: user.id,
        status_last_changed_at: new Date(), // TODO: Consider using server time instead of client time
        status: getEnumKeyByValue(Status, Status.REJECTED),
      })
      .eq('id', paymentId);

    if (error) {
      setError(error);
      setData(null);
    } else {
      setData(data);
    }

    setLoading(false);
    return { data, error };
  };

  return { rejectFee, loading, error, data };
};
