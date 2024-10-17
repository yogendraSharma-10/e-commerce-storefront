import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'; // Basic styling for the app

// --- Contexts for Global State Management ---
// A real app would likely have these in separate files (e.g., contexts/AuthContext.js)
export const AuthContext = createContext(null);
export const CartContext = createContext(null);

// --- Dummy API Service (replace with actual API calls) ---
const api = {
  getProducts: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'prod1', name: 'Wireless Headphones', price: 99.99, imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Headphones', description: 'Experience immersive sound with these noise-cancelling wireless headphones. Perfect for music lovers and professionals alike. *AI-summarized for brevity.*' },
      { id: 'prod2', name: 'Smartwatch X', price: 199.99, imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Smartwatch', description: 'Track your fitness, receive notifications, and stay connected with the new Smartwatch X. Featuring a vibrant display and long-lasting battery.' },
      { id: 'prod3', name: 'Ergonomic Office Chair', price: 249.99, imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Chair', description: 'Boost your productivity and comfort with our premium ergonomic office chair. Designed for long hours of work.' },
      { id: 'prod4', name: '4K UHD Monitor', price: 349.99, imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?text=Monitor', description: 'Immerse yourself in stunning visuals with this 27-inch 4K UHD monitor. Perfect for gaming, design, and everyday use.' },
    ];
  },
  getProductById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const products = await api.getProducts();
    return products.find(p => p.id === id);
  },
  login: async (username, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (username === 'user' && password === 'password') {
      return { token: 'mock-jwt-token', user: { id: 'user1', username: 'user', email: 'user@example.com', role: 'customer' } };
    }
    if (username === 'admin' && password === 'admin') {
      return { token: 'mock-admin-jwt', user: { id: 'admin1', username: 'admin', email: 'admin@example.com', role: 'admin' } };
    }
    throw new Error('Invalid credentials');
  },
  register: async (username, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate successful registration
    return { message: 'Registration successful. Please log in.' };
  },
  // Admin specific APIs
  getInventory: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'prod1', name: 'Wireless Headphones', stock: 50 },
      { id: 'prod2', name: 'Smartwatch X', stock: 30 },
      { id: 'prod3', name: 'Ergonomic Office Chair', stock: 15 },
      { id: 'prod4', name: '4K UHD Monitor', stock: 25 },
    ];
  },
  updateInventory: async (productId, newStock) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Updating inventory for ${productId} to ${newStock}`);
    return { message: 'Inventory updated successfully', productId, newStock };
  }
};

// --- Components ---

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="logo">E-Commerce Storefront</Link>
        <nav>
          <ul>
            <li><Link to="/">Products</Link></li>
            <li><Link to="/cart">Cart ({totalCartItems})</Link></li>
            {user ? (
              <>
                <li><Link to="/profile">Welcome, {user.username}!</Link></li>
                {user.role === 'admin' && <li><Link to="/admin">Admin Panel</Link></li>}
                <li><button onClick={logout} className="link-button">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
            {/* Cross-project context: Link to the Blog Platform */}
            <li><a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">Blog</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="app-footer">
    <div className="container">
      <p>&copy; {new Date().getFullYear()} E-Commerce Storefront. All rights reserved.</p>
      <p>Powered by React, Node.js, and Python services.</p>
      {/* Cross-project context: Mention other services */}
      <p>Integrated with AI-Powered Content Summarizer, Collaborative Code Editor, and Recipe & Meal Planner for enhanced functionality.</p>
    </div>
  </footer>
);

const ProductList = ({ products, addToCart }) => (
  <div className="product-list container">
    <h2>Our Products</h2>
    <div className="products-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <Link to={`/product/${product.id}`}>
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </Link>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  </div>
);

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container">Loading product...</div>;
  if (error) return <div className="container error-message">{error}</div>;
  if (!product) return <div className="container">Product not found.</div>;

  return (
    <div className="product-detail container">
      <div className="product-detail-content">
        <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <p className="price">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          {/* Cross-project context: Mention AI Summarizer */}
          <small>Product description enhanced by AI-Powered Content Summarizer.</small>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
          <Link to="/" className="back-link">Back to Products</Link>
        </div>
      </div>
    </div>
  );
};

const Cart = ({ cartItems, updateCartItemQuantity, removeCartItem, checkout }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();

  const handleCheckout = () => {
    checkout();
    navigate('/checkout-success');
  };

  return (
    <div className="cart container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/">Start Shopping!</Link></p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.imageUrl} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>${item.price.toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>+</button>
                    <button onClick={() => removeCartItem(item.id)} className="remove-button">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={handleCheckout} className="checkout-button">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

const CheckoutSuccess = () => (
  <div className="container checkout-success">
    <h2>Order Placed Successfully!</h2>
    <p>Thank you for your purchase. Your order will be processed shortly.</p>
    <Link to="/">Continue Shopping</Link>
  </div>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/profile'); // Redirect to profile or home after login
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-form container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
      <p>Use 'user'/'password' for customer, or 'admin'/'admin' for admin access.</p>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.register(username, email, password);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-form container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-username">Username:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">Email:</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="container">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile container">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role