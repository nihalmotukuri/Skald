import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import User from './pages/User'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/ >} />
        <Route path='/about' />
        <Route path='/user' element={<User />}></Route>
        <Route path='/login' />
        <Route path='/signup' />
        <Route path='/*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
