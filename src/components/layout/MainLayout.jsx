import { Outlet, useLocation } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import AppNavbar from './AppNavbar'
import MessengerWidget from '../messages/MessengerWidget'

export default function MainLayout() {
  const location = useLocation()
  const isMessagesPage = location.pathname.startsWith('/messages')

  return (
    <>
      <AppNavbar />
      <Container className="pt-5 mt-4 pb-5" style={{ maxWidth: 1128 }}>
        <Outlet />
      </Container>
      {!isMessagesPage && <MessengerWidget />}
    </>
  )
}
