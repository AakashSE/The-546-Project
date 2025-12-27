import { createClient } from '@supabase/supabase-js';
import ProductPageClient from '../../../components/ProductPageClient';

// Server-side Fetch Helper
// Server-side Fetch Helper
async function getProduct(id) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase keys missing during build.");
    return null;
  }

  // Defensive Check: Prevent querying for "null" string which causes Postgres 22P02 error
  if (!id || id === "null" || id === "undefined") {
    return null;
  }

  const supabase = createClient(url, key);
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Fetch Error:", e);
    return null;
  }
}

// SEO METADATA
export async function generateMetadata({ params }) {
  // Await params if using Next.js 15, but standard access often works. 
  // Does no harm to await.
  // const resolvedParams = await params; 
  // Actually, let's try standard access first, or check previous code.
  // Previous code used React.use(params), implying params is a Promise.

  // Safe approach for Next.js 15+
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) return { title: 'Asset Not Found' };

  return {
    title: `${product.name}`,
    description: product.description || 'Classified specialized equipment.',
    openGraph: {
      title: `${product.name}`,
      description: product.description,
      images: [
        {
          url: product.defaultImage || product.options?.[0]?.images?.front,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      siteName: 'Mars Luxury Supply',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.defaultImage || product.options?.[0]?.images?.front],
    },
  };
}

export default async function ProductPage({ params }) {
  // Next.js 15+ / 16 compliant
  const { id } = await params;
  const product = await getProduct(id);

  return <ProductPageClient product={product} />;
}