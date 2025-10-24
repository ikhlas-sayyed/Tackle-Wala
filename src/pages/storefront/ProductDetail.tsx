'use client'

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, Heart } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import toast from 'react-hot-toast';

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
}

interface ProductImage {
  url: string;
  displayOrder: number;
}

interface ProductDetailType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export default function ProductDetail({ id }: { id: string }) {
  const [productDetail, setProductDetail] = useState<ProductDetailType | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { items, removeItem } = useCartStore();

  useEffect(() => {
    // alert(id);
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await apiClient.getProduct(id!);
      console.log(response);
      const product = response.data?.product;
      console.log(product);
      if (!product) {
        toast.error('Failed to load product');
        return;
      }

      // Sort images by displayOrder
      const sortedImages = [...product.images].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );

      // Convert price strings to numbers
      const formattedProduct: ProductDetailType = {
        ...product,
        price: Number(product.price),
        variants: product.variants.map(v => ({
          ...v,
          price: Number(v.price),
        })),
        images: sortedImages,
      };

      setProductDetail(formattedProduct);

      // Pre-select first variant if exists
      if (formattedProduct.variants.length > 0) {
        setSelectedVariant(formattedProduct.variants[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load product');
    }
  };

  const handleBuyNow = () => {
    if (!productDetail) return;

    const variant = selectedVariant
      ? productDetail.variants.find((v) => v.id === selectedVariant)
      : null;
    const price = variant?.price || productDetail.price;
    const stock = variant?.stock ?? productDetail.stock;
    if (quantity > stock) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    items.map(item => {
      removeItem(item.productId, item.variantId);
    });

    addItem({
      productId: productDetail.id,
      variantId: variant?.id,
      name: productDetail.name,
      price,
      quantity,
      image: productDetail.images[0]?.url,
      size: variant?.size || undefined,
      color: variant?.color || undefined,
    });

    router.push('/cart');

  };

  const handleAddToCart = () => {
    if (!productDetail) return;

    const variant = selectedVariant
      ? productDetail.variants.find((v) => v.id === selectedVariant)
      : null;

    const price = variant?.price || productDetail.price;
    const stock = variant?.stock ?? productDetail.stock;

    if (quantity > stock) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    addItem({
      productId: productDetail.id,
      variantId: variant?.id,
      name: productDetail.name,
      price,
      quantity,
      image: productDetail.images[0]?.url,
      size: variant?.size || undefined,
      color: variant?.color || undefined,
    });

    toast.success('Added to cart!');
  };

  if (!productDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const variant = selectedVariant
    ? productDetail.variants.find((v) => v.id === selectedVariant)
    : null;

  const currentPrice = variant?.price || productDetail.price;
  const currentStock = variant?.stock ?? productDetail.stock;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {productDetail.images[selectedImage] && (
                  <img
                    src={productDetail.images[selectedImage].url}
                    alt={productDetail.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              {productDetail.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productDetail.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${selectedImage === idx ? 'ring-2 ring-blue-600' : ''
                        }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {productDetail.category && (
                <p className="text-sm text-gray-500 mb-2">{productDetail.category}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{productDetail.name}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-6">₹{currentPrice.toFixed(2)}</p>

              {productDetail.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{productDetail.description}</p>
                </div>
              )}

              {/* Variants */}
              {productDetail.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Options</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {productDetail.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`px-4 py-2 border rounded-lg text-sm ${selectedVariant === v.id
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {v.size && <span>{v.size}</span>}
                        {v.color && <span className={v.size ? "ml-1" : ""}>({v.color})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Stock:</span> {currentStock} available
                </p>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart / Wishlist */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className={`flex-1 px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition ${currentStock === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Buy Now */}
              <Link  onClick={handleBuyNow} href="/cart">
                <button
                  disabled={currentStock === 0}
                  className={`w-full px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition ${currentStock === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {currentStock === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
