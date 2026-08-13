import React, { useState } from 'react';
import { DriverInfo } from './DriverInfo';
import { useProfile } from '../useProfile';
import { useToast } from '../../Toast';
import { uploadTransportPhoto } from '../../../utils/fileUpload';

export const TransportEditPage: React.FC = () => {
  const { transportData, updateTransport } = useProfile();
  const toast = useToast();
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleTransportImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
      toast.error('Формат файла должен быть PNG, JPG или WebP');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 12 МБ');
      return;
    }

    setPhotoLoading(true);
    try {
      const { filePath } = await uploadTransportPhoto(file);
      if (!filePath) {
        throw new Error('Сервер не вернул filePath');
      }
      await updateTransport({ image: filePath });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить фото');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="web-vehicles-layout">
      <DriverInfo
        transportData={transportData}
        photoLoading={photoLoading}
        onSave={async (data) => {
          await updateTransport(data);
        }}
        onImageUpload={handleTransportImageUpload}
      />
    </div>
  );
};
