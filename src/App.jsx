import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import { Nav } from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from "./components/theme-provider"
import FAQ from './pages/Faq';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CreateRoom from './pages/CreateRoom';
import Room from './pages/Room';
import WaitingRoom from './pages/WaitingRoom';
import JoinRoom from './pages/JoinRoom';
import { Toaster } from "@/components/ui/sonner"
import TermsOfService from './pages/Tos';
import AboutPage from './pages/About';
import ReportBug from './pages/Report-bug';
import Contact from './pages/Contact';
import useWebRTCStore from './store/connectionStore';
import { useEffect, useState } from 'react';


function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname.includes('/room');
  const hideFooter = location.pathname.includes('/room') || location.pathname === '/loading' || location.pathname === '/create-room' || location.pathname.includes('/waiting-room/');
  const setIsMobile = useWebRTCStore((state) => state.setIsMobile);
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  useEffect(() => {
    setIsMobile(width <= 768);
  }, [width]);

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" >
        {!hideNavbar && <Nav />}
        <main className="flex-1">
          <Toaster richColors visibleToasts={1} position="bottom-left" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/faq' element={<FAQ />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/report-bug' element={<ReportBug />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/terms-of-service' element={<TermsOfService />} />
            <Route path='/create-room' element={<CreateRoom />} />
            <Route path='/join-room/:roomId' element={<JoinRoom />} />
            <Route path='/waiting-room/:roomId' element={<WaitingRoom />} />
            <Route path='/room/:roomId' element={<Room />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </main>
        {!hideNavbar && !hideFooter && <Footer />}
      </ThemeProvider>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
