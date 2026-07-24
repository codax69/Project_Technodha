import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShoppingBag } from 'lucide-react';

const STATUS_COLORS = {
  completed: '#8BC96B', // moss green
  processing: '#3B82F6', // vibrant blue
  pending: '#E8A23D',    // amber
  cancelled: '#E5544A',  // ember red
};

export const ChartOrderStatus = ({ orders = [] }) => {
  const statusCounts = orders.reduce(
    (acc, order) => {
      const st = order.status?.toLowerCase() || 'pending';
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    { completed: 0, processing: 0, pending: 0, cancelled: 0 }
  );

  const data = [
    { name: 'Completed', value: statusCounts.completed, color: STATUS_COLORS.completed },
    { name: 'Processing', value: statusCounts.processing, color: STATUS_COLORS.processing },
    { name: 'Pending', value: statusCounts.pending, color: STATUS_COLORS.pending },
    { name: 'Cancelled', value: statusCounts.cancelled, color: STATUS_COLORS.cancelled },
  ].filter((item) => item.value > 0);

  const totalOrders = orders.length;

  return (
    <Card className="flex flex-col justify-between shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Order Status Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Live fulfillment status distribution ({totalOrders} total)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            No order data available
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.9)',
                    borderColor: '#333',
                    borderRadius: '0.75rem',
                    color: '#F5F3EE',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  formatter={(value, name) => [`${value} orders (${((value / totalOrders) * 100).toFixed(1)}%)`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-semibold text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartOrderStatus;
