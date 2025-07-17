import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserRoles } from '../helpers/authHelpers'; 
import { logout } from '../helpers/authHelpers';
import './Navbar.css'
import { CandidateIcon } from "../assets/assets"; 
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const Navbar: React.FC = () => {
  const location = useLocation();
  const roles = getUserRoles();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);


  const isActive = (path: string) => location.pathname === path;

  const isAdmin = roles.includes('Admin');
  const isUser = roles.includes('User');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

   const handleLogoutClick = () => {
    // Just open the dialog
    setIsLogoutDialogOpen(true);
    closeMenu();
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand  gap-2">
          <img src={CandidateIcon} alt="logo" className="w-15 h-15" />
          <span className="brand-text">User Management</span>
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            {(isAdmin || isUser) && (
              <Link 
                to="/users" 
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <i className="bi bi-people me-2"></i>
                User
              </Link>
            )}

            {isAdmin && (
              <Link 
                to="/resource" 
                className={`nav-link ${isActive('/resource') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <i className="bi bi-gear me-2"></i>
                Resource Management
              </Link>
            )}

            {(isAdmin || isUser) && (
              <Link 
                to="/myresource" 
                className={`nav-link ${isActive('/myresource') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <i className="bi bi-list-task me-2"></i>
                My Resources
              </Link>
            )}

          </div>

          <button
            className="logout-btn"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </div>
      </div>

      
    </nav>

    {/* Logout Confirmation Dialog */}
      <Dialog
        open={isLogoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;