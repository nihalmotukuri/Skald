import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Layout from '@/'
import Dashboard from './pages/User/Dashboard'
import Tasks from './pages/User/Tasks'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/about' />
        <Route path='/login' />
        <Route path='/signup' />

        <Route path='/user' element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />+
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='tasks' element={<Tasks />} />
          <Route path='*' element={<NotFound />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
