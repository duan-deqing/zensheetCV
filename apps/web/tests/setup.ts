import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// jsdom 未实现 matchMedia：为 useMediaQuery / 响应式分支渲染提供桌面态 mock
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: !query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
