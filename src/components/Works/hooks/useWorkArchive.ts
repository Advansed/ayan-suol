import { useState, useMemo } from 'react';
import { useWorks } from './useWorks';
import { WorkStatus } from '../types';
import { useSelector } from '../../Store';

const useWorkArchive = () => {
  const { isLoading, refreshWorks } = useWorks();
  const works = useSelector((state) => state.works, 13); // TODO: добавить works в Store
  const [refreshing, setRefreshing] = useState(false);

  // Фильтруем выполненные работы
  const archiveWorks = useMemo(() => {
    const filteredWorks = works.filter(work => work.status === WorkStatus.COMPLETED);
    console.log(filteredWorks);
    return filteredWorks;
  }, [works]);

  const refresh = async () => {
    setRefreshing(true);
    await refreshWorks();
    setRefreshing(false);
  };

  return {
    works: archiveWorks,
    loading: isLoading,
    refreshing,
    refresh
  };
};

export default useWorkArchive;