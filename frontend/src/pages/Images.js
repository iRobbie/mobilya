import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Images() {
  const [copiedUrl, setCopiedUrl] = useState(null);
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery('images', () => api.get('/images'));

  const uploadMutation = useMutation(
    (formData) => api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
        toast.success('Images uploaded successfully');
      },
      onError: (error) => {
        toast.error(error.detail || 'Error uploading images');
      },
    }
  );

  const deleteMutation = useMutation(
    (imageId) => api.delete(`/images/${imageId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
        toast.success('Image deleted successfully');
      },
      onError: (error) => {
        toast.error(error.detail || 'Error deleting image');
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

  const copyUrl = (url) => {
    const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(imageId);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading images...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Images</h1>
            <p className="page-description">
              Manage your image gallery and uploads
            </p>
          </div>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="bulk-image-upload"
            />
            <label htmlFor="bulk-image-upload" className="btn btn-primary">
              <Upload size={16} />
              Upload Images
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        {images.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '20px',
            padding: '20px'
          }}>
            {images.map((image) => (
              <div key={image.id} style={{ 
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${image.url}`}
                    alt={image.original_name}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deleteMutation.isLoading}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div style={{ padding: '12px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {image.original_name}
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginBottom: '8px'
                  }}>
                    {new Date(image.uploaded_at).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={() => copyUrl(image.url)}
                    className="btn btn-sm btn-secondary"
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    {copiedUrl === image.url ? (
                      <>
                        <Check size={12} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No images uploaded yet</div>
            <div className="empty-state-description">
              Upload your first images to get started
            </div>
            <label htmlFor="bulk-image-upload" className="btn btn-primary">
              <Upload size={16} />
              Upload Images
            </label>
          </div>
        )}
      </div>
    </div>
  );
}