import React, { useState, useEffect } from 'react';
import CandidateApp from './components/candidate/CandidateApp';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('alboriss_admin_auth') === 'true'
  );

  useEffect(() => {
    const handleLocationChange = () => {
      // Check path or hash
      const hash = window.location.hash.replace('#', '');
      const path = hash || window.location.pathname;
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('alboriss_admin_auth');
    setIsAdminAuthenticated(false);
  };

  // Check if route matches admin
  const isAdminRoute = currentPath.startsWith('/admin');

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Candidate interface (default for /typing-test and root /)
  return <CandidateApp />;
}
