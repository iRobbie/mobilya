import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function CategoryModal({ category, onClose }) {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: category || {
      name: '',
      slug: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    if (category) {
      setKeywords(category.keywords || []);
    }
  }, [category]);

  const saveMutation = useMutation(
    (data) => {
      if (category) {
        return api.put(`/categories/${category.id}`, data);
      } else {
        return api.post('/categories', data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        toast.success(category ? 'Category updated successfully' : 'Category created successfully');
        onClose();
      },
      onError: (error) => {
        toast.error(error.detail || 'Error saving category');
      },
    }
  );

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setKeywords(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const categoryData = {
      ...data,
      slug: data.slug || generateSlug(data.name),
      keywords: keywords
    };
    saveMutation.mutate(categoryData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-content">
            <div className="input-group">
              <label className="input-label">Category Name *</label>
              <input
                {...register('name', { required: 'Category name is required' })}
                className="input-field"
                placeholder="Enter category name"
                onChange={(e) => {
                  setValue('slug', generateSlug(e.target.value));
                }}
              />
              {errors.name && <div className="error">{errors.name.message}</div>}
            </div>

            <div className="input-group">
              <label className="input-label">Slug *</label>
              <input
                {...register('slug', { required: 'Slug is required' })}
                className="input-field"
                placeholder="category-slug"
              />
              {errors.slug && <div className="error">{errors.slug.message}</div>}
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Used in URLs. Will be auto-generated from name if left empty.
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                {...register('description')}
                className="input-field textarea-field"
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Keywords</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add a keyword"
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              
              {keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {keywords.map((keyword, index) => (
                    <div key={index} className="tag">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="tag-remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saveMutation.isLoading}
            >
              {saveMutation.isLoading ? 'Saving...' : (category ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}