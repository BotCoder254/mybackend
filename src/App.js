import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageSelector } from './components/LanguageSelector';
import DashboardLayout from './components/DashboardLayout';
import { DatabasePage } from './pages/DatabasePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { SettingsPage } from './pages/SettingsPage';
import './i18n';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-primary">MyBackend</h1>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />
              <Route
                path="/database"
                element={
                  <DashboardLayout>
                    <DatabasePage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
