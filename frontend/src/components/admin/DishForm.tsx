import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DishSchema, DishInput } from '../../utils/validators';
import { Category, Dish } from '../../types';

interface DishFormProps {
  categories: Category[];
  initialValues?: Dish | null;
  onSubmit: (data: DishInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DishForm: React.FC<DishFormProps> = ({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(DishSchema),
    defaultValues: {
      name: '',
      category_id: '',
      price: 0,
      description: '',
      ingredients: [],
      image_url: '',
      is_available: true,
      is_veg: false,
      is_spicy: false,
      is_bestseller: false,
      is_seasonal: false,
      labels: [],
    },
  });

  const [ingInput, setIngInput] = useState('');

  // Populate form in edit mode
  useEffect(() => {
    if (initialValues) {
      setValue('name', initialValues.name);
      setValue('category_id', initialValues.category_id);
      setValue('price', Number(initialValues.price));
      setValue('description', initialValues.description || '');
      setValue('ingredients', initialValues.ingredients || []);
      setValue('image_url', initialValues.image_url || '');
      setValue('is_available', initialValues.is_available);
      setValue('is_veg', initialValues.is_veg);
      setValue('is_spicy', initialValues.is_spicy);
      setValue('is_bestseller', initialValues.is_bestseller);
      setValue('is_seasonal', initialValues.is_seasonal);
      setValue('labels', initialValues.labels || []);
    }
  }, [initialValues, setValue]);

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const ingredients = watch('ingredients') || [];
  const imageUrl = watch('image_url');

  const addIngredient = () => {
    if (!ingInput.trim()) return;
    setValue('ingredients', [...ingredients, ingInput.trim()]);
    setIngInput('');
  };

  const removeIngredient = (idx: number) => {
    setValue('ingredients', ingredients.filter((_: any, i: number) => i !== idx));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* 2 columns: Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Dish Name</label>
          <input
            type="text"
            placeholder="e.g., Truffle Mushroom Risotto"
            className={`input-field ${errors.name ? 'border-red-400' : ''}`}
            {...register('name')}
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message as string}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Category</label>
          <select
            className={`input-field bg-white py-2.5 ${errors.category_id ? 'border-red-400' : ''}`}
            {...register('category_id')}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="text-red-500 text-[10px] mt-1">{errors.category_id.message as string}</p>}
        </div>
      </div>

      {/* Price & Ingredients Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Price (₹)</label>
          <input
            type="number"
            min="1"
            placeholder="0"
            className={`input-field ${errors.price ? 'border-red-400' : ''}`}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-red-500 text-[10px] mt-1">{errors.price.message as string}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Ingredients Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add ingredient tag..."
              value={ingInput}
              onChange={(e) => setIngInput(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-3 bg-blue-600 text-white rounded-lg font-bold text-xs cursor-pointer border-none"
            >
              Add
            </button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ingredients.map((ing: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  {ing}
                  <button type="button" onClick={() => removeIngredient(i)} className="text-blue-500 hover:text-blue-700 font-bold bg-transparent border-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Description</label>
        <textarea
          placeholder="Describe the flavors, texture, and presentation..."
          rows={3}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          {...register('description')}
        />
      </div>

      {/* Dish Image link / upload preview */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Dish Image Link</label>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="input-field"
              {...register('image_url')}
            />
          </div>
          {imageUrl && (
            <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden border border-gray-200 flex-shrink-0">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Attributes & Labels Checkboxes Grid */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Attributes & Labels</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('is_veg')}
            />
            <span>Veg</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('is_spicy')}
            />
            <span>Spicy</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('is_bestseller')}
            />
            <span>Bestseller</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('is_seasonal')}
            />
            <span>Seasonal</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register('is_available')}
            />
            <span>Is Available</span>
          </label>
        </div>
      </div>

      {/* Modal Actions */}
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
              Save Dish
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default DishForm;
