import { BrowserRouter, Routes, Route } from 'react-router-dom'
import H
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/ >} />
        <Route path='/about' />
        <Route path='/dashboard' />
        <Route path='/login' />
        <Route path='/signup' />
        <Route path='/*' />
      </Routes>
    </BrowserRouter>
  )
}

export default App
