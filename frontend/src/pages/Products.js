import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ProductModal from '../components/ProductModal';

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery('products', () => api.get('/products'));
  const { data: categories = [] } = useQuery('categories', () => api.get('/categories'));

  const deleteMutation = useMutation(
    (productId) => api.delete(`/products/${productId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        toast.error(error.detail || 'Error deleting product');
      },
    }
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-description">
              Manage your product showcase portfolio
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className="card">
        {products.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}${product.images[0]}`}
                          alt={product.name}
                          className="image-preview"
                        />
                      ) : (
                        <div
                          className="image-preview"
                          style={{
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Eye size={16} color="#6b7280" />
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`badge ${
                        product.status === 'active' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        product.featured ? 'badge-success' : 'badge-secondary'
                      }`}>
                        {product.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(product.id)}
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
            <div className="empty-state-title">No products yet</div>
            <div className="empty-state-description">
              Create your first product to start building your portfolio
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}