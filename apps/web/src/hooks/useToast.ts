import { useUI } from '@/store/UIContext';

export function useToast() {
  const { addToast } = useUI();
  return addToast;
}
