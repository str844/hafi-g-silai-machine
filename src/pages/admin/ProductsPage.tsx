import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sliders,
  Tag,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  addBrand,
  deleteBrand,
} from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUploader } from '../../components/common/ImageUploader';
import type { Product, Brand, ProductCategory, ProductStatus } from '../../types';

interface ProductsPageProps {
  products: Product[];
  brands: Brand[];
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ products, brands }) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);

  // Loading & message states
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Product Form State
  const initialFormState = {
    name: '',
    sku: '',
    category: 'Sewing Machines' as ProductCategory,
    brand: brands[0]?.name || 'Usha',
    model: '',
    description: '',
    purchasePrice: 0,
    sellingPrice: 0,
    currentStock: 1,
    minStock: 2,
    unit: 'Pcs',
    status: 'Active' as ProductStatus,
    imageUrl: '',
    serialNumber: '',
    warrantyPeriod: '',
    partNumber: '',
    compatibleModels: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Stock Adjustment Form State
  const [adjustType, setAdjustType] = useState<'Add' | 'Subtract' | 'Set'>('Add');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Physical stock check');

  // Brand Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCategory, setNewBrandCategory] = useState('Machines & Parts');
  const [newBrandDescription, setNewBrandDescription] = useState('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (stockFilter === 'Low' && (p.currentStock > p.minStock || p.currentStock <= 0)) return false;
      if (stockFilter === 'Out' && p.currentStock > 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q) ||
          p.partNumber?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, selectedBrand, stockFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      brand: brands[0]?.name || 'Usha',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      category: p.category || 'Sewing Machines',
      brand: p.brand || brands[0]?.name || 'Usha',
      model: p.model || '',
      description: p.description || '',
      purchasePrice: p.purchasePrice || 0,
      sellingPrice: p.sellingPrice || 0,
      currentStock: p.currentStock || 0,
      minStock: p.minStock || 2,
      unit: p.unit || 'Pcs',
      status: p.status || 'Active',
      imageUrl: p.imageUrl || '',
      serialNumber: p.serialNumber || '',
      warrantyPeriod: p.warrantyPeriod || '',
      partNumber: p.partNumber || '',
      compatibleModels: p.compatibleModels || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.sellingPrice <= 0) {
      showToast('Please provide a valid product name and selling price.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast(`Product "${formData.name}" updated successfully.`);
      } else {
        await addProduct(formData);
        showToast(`Product "${formData.name}" added to inventory.`);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save product.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted.`);
      setProductToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete product.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetProduct) return;
    if (adjustQuantity < 0) {
      showToast('Quantity cannot be negative.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adjustStock(
        adjustTargetProduct.id,
        adjustTargetProduct.name,
        adjustType,
        Number(adjustQuantity),
        adjustReason
      );
      showToast(`Stock updated for ${adjustTargetProduct.name}.`);
      setIsAdjustStockModalOpen(false);
      setAdjustTargetProduct(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to adjust stock.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setActionLoading(true);
    try {
      await addBrand(newBrandName, newBrandCategory, newBrandDescription);
      showToast(`Brand "${newBrandName}" added.`);
      setNewBrandName('');
      setNewBrandDescription('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to add brand.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    try {
      await deleteBrand(brandId);
      showToast(`Brand "${brandName}" removed.`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete brand.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-700'
              : 'bg-red-800 text-white border border-red-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Inventory & Stock Management</h2>
          <p className="text-xs text-gray-500">
            Manage sewing machines, spare parts, tailoring accessories and stock quantities
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsBrandsModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-gray-500" />
            <span>Manage Brands ({brands.length})</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, model..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Sewing Machines">Sewing Machines</option>
              <option value="Spare Parts">Spare Parts</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Condition */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low">Low Stock Alert</option>
              <option value="Out">Out of Stock Only</option>
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Showing <strong className="text-gray-800">{filteredProducts.length}</strong> of{' '}
            {products.length} products
          </span>
          {(selectedCategory !== 'All' || selectedBrand !== 'All' || stockFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBrand('All');
                setStockFilter('All');
                setSearchQuery('');
              }}
              className="text-xs text-red-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 p-4">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              No products match your current search or filter criteria. Add a product to get started.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Brand & Category</th>
                  <th className="py-3 px-3 text-right">Purchase Price</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-center">Stock</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStock && p.currentStock > 0;
                  const isOut = p.currentStock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.imageUrl ||
                              'https://placehold.co/100x100?text=No+Photo'
                            }
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/100x100?text=Silai';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate max-w-xs">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              {p.sku && <span>SKU: {p.sku}</span>}
                              {p.model && <span>Model: {p.model}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 block">{p.brand}</span>
                        <span className="text-[10px] text-gray-500">{p.category}</span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-3 text-right font-medium text-gray-500">
                        {p.purchasePrice ? formatCurrency(p.purchasePrice) : '-'}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right font-bold text-emerald-800">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      {/* Stock with status pill */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-extrabold px-2 py-0.5 rounded text-xs ${
                              isOut
                                ? 'bg-red-100 text-red-700 font-bold'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 font-bold'
                                : 'text-gray-800'
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                          {isLow && (
                            <span className="text-[9px] text-amber-700 font-medium">Low Stock</span>
                          )}
                          {isOut && (
                            <span className="text-[9px] text-red-700 font-medium">Out of Stock</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setProductToView(p)}
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustTargetProduct(p);
                              setAdjustQuantity(1);
                              setAdjustType('Add');
                              setAdjustReason('Physical stock check');
                              setIsAdjustStockModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                            title="Adjust Stock"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Inventory'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          {/* Category, Brand, Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ProductCategory })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Sewing Machines">Sewing Machines</option>
                <option value="Spare Parts">Spare Parts</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsBrandsModalOpen(true)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                  title="Add Brand"
                >
                  + Brand
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Product Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Usha Anand DLX Domestic Sewing Machine"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Model Name / Number</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Anand DLX or F4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">SKU / Item Code</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. USH-ANAND-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Sewing Machine Specific Fields */}
          {formData.category === 'Sewing Machines' && (
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-3">
              <span className="font-semibold text-emerald-900 block">
                Machine Specific Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Serial Number (Unique)
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. USH-2026-904"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Warranty Period</label>
                  <input
                    type="text"
                    value={formData.warrantyPeriod}
                    onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                    placeholder="e.g. 1 Year Official Warranty"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Spare Part Specific Fields */}
          {formData.category === 'Spare Parts' && (
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-3">
              <span className="font-semibold text-amber-900 block">Spare Part Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Part Number</label>
                  <input
                    type="text"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="e.g. SR-DOM-01 or 110-001"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Compatible Machines</label>
                  <input
                    type="text"
                    value={formData.compatibleModels}
                    onChange={(e) => setFormData({ ...formData, compatibleModels: e.target.value })}
                    placeholder="e.g. Usha, Singer, Merrit Domestic"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Current Stock</label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({ ...formData, currentStock: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Min Stock Alert</label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Stock Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Set">Set (With Table & Stand)</option>
                <option value="Box">Box (Pack of 10/20)</option>
                <option value="Pkt">Packet</option>
                <option value="Meter">Meter</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Store Display Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProductStatus })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Active">Active (Visible on public store)</option>
                <option value="Inactive">Inactive (Hidden from public)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Specifications, features, included attachments..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Product Image */}
          <ImageUploader
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            label="Product Photo"
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer transition-colors text-xs disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustStockModalOpen}
        onClose={() => setIsAdjustStockModalOpen(false)}
        title={`Stock Adjustment: ${adjustTargetProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStockAdjustment} className="space-y-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-gray-500 block">Current Recorded Stock:</span>
              <span className="text-base font-extrabold text-gray-900">
                {adjustTargetProduct?.currentStock} {adjustTargetProduct?.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block">SKU:</span>
              <span className="font-mono text-gray-700">{adjustTargetProduct?.sku || 'N/A'}</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('Add')}
                className={`py-2 rounded-lg font-semibold text-center border cursor-pointer ${
                  adjustType === 'Add'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                + Add (Found/Gift)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('Subtract')}
                className={`py-2 rounded-lg font-semibold text-center border cursor-pointer ${
                  adjustType === 'Subtract'
                    ? 'bg-red-50 border-red-600 text-red-800'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                - Subtract (Damaged)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('Set')}
                className={`py-2 rounded-lg font-semibold text-center border cursor-pointer ${
                  adjustType === 'Set'
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                = Set Exact
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {adjustType === 'Set' ? 'New Exact Stock Level' : 'Quantity to Adjust'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Reason for Adjustment</label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Month-end inventory verification, damaged during transit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAdjustStockModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Brand Management Modal */}
      <Modal
        isOpen={isBrandsModalOpen}
        onClose={() => setIsBrandsModalOpen(false)}
        title="Manage Sewing Machine & Spare Part Brands"
        maxWidth="lg"
      >
        <div className="space-y-5 text-xs">
          {/* Add Brand Form */}
          <form onSubmit={handleAddBrand} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-3">
            <span className="font-bold text-gray-900 block">Add New Brand</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Brand name (e.g. Juki, Jack, Usha)"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={newBrandCategory}
                onChange={(e) => setNewBrandCategory(e.target.value)}
                placeholder="Category (e.g. Industrial, Needles)"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <input
              type="text"
              value={newBrandDescription}
              onChange={(e) => setNewBrandDescription(e.target.value)}
              placeholder="Short description / notes"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-right">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
              >
                Add Brand
              </button>
            </div>
          </form>

          {/* Brands list */}
          <div className="space-y-2">
            <span className="font-semibold text-gray-700 block">Current Brands ({brands.length})</span>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
              {brands.map((b) => (
                <div key={b.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-900 block">{b.name}</span>
                    <span className="text-[10px] text-gray-500">
                      {b.category || 'General'} {b.description ? `• ${b.description}` : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                    title="Remove Brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Product Record?"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />

      {/* View Product Details Modal */}
      {productToView && (
        <Modal
          isOpen={!!productToView}
          onClose={() => setProductToView(null)}
          title={`Product Overview: ${productToView.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex gap-4 items-center">
              <img
                src={productToView.imageUrl || 'https://placehold.co/200x200?text=No+Photo'}
                alt=""
                className="w-24 h-24 rounded-xl object-cover border border-gray-200 bg-gray-50"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px]">
                  {productToView.category}
                </span>
                <h4 className="font-bold text-gray-900 text-sm">{productToView.name}</h4>
                <p className="text-gray-500">Brand: {productToView.brand}</p>
                {productToView.model && <p className="text-gray-500">Model: {productToView.model}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Purchase Cost</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(productToView.purchasePrice)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Selling Price</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {formatCurrency(productToView.sellingPrice)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Current Stock</span>
                <span className="font-bold text-gray-900">
                  {productToView.currentStock} {productToView.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Min Stock Alert</span>
                <span className="text-gray-700">{productToView.minStock} {productToView.unit}</span>
              </div>
            </div>

            {productToView.serialNumber && (
              <div>
                <span className="text-gray-500 block">Serial Number:</span>
                <span className="font-mono font-semibold">{productToView.serialNumber}</span>
              </div>
            )}

            {productToView.warrantyPeriod && (
              <div>
                <span className="text-gray-500 block">Warranty:</span>
                <span className="font-semibold text-emerald-700">{productToView.warrantyPeriod}</span>
              </div>
            )}

            {productToView.compatibleModels && (
              <div>
                <span className="text-gray-500 block">Compatible Models:</span>
                <span className="text-gray-700">{productToView.compatibleModels}</span>
              </div>
            )}

            {productToView.description && (
              <div>
                <span className="text-gray-500 block">Description:</span>
                <p className="text-gray-700 leading-relaxed mt-0.5">{productToView.description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
