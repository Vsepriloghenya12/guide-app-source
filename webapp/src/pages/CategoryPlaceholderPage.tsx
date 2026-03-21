import { useParams } from 'react-router-dom';
import { CategoryExplorer } from '../components/listing/CategoryExplorer';

export function CategoryPlaceholderPage() {
  const { slug = '' } = useParams();
  return <CategoryExplorer categorySlug={slug} />;
}
