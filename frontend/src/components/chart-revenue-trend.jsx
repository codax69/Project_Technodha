import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export const ChartRevenueTrend = ({ orders = [] }) => {
  // Group revenue by year-month and sort chronologically
  const monthlyData = orders.reduce((acc, order) => {
    if (order.status === 'cancelled') return acc;
    const date = new Date(order.created_at || Date.now());
    const yearMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const displayMonth = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    if (!acc[yearMonthKey]) {
      acc[yearMonthKey] = { sortKey: yearMonthKey, month: displayMonth, revenue: 0, ordersCount: 0 };
    }
    acc[yearMonthKey].revenue += parseFloat(order.total_price || 0);
    acc[yearMonthKey].ordersCount += 1;
    return acc;
  }, {});

  const data = Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return (
    <Card className="flex flex-col justify-between shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Monthly Revenue & Order Volume
            </CardTitle>
            <CardDescription className="text-xs">
              Cumulative earnings (₹) alongside completed order count
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            No sales data available
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.9)',
                    borderColor: '#333',
                    borderRadius: '0.75rem',
                    color: '#F5F3EE',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${parseFloat(value).toFixed(2)}` : `${value} orders`,
                    name === 'revenue' ? 'Revenue (₹)' : 'Order Volume',
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-foreground">
                      {value === 'revenue' ? 'Revenue (₹)' : 'Orders Count'}
                    </span>
                  )}
                />
                <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#8BC96B" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="ordersCount" name="ordersCount" stroke="#FB6557" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartRevenueTrend;
