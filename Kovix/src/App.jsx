import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProfilePage from './pages/ProfilePage';
import AllMoviesPage from './pages/AllMoviesPage';
import './style/App.css';
import MyListsPage from './pages/MyListsPage';
import UserPublicProfilePage from './pages/UserPublicProfilePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { FriendsProvider } from './contexts/FriendsContext';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminReportsPage from './pages/AdminReportsPage';
import BlockedRoute from './components/BlockedRoute';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <FriendsProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/movies" element={<AllMoviesPage />} />
            <Route path="/my-lists" element={<MyListsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/chat" element={
                <BlockedRoute>
                    <ChatPage />
                </BlockedRoute>
            } />
            <Route path="/users/:id" element={
                <BlockedRoute>
                    <UserPublicProfilePage />
                </BlockedRoute>
            } />
            <Route path="/history" element={
                <BlockedRoute>
                    <HistoryPage />
                </BlockedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
      </FriendsProvider> 
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;