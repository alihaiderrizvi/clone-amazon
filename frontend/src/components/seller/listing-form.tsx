'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ListingFormProps {
  initialData?: {
    title: string;
    brand: string;
    priceCents: number;
    listPriceCents?: number;
    description: string;
    bullets: string[];
    stock: number;
  };
  onSubmit: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

export function ListingForm({ initialData, onSubmit, isLoading }: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [price, setPrice] = useState(
    initialData?.priceCents ? (initialData.priceCents / 100).toFixed(2) : ''
  );
  const [listPrice, setListPrice] = useState(
    initialData?.listPriceCents ? (initialData.listPriceCents / 100).toFixed(2) : ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [bullets, setBullets] = useState<string[]>(initialData?.bullets || ['', '', '']);
  const [stock, setStock] = useState(initialData?.stock?.toString() || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      brand,
      priceCents: Math.round(parseFloat(price) * 100),
      listPriceCents: listPrice ? Math.round(parseFloat(listPrice) * 100) : undefined,
      description,
      bullets: bullets.filter(Boolean),
      stock: parseInt(stock, 10),
    });
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const addBullet = () => {
    setBullets([...bullets, '']);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Product Title"
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
            required
          />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sale Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
            <Input
              label="List Price ($) - Optional"
              type="number"
              step="0.01"
              min="0"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <Input
            label="Stock Quantity"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter stock quantity"
            required
          />
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
              placeholder="Describe your product..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Features (Bullet Points)
            </label>
            <div className="space-y-2">
              {bullets.map((bullet, index) => (
                <Input
                  key={index}
                  value={bullet}
                  onChange={(e) => updateBullet(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addBullet}
            >
              + Add Feature
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary">
          Save as Draft
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Listing' : 'Create Listing'}
        </Button>
      </div>
    </form>
  );
}
