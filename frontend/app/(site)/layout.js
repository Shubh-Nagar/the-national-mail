import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { apiGetSafe } from '@/lib/api';

export default async function SiteLayout({ children }) {
  const { data: categories } = await apiGetSafe('/categories', { data: [] }, { revalidate: 300 });
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <Header categories={categories} />
      <main id="main">{children}</main>
      <Footer categories={categories} />
    </>
  );
}
