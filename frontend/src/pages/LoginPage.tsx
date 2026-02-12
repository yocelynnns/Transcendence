import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, getUserInfo } from "../services/authService";
import PixelButton from "../components/elements/PixelButton";

interface LoginPageProps {
  setToken: (token: string | null) => void;
  setAvatarId?: (id: string | null) => void;
}

// DESIGN SIZE (like profile & signup)
const designWidth = 450;
const designHeight = 400;
const padding = 32;
const maxScale = 1;
const minScale = 0.5;

export default function LoginPage({ setToken, setAvatarId }: LoginPageProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);

  // SCALE OUTER WRAPPER
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Email and password are required!");

    try {
      setLoading(true);

      const data = await loginApi(email, password);
      sessionStorage.setItem("token", data.token);
      setToken(data.token);

      const userData = await getUserInfo(data.token);
      if (userData._id) sessionStorage.setItem("userId", userData._id);

      if (userData.avatar?._id) {
        setAvatarId?.(userData.avatar._id);
        navigate("/");
      } else {
        setAvatarId?.(null);
        navigate("/profile");
      }
    } catch (err: unknown) {
      console.log(err);
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
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
          height={400}
          width="100%"
          cursorPointer={false}
        />

        {/* FORM CONTENT */}
        <form
          onSubmit={handleLogin}
          className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-10 text-center"
        >
          <h1 className="text-3xl mb-8 pixelify-sans text-[#ffffff]">Pokemon Login</h1>

          <div className="relative mb-3 w-full">
            <PixelButton
              colorA="#a5b6dd"
              colorB="#384071"
              colorText="#384071"
              textSize="1rem"
              height={50}
              width="100%"
              cursorPointer={false}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`absolute top-0 left-0 w-full h-full px-3 border-none outline-none font-mono bg-transparent
                ${email ? "text-white" : "text-[#384071]"}`
              }
            />
          </div>

          <div className="relative mb-3 w-full">
            <PixelButton
              colorA="#a5b6dd"
              colorB="#384071"
              colorText="#384071"
              textSize="1rem"
              height={50}
              width="100%"
              cursorPointer={false}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`absolute top-0 left-0 w-full h-full px-3 border-none outline-none font-mono bg-transparent
                ${password ? "text-white" : "text-[#384071]"}`
              }
            />
          </div>

          <div className="mt-2 w-full">
            <PixelButton
              colorA={loading ? "#ccc" : "#ffcc00"}
              colorB={loading ? "#aaa" : "#d4a500"}
              colorText="#000"
              textSize="1rem"
              height={50}
              width="100%"
              cursorPointer={!loading}
              onClick={() => document.querySelector('form')?.requestSubmit()}
            >
              {loading ? "Logging in..." : "Login"}
            </PixelButton>
          </div>

          {error && <div className="mt-3 text-[#ff8ea8]">{error}</div>}

          <div className="mt-6 text-sm text-[#ffffff]">
            No account?{" "}
            <Link to="/signup" className="font-bold text-[#ffcc00]">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
