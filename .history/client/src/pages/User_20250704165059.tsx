import { Outlet, Navigate } from 'react-router-dom'

const User = () => {
    {<Navigate to="/user/dashboard" />}

  return (
    <>
        <Outlet />
    </>
  )
}

export default User