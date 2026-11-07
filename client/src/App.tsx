import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Layout from '@/components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Assistant from './pages/Assistant';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import AuthCallback from './pages/AuthCallback';
import UpdatePassword from './pages/UpdatePassword';

import { useAutoLogin } from '@/hooks/useAutoLogin.ts';
import './App.css';

function App() {
  useAutoLogin();

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
