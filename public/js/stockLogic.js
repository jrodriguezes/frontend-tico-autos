// stockLogic.js
const API_URL = "http://localhost:3000";

function getToken() {
  return sessionStorage.getItem("token");
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = "Error en la petición";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignorar si no viene JSON
    }
    throw new Error(errorMessage);
  }

  // Si no hay contenido
  if (response.status === 204) return null;

  // Intentamos devolver JSON
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function getMyVehicles() {
  const token = getToken();
  if (!token) {
    window.location.href = "/register";
    return;
  }

  try {
    return await request(`${API_URL}/vehicles/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    return [];
  }
}

async function getVehicleById(id) {
  return await request(`${API_URL}/vehicles/specification/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function changeVehicleStatus(id, status) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return;
  }

  return await request(`${API_URL}/vehicles/changeStatus/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

async function deleteVehicleRequest(id) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return;
  }

  return await request(`${API_URL}/vehicles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

async function saveVehicle(formValues) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const formData = new FormData();
  formData.append("brand", formValues.brand);
  formData.append("model", formValues.model);
  formData.append("year", Number(formValues.year));
  formData.append("price", Number(formValues.price));
  formData.append("mileage", Number(formValues.mileage || 0));
  formData.append("status", formValues.status);
  formData.append("plateId", formValues.plateId);
  formData.append("observations", formValues.observations || "N/A");

  if (formValues.imageFile) {
    formData.append("image", formValues.imageFile);
  } else if (!formValues.id) {
    throw new Error("No se seleccionó una imagen para el nuevo vehículo");
  }

  if (formValues.id) {
    return await request(`${API_URL}/vehicles/${formValues.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  }

  return await request(`${API_URL}/vehicles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

// Exponer funciones globalmente para que stock.js las use
window.stockLogic = {
  API_URL,
  getMyVehicles,
  getVehicleById,
  changeVehicleStatus,
  deleteVehicleRequest,
  saveVehicle,
};
