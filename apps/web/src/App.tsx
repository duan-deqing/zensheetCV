import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <EditorProvider>
            <ResumeProvider>
              <PreviewProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                  <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                </Routes>
              </PreviewProvider>
            </ResumeProvider>
          </EditorProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
