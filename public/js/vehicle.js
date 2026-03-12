document.addEventListener("DOMContentLoaded", () => {
  const vehicleForm = document.getElementById("vehicle-form");

  if (vehicleForm) {
    vehicleForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userToken = sessionStorage.getItem("token");

      if (!userToken) {
        alert("No has iniciado sesión");
        return;
      }

      // Seleccionamos los elementos del DOM
      const vehicleBrand = document.getElementById("v-brand");
      const vehicleModel = document.getElementById("v-model");
      const vehicleYear = document.getElementById("v-year");
      const vehiclePrice = document.getElementById("v-price");
      const vehicleStatus = document.getElementById("v-status");
      const vehicleMileage = document.getElementById("v-mileage");
      const vehiclePlate = document.getElementById("v-plate");
      const vehicleImage = document.getElementById("v-image");
      const vehicleObservations = document.getElementById("v-observations");
      if (vehicleObservations.value == "") {
        vehicleObservations.value = "N/A"
      }

      // Usamos FormData para poder enviar archivos multimedia
      const formData = new FormData();
      formData.append("brand", vehicleBrand.value);
      formData.append("model", vehicleModel.value);
      formData.append("year", Number(vehicleYear.value));
      formData.append("price", Number(vehiclePrice.value));
      formData.append("mileage", Number(vehicleMileage.value));
      formData.append("status", vehicleStatus.value);
      formData.append("plateId", vehiclePlate.value);
      formData.append("observations", vehicleObservations.value);

      // Si el dom viene con el vehicle-id cargado quiere decir que es una actualizacion
      const vehicleId = document.getElementById("vehicle-id").value;

      // Adjuntamos la imagen si el usuario selecciono una
      if (vehicleImage.files[0]) {
        formData.append("image", vehicleImage.files[0]);
      } else if (!vehicleId) {
        // Solo es obligatoria si es un vehículo NUEVO
        alert("No se seleccionó una imagen para el nuevo vehículo");
        return;
      }

      if (vehicleId != "") {
        try {
          const response = await fetch(`http://localhost:3000/vehicles/${vehicleId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          });

          if (response.ok) {
            window.location.reload();
          } else {
            const errorData = await response.json();
            alert(
              "Error: " +
              (errorData.message || "No se pudo publicar el vehículo"),
            );
          }

        } catch (error) {
          alert("Error de conexión con el servidor");
        }
      } else {
        try {
          // El Content-Type NO se pone manualmente cuando usamos FormData,
          // a raiz del formData no colocamos Content-Type: multipart/form-data; porque se configura automaticamente
          const response = await fetch("http://localhost:3000/vehicles", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          });

          if (response.ok) {
            window.location.reload();
          } else {
            const errorData = await response.json();
            alert(
              "Error: " +
              (errorData.message || "No se pudo publicar el vehículo"),
            );
          }
        } catch (error) {
          console.error("Error al enviar el formulario:", error);
          alert("Error de conexión con el servidor");
        }
      }


    });
  }
});
