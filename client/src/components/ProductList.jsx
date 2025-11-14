import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/api';
import { 
  FiPackage, 
  FiSearch, 
  FiPlus, 
  FiLogOut, 
  FiEdit2, 
  FiTrash2,
  FiUser,
  FiDollarSign
} from 'react-icons/fi';
import { 
  HiOutlineCube, 
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineStar
} from 'react-icons/hi';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchTerm, products, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.data);
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    if (searchTerm.trim()) {
      filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productAPI.delete(id);
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalValue = products.reduce((sum, product) => sum + product.price, 0);
  const averagePrice = products.length > 0 ? totalValue / products.length : 0;
  const premiumProducts = products.filter(p => p.price > 100).length;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <Link to="/" className="brand">
              <HiOutlineCube className="brand-icon" />
              <span>ProductSuite</span>
            </Link>
            <div className="user-info">
              <span className="welcome-text">
                <FiUser style={{ marginRight: '8px' }} />
                Welcome, {user?.name}
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">
              <HiOutlineCube style={{ marginRight: '8px', color: 'var(--primary)' }} />
              {products.length}
            </div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <HiOutlineCurrencyDollar style={{ marginRight: '8px', color: 'var(--success)' }} />
              $ {totalValue.toFixed(2)}
            </div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <HiOutlineChartBar style={{ marginRight: '8px', color: 'var(--warning)' }} />
              $ {averagePrice.toFixed(2)}
            </div>
            <div className="stat-label">Average Price</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <HiOutlineStar style={{ marginRight: '8px', color: 'var(--secondary)' }} />
              {premiumProducts}
            </div>
            <div className="stat-label">Premium Items</div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="card">
          <div className="page-header">
            <h1 className="page-title">Product Inventory</h1>
            <Link to="/add-product" className="btn btn-primary">
              <FiPlus />
              Add Product
            </Link>
          </div>

          <div className="d-flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-container" style={{ flex: '1', minWidth: '300px' }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search products by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="form-control" 
              style={{ width: '200px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="card empty-state">
            <FiPackage className="empty-state-icon" />
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>
              {searchTerm ? 'No products found' : 'No products yet'}
            </h3>
            <p style={{ marginBottom: '2rem', color: 'var(--gray-500)' }}>
              {searchTerm 
                ? 'Try adjusting your search terms or clear the search' 
                : 'Start by adding your first product to the inventory'
              }
            </p>
            {!searchTerm && (
              <Link to="/add-product" className="btn btn-primary">
                <FiPlus />
                Add First Product
              </Link>
            )}
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="btn btn-outline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ 
              marginBottom: '1rem', 
              color: 'var(--gray-600)',
              fontSize: '0.9rem'
            }}>
              Showing {filteredProducts.length} of {products.length} products
              {searchTerm && ` for "${searchTerm}"`}
            </div>
            
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-header">
                    <div style={{ flex: 1 }}>
                      <h3 className="product-name">{product.name}</h3>
                      <span className="product-category">{product.category}</span>
                    </div>
                    <div className="product-price">
                      <FiDollarSign style={{ fontSize: '1rem' }} />
                      {product.price}
                    </div>
                  </div>
                  
                  <p className="product-description">{product.description}</p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--gray-200)'
                  }}>
                    <small style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                      Added: {new Date(product.createdAt).toLocaleDateString()}
                    </small>
                    
                    <div className="product-actions">
                      <Link 
                        to={`/edit-product/${product._id}`} 
                        className="btn btn-success btn-sm"
                      >
                        <FiEdit2 />
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="btn btn-error btn-sm"
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;