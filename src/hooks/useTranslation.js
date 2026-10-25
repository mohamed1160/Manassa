import { useLocaleStore } from '../stores/locale.store';

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const direction = useLocaleStore((state) => state.direction);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const toggleLocale = useLocaleStore((state) => state.toggleLocale);
  const t = useLocaleStore((state) => state.t);

  return {
    locale,
    direction,
    isRTL: direction === 'rtl',
    setLocale,
    toggleLocale,
    t,
  };
}

export default useTranslation;
