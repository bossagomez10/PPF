// En el evento submit del formulario de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        if (response.ok) {
            const user = await response.json();
            // Guardar el usuario completo, incluyendo el factorDescuento
            localStorage.setItem('user', JSON.stringify(user));
            
            if (user.rol === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/calculator';
            }
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
});