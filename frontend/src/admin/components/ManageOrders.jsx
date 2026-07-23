import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Eye, X, Package, Clock, User } from 'lucide-react';

export const ManageOrders = ({ orders, orderStatusMutation }) => {
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders?.filter((ord) => {
    if (statusFilter === 'all') return true;
    return ord.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Processing</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Status Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Order Fulfillment & Status Management</h2>
          <p className="text-xs text-muted-foreground">
            Manage customer orders and update status ({filteredOrders?.length || 0} displayed)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border text-xs font-semibold rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders?.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No orders found with status "{statusFilter}".
          </Card>
        ) : (
          filteredOrders?.map((ord) => (
            <Card key={ord.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base">Order #{ord.id}</span>
                  {getStatusBadge(ord.status)}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Customer: <strong className="text-primary">{ord.customer_username}</strong></span>
                  <span>•</span>
                  <span>Date: {new Date(ord.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span>Items: {ord.items?.length || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="font-black text-lg">₹{ord.total_price}</span>

                {/* Status Dropdown */}
                <select
                  value={ord.status}
                  onChange={(e) => orderStatusMutation.mutate({ id: ord.id, status: e.target.value })}
                  className="bg-background border text-xs font-semibold rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled (Restock)</option>
                </select>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setSelectedOrderDetails(ord)}
                  title="View order details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order Line Items Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl border bg-background space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">Order #{selectedOrderDetails.id} Details</h3>
                <span className="text-xs text-muted-foreground">
                  Customer: <strong className="text-primary">{selectedOrderDetails.customer_username}</strong>
                </span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedOrderDetails(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Placed on: {new Date(selectedOrderDetails.created_at).toLocaleString()}
                </span>
                {getStatusBadge(selectedOrderDetails.status)}
              </div>

              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider pt-2">Purchased Items</h4>
              <div className="space-y-2">
                {selectedOrderDetails.items?.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-semibold">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.quantity} × ₹{item.unit_price_at_purchase}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex justify-between items-center font-bold text-base">
                <span>Grand Total</span>
                <span className="text-xl text-primary font-black">₹{selectedOrderDetails.total_price}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
