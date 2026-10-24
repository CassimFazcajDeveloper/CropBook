import { createContext, useContext } from 'react';

// The crop layout reads [id] from the URL and hands it to its tabs here: screens
// inside the top-tabs navigator don't receive the parent route's params.
export const CropIdContext = createContext<string | null>(null);

export function useCropId(): string {
  const id = useContext(CropIdContext);
  if (id === null) throw new Error('useCropId must be used inside the crop layout');
  return id;
}
