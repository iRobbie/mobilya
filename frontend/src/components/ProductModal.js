import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ProductModal({ product, categories, onClose }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      category: '',
      images: [],
      features: [],
      featured: false,
      status: 'active'
    }
  });

  useEffect(() => {
    if (product) {
      setSelectedImages(product.images || []);
      setFeatures(product.features || []);
    }
  }, [product]);

  const saveMutation = useMutation(
    (data) => {
      if (product) {
        return api.put(`/products/${product.id}`, data);
      } else {
        return api.post('/products', data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        onClose();
      },
      onError: (error) => {
        toast.error(error.detail || 'Error saving product');
      },
    }
  );

  const uploadMutation = useMutation(
    (formData) => api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: (data) => {
        setSelectedImages(prev => [...prev, data.url]);
        toast.success('Image uploaded successfully');
      },
      onError: (error) => {
        toast.error(error.detail || 'Error uploading image');
      },
    }
  );

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      uploadMutation.mutate(formData);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const productData = {
      ...data,
      images: selectedImages,
      features: features
    };
    saveMutation.mutate(productData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {product ? 'Edit Product' : 'Add New Product'}
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
              <label className="input-label">Product Name *</label>
              <input
                {...register('name', { required: 'Product name is required' })}
                className="input-field"
                placeholder="Enter product name"
              />
              {errors.name && <div className="error">{errors.name.message}</div>}
            </div>

            <div className="input-group">
              <label className="input-label">Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="input-field textarea-field"
                placeholder="Enter product description"
                rows={4}
              />
              {errors.description && <div className="error">{errors.description.message}</div>}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="error">{errors.category.message}</div>}
              </div>

              <div className="input-group">
                <label className="input-label">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                <input
                  type="checkbox"
                  {...register('featured')}
                  style={{ marginRight: '8px' }}
                />
                Featured Product
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">Images</label>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="btn btn-secondary">
                  <Upload size={16} />
                  Upload Images
                </label>
              </div>
              
              {selectedImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                  {selectedImages.map((image, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${image}`}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Features</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              
              {features.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {features.map((feature, index) => (
                    <div key={index} className="tag">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
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
              {saveMutation.isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}