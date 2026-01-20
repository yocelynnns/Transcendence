//IMPORTS
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, getUserInfo } from "../services/authService";

//TYPES / PROPS
interface LoginPageProps {
  setToken: (token: string | null) => void;
  setAvatarId?: (id: string | null) => void;
}

//MAIN COMPONENT
export default function LoginPage({ setToken, setAvatarId }: LoginPageProps) {
  //STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //NAVIGATION
  const navigate = useNavigate();

  //HANDLE LOGIN
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    //VALIDATION
    if (!email || !password) return setError("Email and password are required!");

    try {
      setLoading(true);

      //LOGIN API
      const data = await loginApi(email, password);

      //SAVE TOKEN
      localStorage.setItem("token", data.token);
      setToken(data.token);

      //GET USER INFO
      const userData = await getUserInfo(data.token);

      //CHECK AVATAR
      if (userData.avatarId) {
        localStorage.setItem("avatarId", userData.avatarId);
        setAvatarId?.(userData.avatarId);

        //HOME PAGE
        navigate("/");
      } else {
        localStorage.removeItem("avatarId");
        setAvatarId?.(null);

        //PROFILE CREATION
        navigate("/profile");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //RENDER
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", background: "#b3e5fc", fontFamily: "monospace" }}>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", background: "#fff", border: "4px solid #000", padding: 20, borderRadius: 8, width: 300, textAlign: "center" }}>
        {/*HEADER*/}
        <h1 style={{ fontSize: 32, marginBottom: 20 }}>Pokémon Login</h1>

        {/*EMAIL INPUT*/}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 12, padding: 8, border: "2px solid #000", borderRadius: 4, outline: "none" }}
        />

        {/*PASSWORD INPUT*/}
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 12, padding: 8, border: "2px solid #000", borderRadius: 4, outline: "none" }}
        />

        {/*SUBMIT BUTTON*/}
        <button type="submit" disabled={loading}
          style={{ fontFamily: "monospace", fontSize: 16, padding: 10, background: loading ? "#ccc" : "#ffcc00", border: "2px solid #000", cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/*ERROR MESSAGE*/}
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

        {/*SIGNUP LINK*/}
        <div style={{ marginTop: 12 }}>
          No account?{" "}
          <Link to="/signup" style={{ fontWeight: "bold", color: "#0077cc" }}>
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
