import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' />
        <Route path='/dashboard' />
        <Route path='/login' />
        <Route path='/' />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
