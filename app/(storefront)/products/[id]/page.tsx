'use client';
import ProductDetail  from '../../../../src/pages/storefront/ProductDetail'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetail id={params.id} />
}
