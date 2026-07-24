import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layers } from 'lucide-react';

export const ChartCategoryStock = ({ products = [], categories = [] }) => {
  const data = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat.id);
    const totalStock = catProducts.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
    return {
      name: cat.name,
      productsCount: catProducts.length,
      stockQuantity: totalStock,
    };
  });

  return (
    <Card className="flex flex-col justify-between shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Category Inventory & Stock Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Product volume & total stock units per category
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            No category data available
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  interval={0}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.9)',
                    borderColor: '#333',
                    borderRadius: '0.75rem',
                    color: '#F5F3EE',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-foreground">
                      {value === 'productsCount' ? 'Products Count' : 'Stock Units'}
                    </span>
                  )}
                />
                <Bar dataKey="productsCount" name="productsCount" fill="#FB6557" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockQuantity" name="stockQuantity" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartCategoryStock;
