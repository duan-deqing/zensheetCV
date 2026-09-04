import { useEffect, useState } from 'react';

/** 订阅 CSS 媒体查询匹配状态（纯客户端，初次同步求值）。
 *  用于 JS 分支渲染：如编辑器页桌面分栏 / 手机单列 tab 切换 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
