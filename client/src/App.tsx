import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './redux/store';
import { fetchNotes } from './redux/notesThunks';
import { fetchTasks } from './redux/tasksThunks';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Layout from '@/components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Assistant from './pages/Assistant';
import SignIn from './pages/SignIn';

import { useAutoLogin } from '@/hooks/useAutoLogin.ts';
import './App.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((store: RootState) => store.userStore);

  useAutoLogin();

  useEffect(() => {
    if (user) {
      dispatch(fetchNotes());
      dispatch(fetchTasks());
    }
  }, [dispatch, user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />

        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
