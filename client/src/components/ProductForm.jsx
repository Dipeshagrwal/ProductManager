import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { FiArrowLeft, FiPackage, FiEdit2, FiPlus, FiDollarSign, FiTag } from 'react-icons/fi';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getAll();
      const product = response.data.data.find(p => p._id === id);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category
        });
      }
    } catch (error) {
      setError('Failed to fetch product');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (isEditing) {
        await productAPI.update(id, productData);
      } else {
        await productAPI.create(productData);
      }

      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Back Button */}
        <Link to="/" className="back-btn">
          <FiArrowLeft />
          Back to Products
        </Link>

        <div className="card card-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="text-center mb-4">
            <div style={{
              width: '60px',
              height: '60px',
              background: isEditing ? 'var(--warning)' : 'var(--primary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              {isEditing ? (
                <FiEdit2 style={{ fontSize: '1.5rem', color: 'white' }} />
              ) : (
                <FiPlus style={{ fontSize: '1.5rem', color: 'white' }} />
              )}
            </div>
            
            <h1 style={{ 
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'var(--dark)',
              marginBottom: '0.5rem'
            }}>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p style={{ color: 'var(--gray-500)' }}>
              {isEditing 
                ? 'Update your product information' 
                : 'Add a new product to your inventory'
              }
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <FiPackage style={{ marginRight: '8px' }} />
                Product Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                placeholder="Describe your product..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiTag style={{ marginRight: '8px' }} />
                Category
              </label>
              <input
                type="text"
                name="category"
                className="form-control"
                placeholder="e.g., Electronics, Clothing, Books"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiDollarSign style={{ marginRight: '8px' }} />
                Price
              </label>
              <input
                type="number"
                name="price"
                className="form-control"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? (
                    <>
                      <FiEdit2 />
                      Update Product
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Add Product
                    </>
                  )
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => navigate('/')}
                style={{ flex: 0.5 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;