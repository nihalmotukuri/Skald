import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AppLoading from '@/components/AppLoading';
import AuthCallback from './pages/AuthCallback';
import SignIn from './pages/SignIn';

import { useAutoLogin } from '@/hooks/useAutoLogin.ts';
import { useAppStore } from '@/store/appStore';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Notes = lazy(() => import('./pages/Notes'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Settings = lazy(() => import('./pages/Settings'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));

function App() {
  useAutoLogin();
  const isDark = useAppStore((state) => state.isDark);

  return (
    <div className={`skald-root${isDark ? ' skald-root--dark' : ''}`}>
      <BrowserRouter>
        <Suspense fallback={<AppLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn key="signin" />} />
            <Route path="/signup" element={<SignIn key="signup" />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/update-password" element={<UpdatePassword />} />

            <Route path="/app" element={<Layout />}>
              <Route index element={<Navigate to="today" replace />} />
              <Route path="today" element={<Dashboard />} />
              <Route path="dashboard" element={<Navigate to="/app/today" replace />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="notes" element={<Notes />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
