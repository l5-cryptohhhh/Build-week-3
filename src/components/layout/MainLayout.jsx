import { Outlet } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import AppNavbar from './AppNavbar'

export default function MainLayout() {
  return (
    <>
      <AppNavbar />
      <Container className="pt-5 mt-4 pb-5" style={{ maxWidth: 1128 }}>
        <Outlet />
      </Container>
    </>
  )
}
