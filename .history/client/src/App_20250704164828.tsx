import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import User from './pages/User'
import Dashboard from './pages/User/Dashboard'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/about' />
        <Route path='/login' />
        <Route path='/signup' />

        <Route path='/user'>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='*' element={<NotFound />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
