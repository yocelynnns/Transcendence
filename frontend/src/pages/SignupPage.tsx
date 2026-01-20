import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/authService";

// PROPS
interface SignupPageProps {
  setToken: (token: string | null) => void;
  setAvatarId?: (id: string | null) => void;
}

export default function SignupPage({ setToken, setAvatarId }: SignupPageProps) {
  // STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NAVIGATION
  const navigate = useNavigate();

  // HANDLE SIGNUP
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // VALIDATION
    if (!email || !password || !confirm) return setError("All fields are required!");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email format!");
    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) return setError("Password must be 6+ chars, include 1 uppercase letter and 1 number!");
    if (password !== confirm) return setError("Passwords do not match!");

    // API CALL
    try {
      setLoading(true);
      const data = await signup(email, password);

      localStorage.setItem("token", data.token);
      setToken(data.token);
      localStorage.removeItem("avatarId");
      setAvatarId?.(null);

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") setError("Request timed out. Please try again.");
      else if (err instanceof Error) setError(err.message);
      else setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // RENDER
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", background: "#b3e5fc", fontFamily: "monospace" }}>
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", background: "#fff", border: "4px solid #000", padding: 20, borderRadius: 8, width: 320, textAlign: "center" }}>
        <h1 style={{ fontSize: 32, marginBottom: 20 }}>Pokémon Signup</h1>

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 12, padding: 8, border: "2px solid #000", borderRadius: 4, outline: "none" }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 12, padding: 8, border: "2px solid #000", borderRadius: 4, outline: "none" }} />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 12, padding: 8, border: "2px solid #000", borderRadius: 4, outline: "none" }} />

        <button type="submit" disabled={loading} style={{ fontFamily: "monospace", fontSize: 16, padding: 10, background: loading ? "#ccc" : "#ffcc00", border: "2px solid #000", cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

        <div style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login" style={{ fontWeight: "bold", color: "#0077cc" }}>Login</Link>
        </div>
      </form>
    </div>
  );
}
