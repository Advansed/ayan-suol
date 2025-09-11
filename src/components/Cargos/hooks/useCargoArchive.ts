// src/hooks/useCargoArchive.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CargoInfo, CargoStatus, useCargoStore } from '../../../Store/cargoStore';

interface UseCargoArchiveReturn {
  cargos: CargoInfo[];
  refreshing: boolean;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useCargoArchive = (): UseCargoArchiveReturn => {
  const { archives, isLoading, setLoading } = useCargoStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Фильтруем только завершенные заказы

  const refresh = useCallback(async () => {
    try {

      setRefreshing(true);
      setError(null);
      setLoading(true);

      // Эмуляция запроса к серверу через socket
      // В реальном приложении здесь будет вызов socket.emit('get_cargo_archives')
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Данные уже будут обновлены через socket handlers в store
      
    } catch (err) {
      console.error('Error refreshing cargo archive:', err);
      setError('Не удалось загрузить архив заказов');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [setLoading]);

  // Первоначальная загрузка при монтировании
  useEffect(() => {
    if (archives.length === 0) {
      refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cargos:     archives,
    refreshing: refreshing || isLoading,
    refresh,
    isLoading,
    error
  };
};

export default useCargoArchive;