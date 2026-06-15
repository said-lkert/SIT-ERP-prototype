import { useState, useEffect } from 'react';

export function useApi<T>(endpoint: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to fetch from ${endpoint}`);
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const mutate = (newData: T) => setData(newData);

  return { data, loading, error, refetch: fetchData, mutate };
}
