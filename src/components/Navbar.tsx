import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserRoles } from '../helpers/authHelpers'; 
import { logout } from '../helpers/authHelpers';
import './Navbar.css'
import { HeroImg } from "../assets/assets"; 
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';

const Navbar: React.FC = () => {
  const location = useLocation();
  const roles = getUserRoles();
  const navigate = useNavigate();

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
    logout(navigate); 
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
          <img src={HeroImg} alt="logo" className="w-15 h-15 me-2 mt-1 mb-3" />
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
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <i className="bi bi-grid-fill me-2"></i>
                Dashboard
              </Link>
            )}

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
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}>
        <DialogTitle id="logout-dialog-title"
          className="text-xl font-bold text-center text-white"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #2575ee 100%)',
            py: 2,
            px: 3,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}>Confirm Logout</DialogTitle>
        <DialogContent sx={{ pt: 5 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography
              id="confirm-dialog-description"
              sx={{pt:5, pb: 5, fontSize: '1rem', color: '#333', textAlign: 'center' }}
            >
              Are you sure you want to logout?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;