import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { HomeContent } from '@/components/storefront/home-content';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
