import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { REDIRECT_MAP } from './routesMap';

export default function Protectedroute({ allowedRoles }) {
  const { accessToken, typeCompte } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(typeCompte)) {
    return <Navigate to={REDIRECT_MAP[typeCompte] || '/login'} replace />;
  }

  return <Outlet />;
}