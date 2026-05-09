import { useCallback, useState } from 'react';
import { hasSaveData } from '../../utils/save';

export function useSaveStatus() {
  const [saveExists, setSaveExists] = useState(() => hasSaveData());
  const [saveFlash, setSaveFlash] = useState(false);

  const triggerFlash = useCallback(() => {
    setSaveExists(true);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  }, []);

  return { saveExists, saveFlash, triggerFlash };
}
