import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loading des pages pour code-splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WorkflowPage = lazy(() => import('./pages/WorkflowPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CanvasPage = lazy(() => import('./pages/CanvasPage'));
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage'));
const AnalyzerResultsPage = lazy(() => import('./pages/AnalyzerResultsPage'));
const SharedCanvasPage = lazy(() => import('./pages/SharedCanvasPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page"
      className="container-app py-8 space-y-4 animate-fade-in"
    >
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="grid-auto-fit">
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
      <div className="skeleton h-64 rounded-xl" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

export default function App() {
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes (optionnelles) */}
        {!authEnabled && (
          <>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </>
        )}
        
        {/* Route publique de partage */}
        <Route path="/share/:shareId" element={<SharedCanvasPage />} />

        {/* Routes protégées */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<ProfilePage />} />
          <Route path="profile" element={<Navigate to="/settings" replace />} />

          {/* Workflow sans dataset → étape upload */}
          <Route path="workflow" element={<WorkflowPage />} />

          {/* Analyseur Intelligent */}
          <Route path="analyzer" element={<AnalyzerPage />} />
          <Route path="analyzer/results" element={<AnalyzerResultsPage />} />

          {/* Canvas Intercatif */}
          <Route path="canvas" element={<CanvasPage />} />

          {/* Marketplace */}
          <Route path="marketplace" element={<MarketplacePage />} />

          {/* Documentation */}
          <Route path="docs" element={<DocsPage />} />

          {/* Workflow avec dataset → redirige vers l'étape profilage */}
          <Route path="workflow/:datasetId" element={<Navigate to="profile" replace />} />

          {/* Étapes du workflow */}
          <Route path="workflow/:datasetId/:step" element={<WorkflowPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
