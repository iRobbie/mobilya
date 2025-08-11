import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  FileText, 
  Image,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Blog Posts', href: '/blogs', icon: FileText },
  { name: 'Images', href: '/images', icon: Image },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Furns Admin</h1>
        <p className="sidebar-subtitle">Portfolio Management</p>
      </div>
      
      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}