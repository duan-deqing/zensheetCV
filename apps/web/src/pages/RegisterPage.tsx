import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import type { UserCreate } from '@stylan/shared-types';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }
    setLoading(true);
    const success = await register({ name, email, password } as UserCreate);
    if (success) {
      navigate('/login');
    } else {
      setError('注册失败，该邮箱可能已被使用');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">创建账户</h1>
          <p className="text-gray-600 mt-2">开始您的简历编辑之旅</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="您的姓名"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="至少 6 个字符"
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            已有账户？{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
