'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getCategories } from '@/lib/api';
import { Category, SellerListingCreate, SellerListingUpdate } from '@/types';

interface ListingFormProps {
  initialData?: {
    title: string;
    brand?: string;
    categoryId?: string;
    priceCents: number;
    listPriceCents?: number;
    description?: string;
    bullets: string[];
    images: string[];
    attributes?: Record<string, string>;
    stock: number;
    status?: 'draft' | 'published';
  };
  onSubmit: (data: SellerListingCreate | SellerListingUpdate, publish: boolean) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function ListingForm({ initialData, onSubmit, isLoading, isEdit }: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [price, setPrice] = useState(
    initialData?.priceCents ? (initialData.priceCents / 100).toFixed(2) : ''
  );
  const [listPrice, setListPrice] = useState(
    initialData?.listPriceCents ? (initialData.listPriceCents / 100).toFixed(2) : ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [bullets, setBullets] = useState<string[]>(
    initialData?.bullets?.length ? initialData.bullets : ['', '', '']
  );
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [stock, setStock] = useState(initialData?.stock?.toString() || '0');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!categoryId) {
      setFormError('Category is required');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      setFormError('Valid price is required');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data: SellerListingCreate = {
      title,
      brand: brand || undefined,
      categoryId,
      priceCents: Math.round(parseFloat(price) * 100),
      listPriceCents: listPrice ? Math.round(parseFloat(listPrice) * 100) : undefined,
      description: description || undefined,
      bullets: bullets.filter(Boolean),
      images,
      stock: parseInt(stock, 10) || 0,
      status: publish ? 'published' : 'draft',
    };

    await onSubmit(data, publish);
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const addBullet = () => {
    setBullets([...bullets, '']);
  };

  const removeBullet = (index: number) => {
    if (bullets.length > 1) {
      setBullets(bullets.filter((_, i) => i !== index));
    }
  };

  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form className="space-y-6">
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {formError}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Product Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product title"
            required
          />
          <Input
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Enter brand name"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F7CA00]"
              required
              disabled={categoriesLoading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Sale Price ($) *"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
            <Input
              label="List Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              placeholder="Original price (optional)"
            />
            <Input
              label="Stock Quantity *"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          {listPrice && parseFloat(listPrice) > parseFloat(price) && (
            <p className="text-sm text-green-600">
              Discount: {Math.round((1 - parseFloat(price) / parseFloat(listPrice)) * 100)}% off
            </p>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              disabled={!newImageUrl.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Add image URLs for your product. The first image will be the main image.
          </p>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <Badge className="absolute bottom-1 left-1" variant="info">
                      Main
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {images.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No images added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7CA00]"
              placeholder="Describe your product in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Features (Bullet Points)
            </label>
            <div className="space-y-2">
              {bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => updateBullet(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1"
                  />
                  {bullets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBullet(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addBullet}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          isLoading={isLoading}
        >
          {isEdit ? 'Update & Publish' : 'Create & Publish'}
        </Button>
      </div>
    </form>
  );
}
