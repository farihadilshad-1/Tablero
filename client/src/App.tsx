import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/Toast';
import HomePage from '@/pages/HomePage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import BookingsPage from '@/pages/BookingsPage';
import AssistantPage from '@/pages/AssistantPage';
import OwnerDashboardPage from '@/pages/OwnerDashboardPage';
import AuthPage from '@/pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/owner" element={<OwnerDashboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
