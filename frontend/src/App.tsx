import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrderPage from './pages/OrderPage';
import ConfirmPage from './pages/ConfirmPage';
import AdminPage from './pages/AdminPage';
import ClientSpacePage from './pages/ClientSpacePage';
import CGVPage from './pages/CGVPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/commander" element={<OrderPage />} />
        <Route path="/confirmation" element={<ConfirmPage />} />
        <Route path="/mon-espace" element={<ClientSpacePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/cgv" element={<CGVPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
