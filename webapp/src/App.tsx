import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireOwner } from './components/auth/RequireOwner';
import { AppShell } from './components/layout/AppShell';
import { OwnerShell } from './components/layout/OwnerShell';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { ListingPage } from './pages/ListingPage';
import { NearbyPage } from './pages/NearbyPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { OwnerPage } from './pages/OwnerPage';
import { SearchPage } from './pages/SearchPage';
import { UtilityPage } from './pages/UtilityPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<Navigate to="/category/restaurants" replace />} />
        <Route path="/wellness" element={<Navigate to="/category/wellness" replace />} />
        <Route path="/category/:slug" element={<ListingPage />} />
        <Route path="/place/:slug" element={<ListingDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/help" element={<UtilityPage type="help" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route element={<OwnerShell />}>
        <Route path="/owner-login" element={<OwnerLoginPage />} />
        <Route
          path="/owner"
          element={
            <RequireOwner>
              <OwnerPage />
            </RequireOwner>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
