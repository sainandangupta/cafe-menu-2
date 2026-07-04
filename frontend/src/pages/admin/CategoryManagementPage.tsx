import React, { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useReorderCategories } from '../../hooks/useDishes';
import { Category } from '../../types';
import CategoryForm from '../../components/admin/CategoryForm';
import { CategoryInput } from '../../utils/validators';

interface CategoryManagementPageProps {
  cafeId: string;
}

export const CategoryManagementPage: React.FC<CategoryManagementPageProps> = ({ cafeId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: categories = [], isLoading } = useCategories(cafeId);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  // Sort categories by display_order
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        alert('Failed to delete category.');
      }
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: { is_active: !category.is_active },
      });
    } catch {
      alert('Failed to update category status.');
    }
  };

  const handleFormSubmit = async (data: CategoryInput) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data,
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          cafe_id: cafeId,
        } as any);
      }
      setIsModalOpen(false);
    } catch {
      alert('Failed to save category.');
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedRowId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetId) return;

    const items = [...sortedCategories];
    const dragIdx = items.findIndex((item) => item.id === draggedRowId);
    const hoverIdx = items.findIndex((item) => item.id === targetId);

    if (dragIdx === -1 || hoverIdx === -1) return;

    const [removed] = items.splice(dragIdx, 1);
    items.splice(hoverIdx, 0, removed);

    const reorderedList = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    try {
      await reorderMutation.mutateAsync(reorderedList);
    } catch {
      alert('Failed to reorder categories.');
    } finally {
      setDraggedRowId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-white border border-gray-250 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
        <span className="text-xs font-semibold text-gray-500">
          Drag handles (≡) to reorder display sequence on the customer view.
        </span>
        <button
          onClick={handleAddClick}
          className="btn-primary-blue py-2 px-4"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Category
        </button>
      </div>

      {/* Table grid with Drag handlers */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Syncing categories hierarchy...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-250 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">Sort</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Order Index</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map((record) => (
                  <tr
                    key={record.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, record.id)}
                    onDragOver={(e) => handleDragOver(e, record.id)}
                    onDrop={(e) => handleDrop(e, record.id)}
                    className="cursor-move select-none"
                  >
                    <td>
                      <span className="cursor-grab text-gray-400 hover:text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-base font-bold">drag_indicator</span>
                      </span>
                    </td>
                    <td className="font-bold text-xs text-gray-800">{record.name}</td>
                    <td className="text-xs text-gray-500 font-medium">{record.description || 'No description'}</td>
                    <td className="text-xs font-semibold text-gray-700">{record.display_order}</td>
                    <td>
                      <div
                        onClick={() => handleToggleActive(record)}
                        className={`toggle-switch ${record.is_active ? 'active-blue' : ''}`}
                      ></div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 bg-transparent border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(record.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 bg-transparent border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal dialog overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="bg-[#f8f9ff] border border-gray-200 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded-full bg-transparent border-none cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </header>

            <div className="p-6">
              <CategoryForm
                initialValues={editingCategory}
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

export default CategoryManagementPage;
