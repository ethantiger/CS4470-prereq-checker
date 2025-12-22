import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Sidebar.css';
import { IconDatabase, IconListCheck } from '@tabler/icons-react';

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-container">
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{!isCollapsed && 'CS4470'}</h2>
          <button
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            title="Prerequisites Checker"
          >
            <span className="nav-icon"><IconListCheck /></span>
            {!isCollapsed && <span className="nav-text">Prerequisites</span>}
          </Link>

          <Link
            to="/db"
            className={`nav-item ${isActive('/db') ? 'active' : ''}`}
            title="Database"
          >
            <span className="nav-icon"><IconDatabase /></span>
            {!isCollapsed && <span className="nav-text">Database</span>}
          </Link>
        </nav>
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
