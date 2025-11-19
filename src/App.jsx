import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useData } from './context/DataContext';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { Tracker } from './pages/Tracker';
import { Settings } from './pages/Settings';
import { Equipment } from './pages/Equipment';
import { Projects } from './pages/Projects'; // Added import
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/projects" element={<Projects />} /> {/* Added route */}
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const { data } = useData();

  if (!data.onboardingCompleted) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <AnimatedRoutes />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
