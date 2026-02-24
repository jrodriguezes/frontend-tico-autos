document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const numberId = document.getElementById('numberId').value;
            const password = document.getElementById('password').value;

            console.log('Login attempt:', { numberId, password });

            // Basic validation
            if (!numberId || !password) {
                alert('Por favor complete todos los campos');
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/auth/login", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ numberId: Number(numberId), password })
                });

                const data = await response.json();

                if (response.ok && data.access_token) {
                    // Guardar el token para futuras peticiones
                    localStorage.setItem('token', data.access_token);
                    window.location.href = "/home";
                } else {
                    alert(data.message || "Error al iniciar sesión: Credenciales inválidas");
                }
            } catch (error) {
                console.error('Login error:', error);
                alert("Error de conexión con el servidor");
            }

        });
    }

});
