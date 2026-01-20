// TYPES
export interface AuthData {
  token: string;
}

export interface UserData {
  avatarId?: string;
  email?: string;
}

// SIGNUP API
export async function signup(email: string, password: string, timeout = 10000): Promise<AuthData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch("http://localhost:5001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    const data: AuthData = await res.json().catch(() => ({} as AuthData));

    if (!res.ok) {
      throw new Error(data.token ? undefined : "Signup failed!");
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// LOGIN API
export async function login(email: string, password: string, timeout = 10000): Promise<AuthData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    const data: AuthData = await res.json().catch(() => ({} as AuthData));

    if (!res.ok) throw new Error(data.token ? undefined : "Login failed!");
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// GET USER INFO
export async function getUserInfo(token: string, timeout = 10000): Promise<UserData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch("http://localhost:5001/api/auth/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    const data: UserData = await res.json().catch(() => ({} as UserData));
    if (!res.ok) throw new Error(data.avatarId ? undefined : "Failed to fetch user info");
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
