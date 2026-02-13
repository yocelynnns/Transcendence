import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState,useEffect, useCallback } from 'react';
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
import AIPages from './pages/AiPages';
import EventPage from './pages/eventPage';
import RacePage from './pages/RacePage';
import SocketManager from "./SocketManager";
import { useQueryClient } from '@tanstack/react-query';


function App() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));

  const [avatarId, setAvatarId] = useState<string | null>(null); 
  const [battleId, setBattleId] = useState<string | null>(null); 
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null); 
  const [spectatingBattle, setSpectatingBattle] = useState<Battle | null>(null); 

  // handle log out
  function handleLogOut() {
    setToken(null);
    setAvatarId(null);
    setBattleId(null);
    setCurrentBattle(null);
    setSpectatingBattle(null);
  }
  // --- stable refetchUser ---
  const refetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const user = await getUserInfo(token);
      const newAvatarId = user.avatar?._id ?? null;
      const newBattleId = user.avatar?.currentBattle?.toString() ?? null;
      
      setAvatarId(newAvatarId);
      setBattleId(newBattleId);
      
      // CRITICAL: If server says no current battle, ALWAYS clear frontend state
      if (!newBattleId && currentBattle) {
        console.log('Server reports no battle, clearing frontend currentBattle');
        setCurrentBattle(null);
      }
    } catch (err) {
      setToken(null);
      console.log("Failed to fetch user info:", err);
    }
  }, [token, currentBattle]);

  // --- stable refetchBattle ---
  const refetchBattle = useCallback(
    async (avatarIdParam?: string, battleIdParam?: string) => {
      const _avatarId = avatarId ?? avatarIdParam;
      const _battleId = battleId ?? battleIdParam;
      if (!_avatarId || !_battleId) return;

      try {
        const res = await fetch(`https://localhost/api/battle/${_battleId}`);
        if (!res.ok) throw new Error("Failed to fetch battle");

        const battleData: Battle = await res.json();

        if (battleData.endedAt) {
          setCurrentBattle(null);
          setBattleId(null);
          return battleData;
        }

        setCurrentBattle(battleData);
        return battleData;
      } catch (err) {
        console.log("Failed to fetch battle:", err);
        setCurrentBattle(null);
        setBattleId(null);
      }
    },
    [avatarId, battleId]
  );

  const queryClient = useQueryClient();
      
  const battleLatest = useCallback(
    async (avatarIdParam?: string, battleIdParam?: string) => {
      const _avatarId = avatarIdParam ?? avatarId;
      if (!_avatarId) return;

      await queryClient.invalidateQueries({
        queryKey: ["avatar", _avatarId],
        exact: true,
      });

      await refetchBattle(avatarIdParam, battleIdParam);
    },
    [avatarId, queryClient, refetchBattle]
  );


  useEffect(() => {
    if (!token) return;
    refetchUser();
  }, [token, refetchUser]);

  useEffect(() => {
    if (!battleId && currentBattle) {
      console.log('battleId is null, clearing currentBattle');
      setCurrentBattle(null);
    }
  }, [battleId, currentBattle]);

  useEffect(() => {
    refetchBattle(avatarId ?? undefined,battleId ?? undefined);
  }, [battleId, avatarId, refetchBattle]);

  const { avatarData } = useAvatar(avatarId);
  
  return (
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      {token && avatarId && <SocketManager avatarId={avatarId} />}

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
                refetchBattle={refetchBattle}
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
        path="/race"
        element={
            token && avatarData ? (
                <RacePage avatarData={avatarData} />
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
                ? <HomePage avatarData={avatarData ?? null} token={token} setSpectatingBattle={setSpectatingBattle} setCurrentBattle={setCurrentBattle} handleLogOut={handleLogOut} battleLatest={battleLatest} setBattleId={setBattleId}  currentBattle={currentBattle}/>
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
