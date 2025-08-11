import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Blogs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const queryClient = useQueryClient();

  const { data: blogs = [], isLoading } = useQuery('blogs', () => api.get('/blogs'));

  const deleteMutation = useMutation(
    (blogId) => api.delete(`/blogs/${blogId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('blogs');
        toast.success('Blog post deleted successfully');
      },
      onError: (error) => {
        toast.error(error.detail || 'Error deleting blog post');
      },
    }
  );

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleDelete = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteMutation.mutate(blogId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  if (isLoading) {
    return <div className="loading">Loading blog posts...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Blog Posts</h1>
            <p className="page-description">
              Manage your blog content and articles
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add Blog Post
          </button>
        </div>
      </div>

      <div className="card">
        {blogs.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      {blog.featured_image ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}${blog.featured_image}`}
                          alt={blog.title}
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
                        <div style={{ fontWeight: '500', marginBottom: '2px' }}>{blog.title}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {blog.excerpt || blog.content.substring(0, 60) + '...'}
                        </div>
                      </div>
                    </td>
                    <td>{blog.category || 'Uncategorized'}</td>
                    <td>
                      <span className={`badge ${
                        blog.status === 'published' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(blog)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(blog.id)}
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
            <div className="empty-state-title">No blog posts yet</div>
            <div className="empty-state-description">
              Create your first blog post to start sharing content
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              Add Blog Post
            </button>
          </div>
        )}
      </div>

      {/* Blog Modal would go here - simplified for now */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
              </h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Blog post management coming soon!</p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                This feature will be implemented in the next phase.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}