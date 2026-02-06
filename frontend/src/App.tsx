import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import BattlePage from "./pages/BattlePage";
import MatchingPage from "./pages/MatchingPage"
import TeamSelectPage from "./pages/teamSelectPage";
import { useAvatar } from "./hooks/useAvatar";
import {getUserInfo} from "./services/authService"
import { Battle } from './types/battleTypes';
import SpectatorPage from './pages/SpectatorPage';
import axios from 'axios';
import AIPages from './pages/AiPages';
import EventPage from './pages/eventPage';
function App() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));

  const [avatarId, setAvatarId] = useState<string | null>(null); 
  const [battleId, setBattleId] = useState<string | null>(null); 
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null); 
  const [spectatingBattle, setSpectatingBattle] = useState<Battle | null>(null); 

  useEffect(() => {
    if (!token) return;
    if (currentBattle) return ;

    async function fetchUser() {
      try {
        const user = await getUserInfo(token as string);
        setAvatarId(user.avatar?._id ?? null);
        setBattleId(user.avatar?.currentBattle?.toString() ?? null);
      } catch (err) {
        setToken(null); 
        console.error("Failed to fetch user info:", err);
      }
    }

    fetchUser();
  }, [token, currentBattle]);

  useEffect(() => {
    if (!battleId || !avatarId) return;

    async function fetchBattle() {
      try {
        const res = await fetch(`http://localhost:5001/api/battle/${battleId}`);
        if (!res.ok) throw new Error("Failed to fetch battle");

        const battleData: Battle = await res.json();

        if (battleData.endedAt) {
          setCurrentBattle(null);
          setBattleId(null);

          try {
            const token = localStorage.getItem("token");
            if (token) {
              await axios.put(
                `http://localhost:5001/api/avatar/${avatarId}`,
                { currentBattle: null },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          } catch (err) {
            console.error("Failed to clear avatar currentBattle:", err);
          }

          return;
        }

        setCurrentBattle(battleData);
      } catch (err) {
        console.error("Failed to fetch battle:", err);
        setCurrentBattle(null);
        setBattleId(null);
      }
    }

    fetchBattle();
  }, [battleId, avatarId]);

  const { avatarData } = useAvatar(avatarId);

  console.log("RENDER: APP");
  
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <LoginPage setToken={setToken} setAvatarId={setAvatarId} />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/" /> : <SignupPage setToken={setToken} setAvatarId={setAvatarId} />}
        />

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
          path="/Matching"
          element={
            avatarData ? (
              <MatchingPage
                avatarData={avatarData}
                currentBattle={currentBattle}
                setCurrentBattle={setCurrentBattle}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/teamSelect/:battleId"
          element={
            avatarData ? (
              <TeamSelectPage
                avatarData={avatarData}
                currentBattle={currentBattle}
                setCurrentBattle={setCurrentBattle}
              />
            ) : (
              <Navigate to="/profile" />
            )
          }
        />

         <Route
          path="/battle/:battleId"
          element={
            avatarData ? (
              <BattlePage
                setCurrentBattle={setCurrentBattle}
                avatarData={avatarData}
                currentBattle={currentBattle}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/spectating/:battleId"
          element={
            avatarData && spectatingBattle ? (
              <SpectatorPage
                spectatingBattle={spectatingBattle}
                setSpectatingBattle={setSpectatingBattle}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/"
          element={
            token
              ? avatarId
                ? <HomePage setToken={setToken} avatarData={avatarData ?? null} token={token} setSpectatingBattle={setSpectatingBattle}/>
                : <Navigate to="/profile" />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/event"
          element={
            token && avatarData? 
                <EventPage avatarData={avatarData ?? null}/>
            : <Navigate to="/profile" />
          }
        />

        <Route
          path="/aiBattle"
          element={
            token && avatarData?
              <AIPages/>
              : <Navigate to="/profile" />
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
