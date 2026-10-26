import { useMemo } from 'react';

export const useAdaptiveTexture = (desktopPath, mobilePath) => {
  const isMobile = useMemo(() => {
    // Проверяем userAgent на наличие мобильных устройств
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  return isMobile ? mobilePath : desktopPath;
};