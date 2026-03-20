import { Route, Routes } from 'react-router-dom';
import { RequireOwner } from './components/auth/RequireOwner';
import { AppShell } from './components/layout/AppShell';
import { OwnerShell } from './components/layout/OwnerShell';
import { CategoryPlaceholderPage } from './pages/CategoryPlaceholderPage';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { OwnerPage } from './pages/OwnerPage';
import { UtilityPage } from './pages/UtilityPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<ListingPage category="restaurants" />} />
        <Route path="/wellness" element={<ListingPage category="wellness" />} />
        <Route path="/section/:slug" element={<CategoryPlaceholderPage />} />
        <Route path="/search" element={<UtilityPage type="search" />} />
        <Route path="/favorites" element={<UtilityPage type="favorites" />} />
        <Route path="/nearby" element={<UtilityPage type="nearby" />} />
        <Route path="/help" element={<UtilityPage type="help" />} />
        <Route path="/contacts" element={<UtilityPage type="contacts" />} />
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
