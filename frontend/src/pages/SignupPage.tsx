import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, getUserInfo } from "../services/authService";
import PixelButton from "../components/elements/PixelButton";
import TermsOfServicePage from "./TermsOfServicePage";
import PrivacyPolicyPage from "./PrivacyPolicypage";

interface SignupPageProps {
  setToken: (token: string | null) => void;
  setAvatarId?: (id: string | null) => void;
}

// DESIGN SIZE (like profile screenshot)
const designWidth = 450;
const designHeight = 480;
const padding = 32;
const maxScale = 1;
const minScale = 0.5;

export default function SignupPage({ setToken, setAvatarId }: SignupPageProps) {
  const navigate = useNavigate();

  // STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [showTOS, setShowTOS] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // SCALE WRAPPER ONLY
  useEffect(() => {
    const handleResize = () => {
      const scaleX = (window.innerWidth - padding * 2) / designWidth;
      const scaleY = (window.innerHeight - padding * 2) / designHeight;
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, Math.min(scaleX, scaleY))
      );
      setScale(newScale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // SIGNUP
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirm) return setError("All fields are required!");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email format!");
    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password))
      return setError("Password must be 6+ chars, include 1 uppercase letter and 1 number!");
    if (password !== confirm) return setError("Passwords do not match!");

    try {
      setLoading(true);
      const data = await signup(email, password);
      sessionStorage.setItem("token", data.token);
      setToken(data.token);

      const userData = await getUserInfo(data.token);
      if (userData._id) sessionStorage.setItem("userId", userData._id);

      setAvatarId?.(null);
      navigate("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-200">
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative w-full"
      >
        {/* PIXEL BACKGROUND */}
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
          <h1 className="text-3xl mb-8 pixelify-sans text-white">
            Pokemon Signup
          </h1>

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

          <div className="mt-2 w-full">
            <PixelButton
              colorA={loading ? "#ccc" : "#ffcc00"}
              colorB={loading ? "#aaa" : "#d4a500"}
              colorText="#000"
              height={50}
              width="100%"
              textSize="1rem"
              cursorPointer={!loading}
              onClick={() => document.querySelector("form")?.requestSubmit()}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </PixelButton>
          </div>

          {error && <div className="mt-3 text-[#ff8ea8] text-sm">{error}</div>}

          <div className="mt-6 text-sm text-white">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#ffcc00]">
              Login
            </Link>
            <div className="flex gap-4 justify-center mt-2">
              <button
                onClick={() => setShowTOS(true)}
                className="text-[0.8rem] text-blue-200 underline hover:text-blue-700"
              >
                Terms of Service
              </button>

              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-[0.8rem] text-blue-200 underline hover:text-blue-700"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </form>
      </div>
              {showTOS && (
                  <div className="fixed inset-0 z-60 bg-white overflow-auto">
                  <TermsOfServicePage />
                  <button
                  onClick={() => setShowTOS(false)}
                  className="absolute top-6 right-6 text-2xl font-bold p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                  >
                  ×
                  </button>
                  </div>
              )}
      
              {showPrivacyPolicy && (
                  <div className="fixed inset-0 z-60 bg-white overflow-auto">
                  <PrivacyPolicyPage />
                  <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="absolute top-6 right-6 text-2xl font-bold p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                  >
                  ×
                  </button>
                  </div>
              )}
    </div>
  );
}
