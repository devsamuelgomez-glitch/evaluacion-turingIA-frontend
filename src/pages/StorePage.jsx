import { useCallback, useState } from 'react';
import Hero from '../components/Hero/Hero.jsx';
import ProductGrid from '../components/ProductGrid/ProductGrid.jsx';
import Gallery from '../components/Gallery/Gallery.jsx';
import Testimonials from '../components/Testimonials/Testimonials.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { useCategories } from '../hooks/useCategories.js';

export default function StorePage() {
  const { categories, status: categoriesStatus } = useCategories();
  const [category, setCategory] = useState('');

  // Picking a category in the gallery filters the grid and scrolls back up to it
  const showCategory = useCallback((slug) => {
    setCategory(slug);
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <main>
        <Hero />
        <ProductGrid categories={categories} category={category} onCategoryChange={setCategory} />
        <Gallery categories={categories} status={categoriesStatus} onSelect={showCategory} />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
