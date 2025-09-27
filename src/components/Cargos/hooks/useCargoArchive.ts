// src/hooks/useCargoArchive.ts
import { useState, useEffect, useCallback }   from 'react';
import { CargoInfo, useCargoStore }           from '../../../Store/cargoStore';
import { useSocket }                          from '../../../Store/useSocket';
import { useToast }                           from '../../Toast';
import { useToken }                           from '../../../Store/loginStore';

interface UseCargoArchiveReturn {
  cargos:             CargoInfo[];
  refresh:            () => Promise<void>;
}

export const useCargoArchive = (): UseCargoArchiveReturn => {
  const { archives }   = useCargoStore();
  const { emit }                        = useSocket()
  const token                                 = useToken()
  const toast                                 = useToast()

  const refresh                               = useCallback(async () => {
    try {

      emit("get_cargo_archives", { token: token })
      
    } catch (err) {
      console.log('Error refreshing cargo archive:', err);
      toast.error('Не удалось загрузить архив заказов');
    } finally {
      console.log("finally")
    }
  }, []);

  useEffect(() => {
    if (archives.length === 0) {
      refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
      cargos:     archives, // Все архивные cargo
      refresh
  };
};

export default useCargoArchive;