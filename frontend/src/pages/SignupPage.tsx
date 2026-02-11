// IMPORTS
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, getUserInfo } from "../services/authService";
import PixelButton from "../components/elements/pixelButton";

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

  const navigate = useNavigate();

  // HANDLE SIGNUP
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirm)
      return setError("All fields are required!");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Invalid email format!");

    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password))
      return setError(
        "Password must be 6+ chars, include 1 uppercase letter and 1 number!"
      );

    if (password !== confirm)
      return setError("Passwords do not match!");

    try {
      setLoading(true);

      const data = await signup(email, password);

      sessionStorage.setItem("token", data.token);
      setToken(data.token);

      const userData = await getUserInfo(data.token);

      if (userData._id) {
        sessionStorage.setItem("userId", userData._id);
      }

      setAvatarId?.(null);
      navigate("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-blue-200 font-mono">
      <div className="relative w-100">
        {/* PIXEL PANEL BACKGROUND */}
        <PixelButton
          colorA="#677fb4"
          colorB="#384071"
          colorText="#384071"
          textSize="1rem"
          height={480}
          width="100%"
          cursorPointer={false}
        />

        {/* FORM CONTENT */}
        <form
          onSubmit={handleSignup}
          className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-10 text-center"
        >
          {/* HEADER */}
          <h1 className="text-3xl mb-5 pixelify-sans text-white">
            Pokemon Signup
          </h1>

          {/* EMAIL */}
          <div className="relative mb-3 w-full">
            <PixelButton
              colorA="#a5b6dd"
              colorB="#384071"
              colorText="#384071"
              height={50}
              width="100%"
              cursorPointer={false}
              textSize="10px"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`absolute top-0 left-0 w-full h-full px-3 bg-transparent outline-none font-mono
              ${email ? "text-white" : "text-[#384071]"}`}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative mb-3 w-full">
            <PixelButton
              colorA="#a5b6dd"
              colorB="#384071"
              colorText="#384071"
              height={50}
              width="100%"
              cursorPointer={false}
              textSize="10px"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`absolute top-0 left-0 w-full h-full px-3 bg-transparent outline-none font-mono
              ${password ? "text-white" : "text-[#384071]"}`}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative mb-3 w-full">
            <PixelButton
              colorA="#a5b6dd"
              colorB="#384071"
              colorText="#384071"
              height={50}
              width="100%"
              cursorPointer={false}
              textSize="10px"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`absolute top-0 left-0 w-full h-full px-3 bg-transparent outline-none font-mono
              ${confirm ? "text-white" : "text-[#384071]"}`}
            />
          </div>

          {/* SIGNUP BUTTON */}
          <div className="mt-2 w-full">
            <PixelButton
              colorA={loading ? "#ccc" : "#ffcc00"}
              colorB={loading ? "#aaa" : "#d4a500"}
              colorText="#000"
              height={50}
              width="100%"
              textSize="10px"
              cursorPointer={!loading}
              onClick={() =>
                document.querySelector("form")?.requestSubmit()
              }
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </PixelButton>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-3 text-[#ff8ea8] text-sm">{error}</div>
          )}

          {/* LOGIN LINK */}
          <div className="mt-6 text-sm text-white">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#ffcc00]">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
