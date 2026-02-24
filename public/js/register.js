document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

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
                        numberId: Number(numberId),
                        name,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("¡Registro exitoso! Ya puedes iniciar sesión.");
                    window.location.href = "/login";
                } else {
                    alert(data.message || "Error al registrar el usuario");
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert("Error de conexión con el servidor");
            }
        });
    }
});
