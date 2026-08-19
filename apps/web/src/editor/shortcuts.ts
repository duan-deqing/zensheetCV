export interface ShortcutMap {
  [key: string]: () => void;
}

export const editorShortcuts: ShortcutMap = {
  'Ctrl-b': () => {},
  'Ctrl-i': () => {},
  'Ctrl-s': () => {},
  'Ctrl-k': () => {},
};
