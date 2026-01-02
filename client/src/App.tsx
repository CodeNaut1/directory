import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import SubmitSuccess from './pages/SubmitSuccess';
import ViewProject from './pages/ViewProject';
import EditProject from './pages/EditProject';
import NotFound from './pages/NotFound';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingProjects from './pages/admin/PendingProjects';
import LiveMap from './pages/LiveMap';


export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/live-map" element={<LiveMap />} />
        <Route path="/infographic-q1-2026" element={<HomePage />} />
        <Route path="/project/:id" element={<ViewProject />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/project-submitted" element={<ProtectedRoute><SubmitSuccess /></ProtectedRoute>} />
        <Route path="/edit-project/:id" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects/pending" element={<PendingProjects />} />
        </Route>
      </Routes>
    </div>
  );
}