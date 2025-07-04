import { Outlet, Navigate } from 'react-router-dom'

const User = () => {
  return (
    <>
        <Navigate to="/dashboard" />
        <Outlet />
    </>
  )
}

export default User