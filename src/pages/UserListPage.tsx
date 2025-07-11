import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/userApi';
import type { User } from '../api/userApi';
import Navbar from '../components/Navbar';
import { toast } from "react-toastify";

const getRoleName = (roleId: number) => {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "User";
    default:
      return "Unknown";
  }
};

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const success = localStorage.getItem("login_success");
    if (success) {
      toast.success("Login successful!");
      localStorage.removeItem("login_success"); 
    }

    getUsers()
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (userId: number) => {
    alert(`Edit User ID: ${userId}`);
  };

  const handleDelete = (userId: number) => {
    alert(`Delete User ID: ${userId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
          <Navbar />

      <h2>User List</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>First Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Last Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Role</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Phone Number</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.firstname}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.lastname}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.email}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{getRoleName(user.roleId)}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.phoneNumber}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <button onClick={() => handleEdit(user.id)} style={{ marginRight: "8px" }}>Edit</button>
                <button onClick={() => handleDelete(user.id)} style={{ color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListPage;