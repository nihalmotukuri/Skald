import { Routes, Route } from 'react-router-dom'

const User = () => {
  return (
    <Routes>
        <Route path='/dashboard' element={<Dashboard} />
    </Routes>
  )
}

export default User