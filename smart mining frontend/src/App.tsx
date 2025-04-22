import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserManagement } from './components/UserManagement';
import { MineManagement } from './components/MineManagement';
import { SensorMonitoring } from './components/SensorMonitoring';
import { Reports } from './components/Reports';
import { Alerts } from './components/Alerts';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { LandingPage } from './components/LandingPage';
import { About } from './components/About';
import { Contact } from './components/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mines"
          element={
            <ProtectedRoute requiredPermissions={['view_all_mines']}>
              <MineManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermissions={['manage_users']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring"
          element={
            <ProtectedRoute requiredPermissions={['view_sensors']}>
              <SensorMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/predictive"
          element={
            <ProtectedRoute requiredPermissions={['view_sensors']}>
              <PredictiveAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute requiredPermissions={['view_alerts']}>
              <Alerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermissions={['view_reports']}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;