import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import BattlePage from "./pages/BattlePage/BattlePage";
import BattleDummy from "./pages/BattlePage/BattleData";
import PokemonList from "./pages/PokemonList"
import Matching from "./pages/Matching"
import { useAvatar } from "./hooks/useAvatar";
import PreBattle from './pages/PreBattlePage';
import TeamSelectPage from "./pages/teamSelect/teamSelectPage";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [avatarId, setAvatarId] = useState<string | null>(() => localStorage.getItem('avatarId'));
  const { avatarData, updateAvatar, isLoading } = useAvatar();

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <LoginPage setToken={setToken} setAvatarId={setAvatarId} />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/" /> : <SignupPage setToken={setToken} setAvatarId={setAvatarId} />}
        />

        {/* PROFILE CREATION (ONLY IF LOGGED IN AND AVATAR NOT SET) */}
        <Route
          path="/profile"
          element={
            token
              ? !avatarId
                ? <ProfilePage setAvatarId={setAvatarId} />
                : <Navigate to="/" />
              : <Navigate to="/login" />
          }
        />

         <Route
          path="/battle/:battleId"
          element={<BattlePage />}
        />

        <Route
          path="/pokemonList"
          element={<PokemonList />}
        />

        <Route
          path="/battleData"
          element={<BattleDummy />}
        />

        <Route
          path="/Matching"
          element={<Matching avatarData={avatarData ?? null} />}
        />

        <Route
          path="/teamSelect/:battleId"
          element={<TeamSelectPage avatarData={avatarData ?? null} />}
        />
{/* 
        <Route
          path="/prebattle/:battleId"
          element={<PreBattle avatarData={avatarData ?? null} />}
        /> */}

        {/* HOME PAGE (REQUIRES LOGIN AND AVATAR) */}
        <Route
          path="/"
          element={
            token
              ? avatarId
                ? <HomePage setToken={setToken} setAvatarId={setAvatarId} />
                : <Navigate to="/profile" />
              : <Navigate to="/login" />
          }
        />

        {/* FALLBACK FOR UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
