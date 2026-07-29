const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Sanctum's SPA auth requires this before any state-changing request, so it can set the
// XSRF-TOKEN cookie the server checks on the way back in.
async function ensureCsrfCookie() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

async function request(path, { method = "GET", body, headers: extraHeaders } = {}) {
  const needsCsrf = method !== "GET";
  if (needsCsrf) await ensureCsrfCookie();

  const headers = { Accept: "application/json", ...extraHeaders };
  if (body) headers["Content-Type"] = "application/json";
  if (needsCsrf) {
    const token = getCookie("XSRF-TOKEN");
    if (token) headers["X-XSRF-TOKEN"] = token;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include", // required for the session cookie to flow cross-port (5173 -> 8000)
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.errors = data?.errors || null; // Laravel's { field: [messages] } validation shape
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) => request("/api/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/login", { method: "POST", body: payload }),
  logout: () => request("/api/logout", { method: "POST" }),
  me: () => request("/api/user"),

  // Rooms — deliberately no account required. moderatorToken (returned once, at creation)
  // is what authorizes updateRoom, not a Sanctum session — see backend/app/Http/Controllers/
  // Api/RoomController.php's docblock for why.
  createRoom: (payload) => request("/api/rooms", { method: "POST", body: payload }),
  getRoom: (code) => request(`/api/rooms/${code}`),
  updateRoom: (code, payload, moderatorToken) =>
    request(`/api/rooms/${code}`, {
      method: "PATCH",
      body: payload,
      headers: { "X-Moderator-Token": moderatorToken },
    }),
};
