'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { getMenuCategories, createMenuCategory, updateMenuCategory, deleteMenuCategory, upsertMenuItem, deleteMenuItem } from '@/app/actions/admin-management';

export default function AdminMenu() {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form States
    const [catName, setCatName] = useState('');
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        price: '',
        isVeg: true,
        isAvailable: true,
        image: ''
    });

    const loadData = async () => {
        setLoading(true);
        const data = await getMenuCategories();
        setCategories(data);
        if (!selectedCategory && data.length > 0) {
            setSelectedCategory(data[0]);
        } else if (selectedCategory) {
            // Update selected category ref
            const updated = data.find(c => c.id === selectedCategory.id);
            if (updated) setSelectedCategory(updated);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Category Handlers ---
    const handleAddCategory = () => {
        setEditingCategory(null);
        setCatName('');
        setShowCategoryModal(true);
    };

    const handleEditCategory = (cat: any) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async () => {
        if (!catName.trim()) return;
        setLoading(true);

        if (editingCategory) {
            await updateMenuCategory(editingCategory.id, { name: catName });
        } else {
            await createMenuCategory({ name: catName });
        }

        await loadData();
        setShowCategoryModal(false);
        setLoading(false);
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category? Items must be deleted first.')) return;
        setLoading(true);
        const res = await deleteMenuCategory(id);
        if (!res.success) alert(res.error);
        await loadData();
        setLoading(false);
    };

    // --- Item Handlers ---
    const handleAddItem = () => {
        if (!selectedCategory) return;
        setEditingItem(null);
        setItemForm({ name: '', description: '', price: '', isVeg: true, isAvailable: true, image: '' });
        setShowItemModal(true);
    };

    const handleEditItem = (item: any) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            image: item.image || ''
        });
        setShowItemModal(true);
    };

    const handleSaveItem = async () => {
        if (!itemForm.name || !itemForm.price) return;
        setLoading(true);

        const payload = {
            id: editingItem?.id,
            categoryId: selectedCategory.id,
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            isVeg: itemForm.isVeg,
            isAvailable: itemForm.isAvailable,
            image: itemForm.image
        };

        const res = await upsertMenuItem(payload);
        if (!res.success) alert(res.error);

        await loadData();
        setShowItemModal(false);
        setLoading(false);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        setLoading(true);
        await deleteMenuItem(id);
        await loadData();
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar: Categories */}
            <div className="md:col-span-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Categories</h3>
                    <button onClick={handleAddCategory} className="btn btn-sm btn-primary p-2 rounded-full">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-3 rounded-md cursor-pointer flex justify-between group ${selectedCategory?.id === cat.id ? 'bg-blue-50 text-blue-700 border-blue-200 border' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                            <span className="font-medium truncate">{cat.name}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }} className="p-1 hover:text-blue-600">
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="p-1 hover:text-red-600">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Items */}
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">
                        {selectedCategory ? `${selectedCategory.name} - Items` : 'Select a Category'}
                    </h3>
                    {selectedCategory && (
                        <button onClick={handleAddItem} className="btn btn-sm btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {selectedCategory ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedCategory.menuItems.map((item: any) => (
                                <div key={item.id} className={`bg-white p-4 rounded-lg border shadow-sm ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                                        <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2 h-10">{item.description || 'No description'}</p>
                                    <div className="flex justify-between items-end border-t pt-3 border-slate-100">
                                        <span className="font-bold text-lg text-slate-900">₹{item.price}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditItem(item)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-md">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-md">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {!item.isAvailable && <div className="mt-2 text-xs text-red-500 font-bold uppercase text-center border-t border-red-100 pt-1">Unavailable</div>}
                                </div>
                            ))}
                            {selectedCategory.menuItems.length === 0 && (
                                <div className="col-span-full text-center py-10 text-slate-400">
                                    No items in this category. Add one!
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            Select a category to view items
                        </div>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                        <input
                            value={catName}
                            onChange={e => setCatName(e.target.value)}
                            placeholder="Category Name"
                            className="input mb-4 w-full"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowCategoryModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSaveCategory} className="btn btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">{editingItem ? 'Edit Item' : 'New Item'}</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Name</label>
                                <input
                                    value={itemForm.name}
                                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                                <textarea
                                    value={itemForm.description}
                                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                    className="input w-full h-20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Image URL (Optional)</label>
                                <div className="flex gap-2 items-center">
                                    <ImageIcon className="w-4 h-4 text-slate-400" />
                                    <input
                                        value={itemForm.image}
                                        onChange={e => setItemForm({ ...itemForm, image: e.target.value })}
                                        placeholder="https://example.com/food.jpg"
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={itemForm.price}
                                        onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="flex items-end mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={itemForm.isVeg}
                                            onChange={e => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                                            className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">Vegetarian</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={itemForm.isAvailable}
                                        onChange={e => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Available for Order</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <button onClick={() => setShowItemModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSaveItem} className="btn btn-primary">Save Item</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
