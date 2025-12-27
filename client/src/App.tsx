import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ProjectPage from './pages/ProjectPage';
import ListProjectPage from './pages/ListProjectPage';
import ProjectSubmittedSuccess from './pages/ProjectSubmittedSuccess';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/list-project" element={<ListProjectPage />} />
        <Route path="/project-submitted" element={<ProjectSubmittedSuccess />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/live-map" element={<HomePage />} />
        <Route path="/infographic-q1-2026" element={<HomePage />} />
      </Routes>
    </div>
  );
}


