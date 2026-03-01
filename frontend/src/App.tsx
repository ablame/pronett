import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrderPage from './pages/OrderPage';
import ConfirmPage from './pages/ConfirmPage';
import AdminPage from './pages/AdminPage';
import ClientSpacePage from './pages/ClientSpacePage';
import CGVPage from './pages/CGVPage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
