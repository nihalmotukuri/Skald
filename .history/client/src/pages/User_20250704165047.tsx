import { Outlet, Navigate } from 'react-router-dom'

const User = () => {
    {<Navigate to="/dashboard" />}

  return (
    <>
        <Outlet />
    </>
  )
}

export default User