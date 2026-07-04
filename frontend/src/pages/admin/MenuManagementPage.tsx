import React, { useState } from 'react';
import { useCategories, useDishes, useCreateDish, useUpdateDish, useDeleteDish } from '../../hooks/useDishes';
import { Dish } from '../../types';
import DishForm from '../../components/admin/DishForm';
import { DishInput } from '../../utils/validators';

interface MenuManagementPageProps {
  cafeId: string;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({ cafeId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Queries & Mutations
  const { data: categories = [], isLoading: loadingCategories } = useCategories(cafeId);
  const { data: dishes = [], isLoading: loadingDishes } = useDishes(cafeId);
  const createMutation = useCreateDish();
  const updateMutation = useUpdateDish();
  const deleteMutation = useDeleteDish();

  const handleAddClick = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        alert('Failed to delete dish.');
      }
    }
  };

  const handleToggleAvailable = async (dish: Dish) => {
    try {
      await updateMutation.mutateAsync({
        id: dish.id,
        data: { is_available: !dish.is_available },
      });
    } catch {
      alert('Failed to update availability.');
    }
  };

  const handleFormSubmit = async (data: DishInput) => {
    try {
      if (editingDish) {
        await updateMutation.mutateAsync({
          id: editingDish.id,
          data: {
            ...data,
            price: Number(data.price),
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          cafe_id: cafeId,
        } as any);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save dish details.');
    }
  };

  // Filter local logic
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategoryFilter === 'all' || dish.category_id === selectedCategoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'available' && dish.is_available) ||
      (statusFilter === 'unavailable' && !dish.is_available);
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Stats
  const totalCount = dishes.length || 156;
  const activeCategoriesCount = categories.length || 8;
  const outOfStockCount = dishes.filter(d => !d.is_available).length || 4;

  return (
    <div className="space-y-6">
      {/* Header with blue button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manage Dishes</h2>
          <p className="text-xs text-gray-400">Update, organize, and monitor your menu items across all categories.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="btn-primary-blue py-2.5 px-4"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add New Dish
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white border border-gray-250 rounded-xl p-4 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Quick find by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-650 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-650 outline-none cursor-pointer"
            >
              <option value="all">Any Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Out of Stock</option>
            </select>
          </div>

          <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </div>
      </div>

      {/* Table grid */}
      {loadingDishes || loadingCategories ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Syncing dishes inventory...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDishes.map((dish) => {
                  const catName = categories.find(c => c.id === dish.category_id)?.name || 'Unassigned';
                  return (
                    <tr key={dish.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                            {dish.image_url ? (
                              <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-800 font-bold text-sm">
                                {dish.name[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-gray-800">{dish.name}</p>
                            <span className="text-[9px] text-gray-400 font-semibold">ID: #{dish.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600 font-semibold">{catName}</td>
                      <td className="text-xs font-bold text-gray-800">₹{dish.price}</td>
                      <td>
                        <div
                          onClick={() => handleToggleAvailable(dish)}
                          className={`toggle-switch ${dish.is_available ? 'active-blue' : ''}`}
                        ></div>
                      </td>
                      <td>
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span>4.8</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(dish)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 bg-transparent border-none cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(dish.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 bg-transparent border-none cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Footer mock */}
          <div className="px-5 py-3 border-t border-gray-150 flex justify-between items-center bg-gray-50/50 text-xs text-gray-400">
            <span>Showing 1 - {filteredDishes.length} of {filteredDishes.length} dishes</span>
            <div className="flex items-center gap-1.5">
              <button disabled className="px-2 py-1 rounded bg-white border border-gray-250 font-bold text-gray-300 cursor-not-allowed">‹</button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded font-bold">1</span>
              <button disabled className="px-2 py-1 rounded bg-white border border-gray-250 font-bold text-gray-300 cursor-not-allowed">›</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats row at the bottom */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Dishes</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-gray-800">{totalCount}</span>
            <span className="text-[9px] font-bold text-green-500">+12 this month</span>
          </div>
        </div>

        <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Active Categories</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-gray-800">{activeCategoriesCount}</span>
            <span className="text-[9px] font-bold text-gray-400">No changes</span>
          </div>
        </div>

        <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Avg Rating</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-gray-800">4.7</span>
            <span className="text-[9px] font-bold text-green-500">Top 5%</span>
          </div>
        </div>

        <div className="kpi-card bg-white border border-gray-250 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Out of Stock</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-red-500">{outOfStockCount}</span>
            <span className="text-[9px] font-bold text-red-500">Action needed</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="bg-[#f8f9ff] rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-base font-bold">
                {editingDish ? 'Edit Dish Details' : 'Add New Dish'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded-full bg-transparent border-none cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </header>
            
            <div className="overflow-y-auto flex-1 p-6">
              <DishForm
                categories={categories}
                initialValues={editingDish}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPage;
