//IMPORTS
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, getUserInfo } from "../services/authService";
import PixelButton from "../components/elements/pixelButton";

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
      sessionStorage.setItem("token", data.token);
      setToken(data.token);

      //GET USER INFO
      const userData = await getUserInfo(data.token);

      // SAVE USER ID for friendlist
      if (userData._id) {
        sessionStorage.setItem("userId", userData._id);
      }

      //CHECK AVATAR
      if (userData.avatar?._id) {
        setAvatarId?.(userData.avatar?._id);

        //HOME PAGE
        navigate("/");
      } else {
        setAvatarId?.(null);

        //PROFILE CREATION
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
    <div className="flex items-center justify-center w-screen h-screen bg-blue-200 font-mono">
      {/* Form wrapper relative to place pixel background */}
      <div className="relative w-100">
        {/* PIXEL BACKGROUND FOR FORM */}
        <PixelButton
          colorA="#677fb4"
          colorB="#384071"
          colorText="#384071"
          textSize="1rem"
          height={400}  // adjust to fit form height
          width="100%"
          cursorPointer={false}
        />

        {/* FORM CONTENT ON TOP */}
        <form 
          onSubmit={handleLogin} 
          className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-10 text-center"
        >
          {/* HEADER */}
          <h1 className="text-3xl mb-5 pixelify-sans text-[#ffffff]">Pokemon Login</h1>

          {/* EMAIL INPUT */}
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

          {/* PASSWORD INPUT */}
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

          {/* LOGIN PIXEL BUTTON */}
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

          {/* ERROR MESSAGE */}
          {error && <div className="mt-3 text-[#ff8ea8]">{error}</div>}

          {/* SIGNUP LINK */}
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
