const API = "http://localhost:8080/api/auth";

// Config base para peticiones que usan cookies de sesión
const baseOpts = {
    credentials: "include", // ✅ mantiene la sesión (JSESSIONID)
};

// --- ME ---
export async function me() {
    const res = await fetch(`${API}/me`, {
        ...baseOpts,
        method: "GET"
    });
    if (!res.ok) {
        return { authenticated: false };
    }
    return res.json();
}

// --- LOGIN ---
export async function login(email, password) {
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

// --- REGISTER ---
export async function register(email, password) {
    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

// --- LOGOUT ---
export async function logout() {
    const res = await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include"
    });
    return res.ok;
}
