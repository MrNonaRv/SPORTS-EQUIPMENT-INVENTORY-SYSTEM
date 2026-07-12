/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import PublicDashboard from './components/PublicDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import AdminDashboard from './components/AdminDashboard';

const MainContainer: React.FC = () => {
  const { currentView } = useAppContext();

  switch (currentView) {
    case 'landing':
      return <LandingView />;
    case 'login_admin':
    case 'login_borrower':
    case 'signup':
      return <AuthView type={currentView} />;
    case 'public_dashboard':
      return <PublicDashboard />;
    case 'borrower_dashboard':
      return <BorrowerDashboard />;
    case 'admin_dashboard':
      return <AdminDashboard />;
    default:
      return <LandingView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <MainContainer />
    </AppProvider>
  );
}

