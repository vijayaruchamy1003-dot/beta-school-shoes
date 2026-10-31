import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { Order } from '../../types';
import { 
  Search, 
  ShoppingBag, 
  Eye, 
  X, 
  Check, 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  Package, 
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';

interface ParsedShippingAddress {
  recipientName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    adminApi.getOrders({ status: statusFilter, search: search.trim() || undefined, size: 50 })
      .then(res => setOrders(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? res.data : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const parseShippingAddress = (jsonStr?: string): ParsedShippingAddress | null => {
    if (!jsonStr) return null;
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Paid</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Processing</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">Shipped</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'PENDING_PAYMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending Payment</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Customer Orders & Fulfillment</h1>
        <p className="text-xs text-slate-500">Track online customer orders, inspect student delivery addresses, and manage fulfillment stages.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number or customer details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') loadOrders(); }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition"
        >
          Filter
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-xs text-slate-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-400">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map(order => {
                  const addr = parseShippingAddress(order.shippingAddressJson);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{addr?.recipientName || 'Customer'}</span>
                        {addr?.city && <span className="text-[11px] text-slate-400 block">{addr.city}</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateStatus(order.id, e.target.value)}
                          disabled={updating}
                          className="px-2.5 py-1 rounded text-xs font-semibold border border-slate-300 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="PENDING_PAYMENT">Pending Payment</option>
                          <option value="PAID">Paid</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-primary font-bold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (() => {
        const addr = parseShippingAddress(selectedOrder.shippingAddressJson);
        const subtotal = selectedOrder.items.reduce((acc, item) => acc + item.subtotal, 0);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <h3 className="text-lg font-black font-mono text-navy-950 mt-0.5">
                    Order {selectedOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto overflow-x-hidden text-xs">
                
                {/* Order Meta & Status Updater */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Fulfillment Status
                    </span>
                    <select
                      value={selectedOrder.status}
                      disabled={updating}
                      onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="PENDING_PAYMENT">Pending Payment</option>
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Order Placed Date
                    </span>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {/* Formatted Shipping Address */}
                <div>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Shipping & Delivery Details</span>
                  </span>

                  {addr ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-900 text-sm">
                            {addr.recipientName || 'Not specified'}
                          </span>
                        </div>
                        {addr.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{addr.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-slate-600 space-y-0.5 text-xs pl-6">
                        <p className="font-medium text-slate-800">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-slate-600">{addr.addressLine2}</p>}
                        <p className="text-slate-600">
                          {[addr.city, addr.state].filter(Boolean).join(', ')}
                          {addr.postalCode ? ` - ${addr.postalCode}` : ''}
                        </p>
                        {addr.country && (
                          <p className="text-slate-500 text-[11px] font-medium pt-0.5">{addr.country}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-500 italic">
                      {selectedOrder.shippingAddressJson || 'No delivery address recorded.'}
                    </div>
                  )}
                </div>

                {/* Items Purchased Table */}
                <div>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Items Purchased ({selectedOrder.items.length})</span>
                  </span>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Product & Size</span>
                      <span className="text-right">Subtotal</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{item.productName}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                                Size: {item.sizeLabel}
                              </span>
                              <span>Qty: {item.quantity}</span>
                              <span>× ₹{Number(item.unitPrice).toFixed(2)}</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-sm shrink-0">
                            ₹{Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Customer Notes if any */}
                {selectedOrder.customerNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <span className="font-bold uppercase text-[10px] tracking-wider text-amber-700 block mb-0.5">
                      Customer Delivery Note
                    </span>
                    <p className="italic">"{selectedOrder.customerNotes}"</p>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal:</span>
                    <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {Number(selectedOrder.shippingAmount) > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping Fee:</span>
                      <span className="font-mono">₹{Number(selectedOrder.shippingAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(selectedOrder.taxAmount) > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Taxes & Cess:</span>
                      <span className="font-mono">₹{Number(selectedOrder.taxAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="font-mono text-base font-black text-primary">
                      ₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
