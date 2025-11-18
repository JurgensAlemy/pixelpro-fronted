import { login, register, me } from "./auth-api.js";

// Si ya está logueado y entra a login.html → redirigir a donde corresponda
document.addEventListener("DOMContentLoaded", async () => {
    const user = await me();
    if (user?.authenticated) {
        // --- CAMBIO AQUÍ ---
        // Si ya tiene sesión, también revisamos si es admin
        if (user.roles && user.roles.includes('ROLE_ADMIN')) {
            console.log("Sesión de ADMIN ya activa, redirigiendo a panelAdmin.html");
            location.href = "/admin/panelAdmin.html"; // Redirigir al panel de admin
        } else {
            console.log("Sesión de CLIENTE ya activa, redirigiendo a index.html");
            location.href = "/index.html"; // Redirigir al home de la tienda
        }
        // --- FIN DEL CAMBIO ---
    }
});

window.login = async function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    // Mostramos un simple 'cargando'
    const loginButton = document.querySelector("#loginForm button");
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';

    try {
        const data = await login(email, password);
        console.log("Login OK", data);

        // --- CAMBIO CLAVE AQUÍ ---
        // ¡Ya no necesitamos llamar a me()!
        // La respuesta de login() (que es 'data') ya tiene la información.
        
        if (data && data.authenticated) {
            // Revisamos los roles que nos devolvió el login
            if (data.roles && data.roles.includes('ROLE_ADMIN')) {
                location.href = "/admin/panelAdmin.html"; // Redirigir al panel de admin
            } else {
                location.href = "/index.html"; // Redirigir al home de la tienda
            }
        } else {
            // Si 'data.authenticated' es false, es por un error (ej. contraseña mal, usuario deshabilitado)
            // 'data.message' vendrá del backend si la validación falla (ej. contraseña corta)
            alert(data.message || "Email o contraseña incorrectos.");
            loginButton.disabled = false;
            loginButton.innerHTML = 'Entrar';
        }
        // --- FIN DEL CAMBIO ---

    } catch (err) {
        console.error("Error en el proceso de login:", err);
        alert("Error al intentar iniciar sesión. Revisa la consola.");
        loginButton.disabled = false;
        loginButton.innerHTML = 'Entrar';
    }
};

window.register = async function () {
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    // Mostramos un simple 'cargando'
    const registerButton = document.querySelector("#registerForm button");
    registerButton.disabled = true;
    registerButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';
    
    try {
        const res = await register(email, password);

        if (res && res.authenticated) {
            // Si el registro fue exitoso, lo mandamos al index
            location.href = "/index.html";
        } else {
            // Si falla (ej. validación, email ya existe, 400 Bad Request)
            alert(res.message || "Error en el registro. Verifica tus datos.");
            registerButton.disabled = false;
            registerButton.innerHTML = 'Registrarse';
        }
    } catch (err) {
        console.error("Error en el proceso de registro:", err);
        alert("Error al registrarse. Revisa la consola.");
        registerButton.disabled = false;
        registerButton.innerHTML = 'Registrarse';
    }
};

window.showRegister = function () {
    document.getElementById("loginForm").classList.add("d-none");
    document.getElementById("registerForm").classList.remove("d-none");
};

window.showLogin = function () {
    document.getElementById("registerForm").classList.add("d-none");
    document.getElementById("loginForm").classList.remove("d-none");
};