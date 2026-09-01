import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Navbar } from '@/components/Navbar';
import { UserModal } from '@/components/UserModal';
import { HomePage } from '@/pages/HomePage';

const EditorPage = lazy(() => import('@/pages/EditorPage').then((m) => ({ default: m.EditorPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ResumesPage = lazy(() => import('@/pages/ResumesPage').then((m) => ({ default: m.ResumesPage })));
const DocsPage = lazy(() => import('@/pages/DocsPage').then((m) => ({ default: m.DocsPage })));
const GuidePage = lazy(() => import('@/pages/docs/DocsSubPages').then((m) => ({ default: m.GuidePage })));
const MarkdownDocPage = lazy(() => import('@/pages/docs/DocsSubPages').then((m) => ({ default: m.MarkdownDocPage })));
const ThemeDocPage = lazy(() => import('@/pages/docs/DocsSubPages').then((m) => ({ default: m.ThemeDocPage })));
const IconsDocPage = lazy(() => import('@/pages/docs/DocsSubPages').then((m) => ({ default: m.IconsDocPage })));
const AIDocPage = lazy(() => import('@/pages/docs/DocsSubPages').then((m) => ({ default: m.AIDocPage })));
const ChangelogPage = lazy(() => import('@/pages/docs/DocsSubPages').then((m) => ({ default: m.ChangelogPage })));

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <UIProvider>
            <EditorProvider>
              <ResumeProvider>
                <PreviewProvider>
                  <Navbar />
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/resumes" element={<ProtectedRoute><ResumesPage /></ProtectedRoute>} />
                      <Route path="/docs" element={<DocsPage />} />
                      <Route path="/docs/guide" element={<GuidePage />} />
                      <Route path="/docs/markdown" element={<MarkdownDocPage />} />
                      <Route path="/docs/theme" element={<ThemeDocPage />} />
                      <Route path="/docs/icons" element={<IconsDocPage />} />
                      <Route path="/docs/ai" element={<AIDocPage />} />
                      <Route path="/docs/changelog" element={<ChangelogPage />} />
                      <Route path="/editor" element={<Navigate to="/resumes" replace />} />
                      <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
                  {/* 全局用户信息/设置弹窗：编辑页 TopBar 与首页导航栏共用 */}
                  <UserModal />
                </PreviewProvider>
              </ResumeProvider>
            </EditorProvider>
          </UIProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
