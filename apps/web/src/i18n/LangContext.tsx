import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/** 支持的语言 */
export type Lang = 'zh' | 'en';
/** 双语文案：字段名为语言代码，tr() 按当前语言取值 */
export type Bi = { zh: string; en: string };

const LANG_KEY = 'stylan.lang';

/** 非 React 模块（api 客户端、hooks 等）读取当前语言：优先 localStorage，缺省中文 */
export function getLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    /* 忽略 */
  }
  return 'zh';
}

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: 'zh', setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* 忽略持久化失败 */
    }
  }, []);

  // 同步 <html lang>，辅助无障碍与字体渲染
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** 双语文案取值 hook：tr({ zh: '保存', en: 'Save' }) 返回当前语言的文案 */
export function useTr() {
  const { lang } = useLang();
  return useCallback((v: Bi) => v[lang], [lang]);
}
