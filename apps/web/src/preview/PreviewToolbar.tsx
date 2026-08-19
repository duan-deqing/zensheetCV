import { usePreview } from '@/store/PreviewContext';
import { builtinTemplates } from '@/templates';

export function PreviewToolbar() {
  const { currentTemplate, scale, setScale, isFullscreen, toggleFullscreen } = usePreview();

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">模板:</span>
        <select
          value={currentTemplate?.id || 'classic'}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          {builtinTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setScale(Math.max(50, scale - 10))}
          className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          -
        </button>
        <span className="text-xs text-gray-500 w-10 text-center">{scale}%</span>
        <button
          onClick={() => setScale(Math.min(150, scale + 10))}
          className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          +
        </button>
        <button
          onClick={toggleFullscreen}
          className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          {isFullscreen ? '⊡' : '⊞'}
        </button>
      </div>
    </div>
  );
}
