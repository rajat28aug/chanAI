import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PdfTools from './pages/PdfTools.jsx';
import Flashcards from './pages/Flashcards.jsx';
import FlashcardView from './pages/FlashcardView.jsx';
import Quizzes from './pages/Quizzes.jsx';
import StudyPlan from './pages/StudyPlan.jsx';
import DoubtSolver from './pages/DoubtSolver.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pdf-tools" element={<PdfTools />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/flashcards/:documentId" element={<FlashcardView />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/study-plan" element={<StudyPlan />} />
              <Route path="/doubt-solver" element={<DoubtSolver />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
