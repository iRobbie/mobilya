import React from 'react';
import { useQuery } from 'react-query';
import { Package, FolderOpen, FileText, Image } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const { data: products = [] } = useQuery('products', () => api.get('/products'));
  const { data: categories = [] } = useQuery('categories', () => api.get('/categories'));
  const { data: blogs = [] } = useQuery('blogs', () => api.get('/blogs'));
  const { data: images = [] } = useQuery('images', () => api.get('/images'));

  const stats = [
    {
      name: 'Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Categories',
      value: categories.length,
      icon: FolderOpen,
      color: 'bg-green-500',
    },
    {
      name: 'Blog Posts',
      value: blogs.length,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      name: 'Images',
      value: images.length,
      icon: Image,
      color: 'bg-orange-500',
    },
  ];

  const recentProducts = products.slice(0, 5);
  const recentBlogs = blogs.slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome to your Furns portfolio management dashboard
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.name}</div>
                </div>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px',
                  backgroundColor: stat.color === 'bg-blue-500' ? '#3b82f6' : 
                                  stat.color === 'bg-green-500' ? '#10b981' :
                                  stat.color === 'bg-purple-500' ? '#8b5cf6' : '#f59e0b',
                  color: 'white'
                }}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Products</h2>
          </div>
          <div className="card-content">
            {recentProducts.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>
                          <span className={`badge ${
                            product.status === 'active' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td>{new Date(product.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Package className="empty-state-icon" />
                <div className="empty-state-title">No products yet</div>
                <div className="empty-state-description">
                  Create your first product to get started
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Blog Posts</h2>
          </div>
          <div className="card-content">
            {recentBlogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentBlogs.map((blog) => (
                  <div key={blog.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      {blog.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {blog.excerpt || blog.content.substring(0, 100) + '...'}
                    </p>
                    <span className={`badge ${
                      blog.status === 'published' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {blog.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FileText className="empty-state-icon" />
                <div className="empty-state-title">No blog posts yet</div>
                <div className="empty-state-description">
                  Create your first blog post
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}