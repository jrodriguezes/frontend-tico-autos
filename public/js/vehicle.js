document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicle-form');

    if (vehicleForm) {
        vehicleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userToken = localStorage.getItem('token');

            if (!userToken) {
                alert('No has iniciado sesión');
                return;
            }

            // Seleccionamos los elementos del DOM
            const vehicleBrand = document.getElementById('v-brand');
            const vehicleModel = document.getElementById('v-model');
            const vehicleYear = document.getElementById('v-year');
            const vehiclePrice = document.getElementById('v-price');
            const vehicleStatus = document.getElementById('v-status');
            const vehicleMileage = document.getElementById('v-mileage');
            const vehiclePlate = document.getElementById('v-plate');
            const vehicleImage = document.getElementById('v-image');
            const vehicleObservations = document.getElementById('v-observations');

            // Usamos FormData para poder enviar archivos multimedia
            const formData = new FormData();
            formData.append('brand', vehicleBrand.value);
            formData.append('model', vehicleModel.value);
            formData.append('year', Number(vehicleYear.value));
            formData.append('price', Number(vehiclePrice.value));
            formData.append('mileage', Number(vehicleMileage.value));
            formData.append('status', vehicleStatus.value);
            formData.append('plateId', vehiclePlate.value);
            formData.append('observations', vehicleObservations.value);

            // Adjuntamos la imagen si el usuario selecciono una
            if (vehicleImage.files[0]) {
                formData.append('image', vehicleImage.files[0]);
            }

            try {
                // El Content-Type NO se pone manualmente cuando usamos FormData,
                // el navegador lo configura automáticamente con el 'boundary' correcto.
                const response = await fetch('http://localhost:3000/vehicles', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: formData
                });

                if (response.ok) {
                    alert('Vehículo publicado exitosamente');
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + (errorData.message || 'No se pudo publicar el vehículo'));
                }

            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }
});