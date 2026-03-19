import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, logPageView } from './utils/analytics';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import SubmitSuccess from './pages/SubmitSuccess';
import ViewProject from './pages/ViewProject';
import CountryProjects from './pages/CountryProjects';
import CategoryProjects from './pages/CategoryProjects';
import EditProject from './pages/EditProject';
import NotFound from './pages/NotFound';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingProjects from './pages/admin/PendingProjects';
import Claims from './pages/admin/Claims';
import AllProjects from './pages/admin/AllProjects';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';
import Countries from './pages/admin/Countries';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import Infographic from './pages/Infographic';
import InfographicArchive from './pages/InfographicArchive';
import LiveMap from './pages/LiveMap';
import SearchResults from './pages/SearchResults';

export default function App() {

  const location = useLocation();

  // Initialize GA on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route change
  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/infographic-q1-2026" element={<Infographic />} />
        <Route path="/infographic-archive" element={<InfographicArchive />} />
        <Route path="/live-map" element={<LiveMap />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/project/:id" element={<ViewProject />} />
        <Route path="/country/:countryCode" element={<CountryProjects />} />
        <Route path="/category/:categorySlug" element={<CategoryProjects />} />

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
          <Route path="projects" element={<AllProjects />} />
          <Route path="claims" element={<Claims />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="countries" element={<Countries />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  );
}