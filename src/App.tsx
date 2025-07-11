import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserListPage from './pages/UserListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => (
  
  <Router>
     <ToastContainer position="top-right" autoClose={3000} />
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/Users" element={<UserListPage />} />
      <Route path="/Register" element={<RegisterPage />} />
    </Routes>
  </Router>
);

export default App;