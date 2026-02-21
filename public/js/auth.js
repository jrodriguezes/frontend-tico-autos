document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const numberId = document.getElementById('cedula').value;
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

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const numberId = document.getElementById('cedula').value;
            const name = document.getElementById('nombre').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        numberId: Number(numberId), // Convertir a numero para que el backend lo acepte
                        name, 
                        password 
                    })
                });


                const data = await response.json();

                if (response.ok) {
                    window.location.href = "/login";
                } else {
                    alert("Error al registrar el usuario");
                }
            } catch (error) {
                console.error('Error during registration:', error);
            }


        });
    }
});
