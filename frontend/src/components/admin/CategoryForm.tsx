import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategorySchema, CategoryInput } from '../../utils/validators';
import { Category } from '../../types';

interface CategoryFormProps {
  initialValues?: Category | null;
  onSubmit: (data: CategoryInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: '',
      description: '',
      display_order: 0,
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (initialValues) {
      setValue('name', initialValues.name);
      setValue('description', initialValues.description || '');
      setValue('display_order', initialValues.display_order);
      setValue('is_active', initialValues.is_active);
    }
  }, [initialValues, setValue]);

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Category Name</label>
        <input
          type="text"
          placeholder="e.g. Starters"
          className={`input-field ${errors.name ? 'border-red-400' : ''}`}
          {...register('name')}
        />
        {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message as string}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Description</label>
        <textarea
          placeholder="Enter category description..."
          rows={3}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          {...register('description')}
        />
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Display Order</label>
        <input
          type="number"
          min="0"
          placeholder="e.g. 1"
          className={`input-field ${errors.display_order ? 'border-red-400' : ''}`}
          {...register('display_order', { valueAsNumber: true })}
        />
        {errors.display_order && <p className="text-red-500 text-[10px] mt-1">{errors.display_order.message as string}</p>}
      </div>

      {/* Active State */}
      <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl">
        <span className="text-xs font-semibold text-gray-750">Is Active Category</span>
        <div
          onClick={() => setValue('is_active', !isActive)}
          className={`toggle-switch ${isActive ? 'active-blue' : ''}`}
        ></div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary py-2 px-4 text-xs w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary-blue py-2.5 px-5 text-xs flex items-center gap-1.5"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm font-bold">save</span>
              Save Category
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
