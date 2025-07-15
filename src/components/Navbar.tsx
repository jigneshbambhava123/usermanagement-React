import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserRoles, logout } from '../helpers/authHelpers';
import './navbar.css';

const DrawerNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const roles = getUserRoles();

  const isActive = (path: string) => location.pathname === path;

  const isAdmin = roles.includes('Admin');
  const isUser = roles.includes('User');

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <>
      <header className="drawer-header">
        <button className="hamburger" onClick={toggleDrawer} aria-label="Open navigation drawer">
          &#9776;
        </button>
        <span className="drawer-brand">User Management</span>
      </header>

      <nav className={`drawer ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="drawer-header-content">
          <div className="drawer-heading">User Management</div>
          <button className="close-btn" onClick={toggleDrawer} aria-label="Close navigation drawer">
            &times;
          </button>
        </div>

        {(isAdmin || isUser) && (
          <Link
            to="/users"
            className={isActive('/users') ? 'active' : ''}
            onClick={handleLinkClick}
          >
            Users
          </Link>
        )}

        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </nav>

      {isOpen && <div className="backdrop" onClick={toggleDrawer} aria-hidden="true"></div>}
    </>
  );
};

export default DrawerNavbar;
