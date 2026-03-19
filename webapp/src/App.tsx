import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CategoryPlaceholderPage } from './pages/CategoryPlaceholderPage';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { OwnerPage } from './pages/OwnerPage';
import { UtilityPage } from './pages/UtilityPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<ListingPage category="restaurants" />} />
        <Route path="/wellness" element={<ListingPage category="wellness" />} />
        <Route path="/section/:slug" element={<CategoryPlaceholderPage />} />
        <Route path="/owner" element={<OwnerPage />} />
        <Route path="/search" element={<UtilityPage type="search" />} />
        <Route path="/favorites" element={<UtilityPage type="favorites" />} />
        <Route path="/nearby" element={<UtilityPage type="nearby" />} />
        <Route path="/help" element={<UtilityPage type="help" />} />
        <Route path="/contacts" element={<UtilityPage type="contacts" />} />
      </Routes>
    </AppShell>
  );
}

export default App;
