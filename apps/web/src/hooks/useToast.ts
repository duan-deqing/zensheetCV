import { useToastValue } from '@/store/ToastContext';

export function useToast() {
  const { addToast } = useToastValue();
  return addToast;
}
