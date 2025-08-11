import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import CategoryModal from '../components/CategoryModal';

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery('categories', () => api.get('/categories'));

  const deleteMutation = useMutation(
    (categoryId) => api.delete(`/categories/${categoryId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        toast.success('Category deleted successfully');
      },
      onError: (error) => {
        toast.error(error.detail || 'Error deleting category');
      },
    }
  );

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(categoryId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-description">
              Organize your products with categories
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="card">
        {categories.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Keywords</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{category.name}</div>
                    </td>
                    <td>
                      <code style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {category.slug}
                      </code>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', fontSize: '14px', color: '#6b7280' }}>
                        {category.description ? 
                          category.description.substring(0, 80) + (category.description.length > 80 ? '...' : '') :
                          'No description'
                        }
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {category.keywords && category.keywords.length > 0 ? (
                          category.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="badge" style={{ 
                              backgroundColor: '#f3f4f6', 
                              color: '#374151',
                              fontSize: '11px'
                            }}>
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>No keywords</span>
                        )}
                        {category.keywords && category.keywords.length > 3 && (
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            +{category.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(category.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No categories yet</div>
            <div className="empty-state-description">
              Create categories to organize your products
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}