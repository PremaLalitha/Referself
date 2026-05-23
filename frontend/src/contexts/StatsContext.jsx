import API_BASE from '../config/api.js';
import React, { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext();

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    users: 0,
    resources: 0,
    downloads: 0,
  });

  // Fetch stats from backend API
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      const data = await response.json();
      setStats({
        users: data.users || 0,
        resources: data.resources || 0,
        downloads: data.downloads || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats(); // Initial fetch

    // Poll every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StatsContext.Provider value={{ stats, fetchStats }}>
      {children}
    </StatsContext.Provider>
  );
};
