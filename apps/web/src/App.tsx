import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <EditorProvider>
          <ResumeProvider>
            <PreviewProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
              </Routes>
            </PreviewProvider>
          </ResumeProvider>
        </EditorProvider>
      </UIProvider>
    </BrowserRouter>
  );
}

export default App;
