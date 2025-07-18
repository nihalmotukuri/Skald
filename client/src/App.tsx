import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Layout from '@/components/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Assistant from './pages/Assistant'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/about' element={<About />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        <Route path='/app' element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />+
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='tasks' element={<Tasks />} />
          <Route path='notes' element={<Notes />} />
          <Route path='assistant' element={<Assistant />} />
          {/* <Route path='*' element={<NotFound />} /> */}
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
