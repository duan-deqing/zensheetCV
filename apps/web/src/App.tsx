import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { HomePage } from '@/pages/HomePage';

const EditorPage = lazy(() => import('@/pages/EditorPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <UIProvider>
            <EditorProvider>
              <ResumeProvider>
                <PreviewProvider>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                      <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
                </PreviewProvider>
              </ResumeProvider>
            </EditorProvider>
          </UIProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
