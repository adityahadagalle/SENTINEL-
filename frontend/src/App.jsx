import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';

// Pages
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Graph from './pages/Graph';

// Shell & Navigation Components
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import SearchModal from './components/SearchModal';
import LiveAlertToast from './components/LiveAlertToast';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import { getRole } from './roleStore';

const App = () => {
  const { connectionStatus, cases, transactions } = useWebSocket();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const role = getRole();

  useEffect(() => {
    const handleToggleSearch = () => setIsSearchOpen((prev) => !prev);
    window.addEventListener('toggle_search_modal', handleToggleSearch);
    return () => window.removeEventListener('toggle_search_modal', handleToggleSearch);
  }, []);

  if (!role) {
    return <Login />;
  }

  const handleLogout = () => {
    localStorage.removeItem("sentinel_role");
    window.location.reload();
  };

  return (
    <Router>
      <div className="flex h-screen bg-[#080D18] text-foreground font-sans antialiased overflow-hidden">
        {/* Real-time Toast Notifications */}
        <LiveAlertToast />

        {/* Global Search Palette */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          cases={cases}
          transactions={transactions}
          role={role}
        />

        {/* Enterprise Security Operations Console Sidebar */}
        <Sidebar
          role={role}
          connectionStatus={connectionStatus}
          casesCount={cases.length}
          onLogout={handleLogout}
        />

        {/* Main Workstation Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#080D18]">
          {/* Top Utility Header */}
          <TopHeader
            connectionStatus={connectionStatus}
            role={role}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Core Page Routing */}
          <main className="flex-1 overflow-auto bg-[#080D18] relative">
            <Routes>
              <Route path="/" element={<Navigate to="/feed" replace />} />
              <Route path="/feed" element={<ErrorBoundary><Feed /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/cases" element={<ErrorBoundary><Cases /></ErrorBoundary>} />
              <Route path="/graph/:caseId" element={<ErrorBoundary><Graph /></ErrorBoundary>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
