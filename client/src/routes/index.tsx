import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardHome from '../pages/DashboardHome';
import TaskSystem from '../pages/TaskSystem';
import Social from '../pages/Social';
import Progress from '../pages/Progress';
import Calendar from '../pages/Calendar';
import Dashboard from '../pages/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
      <Route path="/manage" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TaskSystem /></ProtectedRoute>} />
      <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 