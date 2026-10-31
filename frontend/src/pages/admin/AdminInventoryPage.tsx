import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { AdminProduct, AdminSizeStock, StockMovement } from '../../types';
import { Layers, Plus, Minus, AlertTriangle, History, ArrowDownUp, Check } from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<{ sizeId: string; productName: string; ukSize: string; currentStock: number } | null>(null);
  const [qtyChange, setQtyChange] = useState<number>(10);
  const [movementType, setMovementType] = useState('RESTOCK');
  const [notes, setNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getProducts({ size: 50 }),
      adminApi.getStockMovements({ size: 15 })
    ])
      .then(([prodRes, movRes]) => {
        setProducts(prodRes.data.content);
        setMovements(movRes.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const cleanSize = (s: string) => (s ? s.replace(/^UK\s*/i, '').trim() : '');

  const openAdjust = (size: AdminSizeStock, prodName: string) => {
    setSelectedSize({
      sizeId: size.sizeId,
      productName: prodName,
      ukSize: cleanSize(size.ukSize),
      currentStock: size.totalStock,
    });
    setQtyChange(10);
    setMovementType('RESTOCK');
    setNotes('');
    setErrorMsg('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) return;

    try {
      setAdjusting(true);
      setErrorMsg('');
      await adminApi.adjustStock({
        productSizeId: selectedSize.sizeId,
        quantityChange: movementType === 'RESTOCK' ? Math.abs(qtyChange) : -Math.abs(qtyChange),
        movementType,
        notes: notes.trim() || undefined,
      });

      setAdjustModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-navy-950">Inventory & Stock Management</h1>
        <p className="text-xs text-slate-500">
          View exact size-wise inventory buffers, adjust stock counts, and inspect historical audit movements.
        </p>
      </div>

      {/* Products & Sizes Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
        <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
          <Layers className="w-4 h-4 text-navy-800" />
          <span>Size-Wise Physical & Reserved Stock</span>
        </h2>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map(prod => (
              <div key={prod.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">{prod.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">SKU: {prod.sku} • Category: {prod.category}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    Total: <span className="text-navy-950 font-mono font-black">{prod.totalCombinedStock}</span> pairs
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {prod.sizes.map(size => (
                    <div
                      key={size.sizeId}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                        size.isLowStock
                          ? 'bg-red-50/60 border-red-200 text-red-950'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-navy-950 text-xs">Size {cleanSize(size.ukSize)}</span>
                        {size.isLowStock && (
                          <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1 rounded">LOW</span>
                        )}
                      </div>

                      <div className="my-2 space-y-1">
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Count:</span>
                          <span className="font-mono font-black text-navy-950 text-sm">{size.totalStock}</span>
                        </div>
                        {size.price && (
                          <div className="flex justify-between items-center px-1 text-[11px] text-slate-500">
                            <span>Price:</span>
                            <span className="font-mono font-semibold text-slate-700">₹{size.price}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => openAdjust(size, prod.name)}
                        className="w-full mt-1 py-1 rounded bg-slate-100 hover:bg-navy-950 hover:text-white text-[10px] font-bold text-slate-700 transition"
                      >
                        Adjust Stock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Movement Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-navy-800" />
          <span>Recent Stock Movement Audit History</span>
        </h2>

        {movements.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No movements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Date & Time</th>
                  <th className="py-2.5">Shoe Model</th>
                  <th className="py-2.5">Size</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Qty Change</th>
                  <th className="py-2.5">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 text-slate-500 text-[11px]">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-navy-950">{m.productName}</td>
                    <td className="py-2.5 font-bold text-slate-700">{cleanSize(m.ukSize)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.movementType === 'RESTOCK' ? 'bg-emerald-100 text-emerald-800' :
                        m.movementType === 'SALE' ? 'bg-blue-100 text-blue-800' :
                        m.movementType === 'RESERVATION' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {m.movementType}
                      </span>
                    </td>
                    <td className={`py-2.5 font-mono font-bold ${m.quantity > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedSize && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-navy-950">Adjust Stock Quantity</h3>
            <p className="text-xs text-slate-500">
              {selectedSize.productName} • Size: <strong className="text-navy-950">{cleanSize(selectedSize.ukSize)}</strong> (Current Count: {selectedSize.currentStock})
            </p>

            {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{errorMsg}</p>}

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('RESTOCK')}
                    className={`py-2 rounded-lg font-bold border ${movementType === 'RESTOCK' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    + Restock (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('ADJUSTMENT')}
                    className={`py-2 rounded-lg font-bold border ${movementType === 'ADJUSTMENT' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    - Deduct (Damage/Correction)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qtyChange}
                  onChange={e => setQtyChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Audit Log Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Factory shipment batch 24 / Damaged pair"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 rounded-lg bg-navy-950 text-white hover:bg-navy-850 font-bold"
                >
                  {adjusting ? 'Saving...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
