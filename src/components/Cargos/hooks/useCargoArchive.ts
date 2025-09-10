import { useState, useMemo }  from 'react';
import { CargoInfo, CargoStatus }        from '../../../Store/cargoStore';

const useCargoArchive = () => {
  const cargos: CargoInfo[] = [] //useSelector((state) => state.cargos, 12);
  const [refreshing, setRefreshing] = useState(false);

  // Фильтруем завершенные заказы
  const archiveCargos = useMemo(() => {
    const jarr = cargos.filter(cargo => cargo.status === CargoStatus.COMPLETED);
    console.log( jarr )
    return jarr
  }, [cargos]);

  const refresh = async () => {
    setRefreshing(true);
    // await refreshCargos();
    setRefreshing(false);
  };

  return {
    cargos:     archiveCargos,
    refreshing,
    refresh
  };
};

export default useCargoArchive;