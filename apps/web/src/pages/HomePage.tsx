export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Stylan Resume</h1>
        <p className="text-xl text-gray-600 mb-8">
          通过 Markdown 编辑简历，选择定制模板，导出高质量 PDF
        </p>
        <a href="/editor" className="btn-primary text-lg px-8 py-3">
          开始编辑
        </a>
      </div>
    </div>
  );
}
