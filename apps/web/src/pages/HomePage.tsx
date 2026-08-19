import { Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

const features = [
  { icon: '✍️', title: 'Markdown 实时编辑', desc: '左右分栏，所见即所得' },
  { icon: '🎨', title: '多模板切换', desc: '4 套精美简历模板' },
  { icon: '🎯', title: '主题配置', desc: '颜色、字体、字号自定义' },
  { icon: '📄', title: 'PDF 导出', desc: '服务端高质量渲染' },
  { icon: '🔒', title: '用户系统', desc: 'JWT 认证，数据安全' },
  { icon: '🤖', title: 'AI 辅助', desc: '润色、关键词优化、生成' },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
          Stylan Resume
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          通过 Markdown 编辑简历，选择定制模板，导出高质量 PDF。
          <br />AI 辅助写作，让简历更专业。
        </p>
        <div className="flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/editor" className="btn-primary text-lg px-8 py-3">
              进入编辑器
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                免费注册
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                登录
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-sm text-gray-500">Stylan Resume · 在线简历编辑器</p>
      </footer>
    </div>
  );
}
