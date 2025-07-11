import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>User Management</span>
      <Link to="/" className={isActive('/') ? 'active' : ''}>
        Home
      </Link>
      <Link to="/users" className={isActive('/users') ? 'active' : ''}>
        Users
      </Link>
      <Link to="/users/new" className={isActive('/users/new') ? 'active' : ''}>
        Add User
      </Link>
    </nav>
  );
};

export default Navbar;
