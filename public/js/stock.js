document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) Referencias al DOM
  // =========================
  const stockGrid = document.getElementById("stock-grid");
  const stockEmpty = document.getElementById("stock-empty");
  const stockLoader = document.getElementById("stock-loader");

  const addVehicleBtn = document.getElementById("add-vehicle-btn");

  const vehicleModal = document.getElementById("vehicle-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const cancelModalBtn = document.getElementById("cancel-modal");

  const vehicleForm = document.getElementById("vehicle-form");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const modalContent = document.querySelector(".modal-content");

  const logoutBtn = document.getElementById("logout-btn");

  // Image Upload Elements
  const imageInput = document.getElementById("v-image");
  const imagePreviewContainer = document.getElementById("image-preview-container");
  const imagePreview = document.getElementById("image-preview");
  const removeImageBtn = document.getElementById("remove-image");
  const fileUploadLabel = document.querySelector(".file-upload-label");

  // Multi-step elements
  const formSlider = document.getElementById("form-slider");
  const nextStepBtn = document.getElementById("next-step");
  const prevStepBtn = document.getElementById("prev-step");
  const dot1 = document.getElementById("dot-1");
  const dot2 = document.getElementById("dot-2");

  // =========================
  // 2) Config / Estado
  // =========================
  const API_URL = "http://localhost:3000";

  // =========================
  // 3) Helpers
  // =========================

  /**
   * Convierte una ruta de imagen que viene del backend (ej: "/uploads/x.jpg")
   * en una URL completa (ej: "http://localhost:3000/uploads/x.jpg")
   * También respeta si ya viene como http(s) o data URL.
   */
  function resolveImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    return `${API_URL}${imagePath}`;
  }

  /**
   * Muestra loader, oculta contenido/empty.
   */
  function showLoading() {
    stockLoader.style.display = "flex";
    stockGrid.style.display = "none";
    stockEmpty.style.display = "none";
  }

  /**
   * Oculta loader.
   */
  function hideLoading() {
    stockLoader.style.display = "none";
  }

  /**
   * Ajusta altura del modal para que “calce” con el step actual
   * (evita que pegue brincos feos al cambiar de paso).
   */
  function updateModalHeight(stepElement) {
    const header = document.querySelector(".modal-header-wrapper");
    const stepper = document.querySelector(".stepper-container");

    const height =
      header.offsetHeight + stepper.offsetHeight + stepElement.offsetHeight;

    modalContent.style.height = `${height}px`;
  }

  // =========================
  // 4) Backend: cargar vehículos
  // =========================

  /**
   * Obtiene los vehículos del usuario autenticado.
   * Requiere token JWT en localStorage con key "token".
   */
  async function getVehicles() {
    const userToken = localStorage.getItem("token");
    console.log("token?", !!userToken);

    // Sin token: no pedimos nada.
    if (!userToken) return [];

    try {
      const response = await fetch(`${API_URL}/vehicles/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
      return [];
    }
  }

  /**
   * Carga vehículos y renderiza.
   */
  async function loadVehicles() {
    showLoading();
    myVehicles = await getVehicles();
    renderStock();
  }

  // =========================
  // 5) Render de tarjetas
  // =========================

  /**
   * Renderiza el grid de vehículos o el estado "vacío".
   */
  function renderStock() {
    hideLoading();

    // Si no hay carros, mostramos el empty state
    if (!myVehicles || myVehicles.length === 0) {
      stockGrid.style.display = "none";
      stockEmpty.style.display = "block";
      return;
    }

    stockEmpty.style.display = "none";
    stockGrid.style.display = "grid";

    stockGrid.innerHTML = myVehicles
      .map((vehicle) => {
        const imagePath = resolveImageUrl(vehicle.imageUrl);

        return `
          <div class="admin-card" data-id="${vehicle._id}">
            <div class="admin-card-img" style="background: url('${imagePath || ""}') center/cover no-repeat;">
              ${!imagePath ? '<i class="fas fa-car-side"></i>' : ""}
              <span class="status-badge ${vehicle.status === "Disponible" ? "status-available" : "status-sold"
          }">
                ${vehicle.status}
              </span>
            </div>

            <div class="admin-card-content">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                <h3 style="font-size:1.25rem;">${vehicle.brand} ${vehicle.model}</h3>
                <span style="color:var(--accent); font-weight:800;">
                  $${Number(vehicle.price).toLocaleString()}
                </span>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:1rem; color:var(--text-secondary); font-size:0.85rem; margin-bottom:1rem;">
                <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                <span><i class="fas fa-hashtag"></i> ${vehicle.plateId}</span>
                <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage || "0"} km</span>
              </div>

              <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; border-top:1px solid var(--border); padding-top:10px;">
                ${vehicle.observations}
              </p>
            </div>

            <div class="admin-card-actions">
              <button class="btn-icon" onclick="editVehicle(${vehicle._id})" title="Editar">
                <i class="fas fa-edit"></i>
              </button>

              <button class="btn-icon btn-success" onclick="toggleStatus('${vehicle._id}')"
                title="${vehicle.status === "Disponible"
            ? "Marcar como Vendido"
            : "Marcar como Disponible"
          }">
                <i class="fas ${vehicle.status === "Disponible" ? "fa-check-circle" : "fa-undo"
          }"></i>
              </button>

              <button class="btn-icon btn-delete" onclick="deleteVehicle('${vehicle._id}')" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // =========================
  // 6) Modal: abrir / cerrar
  // =========================

  /**
   * Abre el modal. Si recibe editId, carga los valores del vehículo en el form.
   * Lo ponemos en window para que funcione con onclick="" desde el HTML generado.
   */
  window.openModal = (editId = null) => {
    vehicleForm.reset();
    document.getElementById("vehicle-id").value = "";

    if (editId) {
      const vehicle = myVehicles.find((v) => v.id === editId);
      if (vehicle) {
        modalTitle.textContent = "Editar Vehículo";

        // Seteamos campos
        document.getElementById("vehicle-id").value = vehicle.id;
        document.getElementById("v-brand").value = vehicle.brand;
        document.getElementById("v-model").value = vehicle.model;
        document.getElementById("v-year").value = vehicle.year;
        document.getElementById("v-price").value = vehicle.price;
        document.getElementById("v-mileage").value = vehicle.mileage;
        document.getElementById("v-status").value = vehicle.status;
        document.getElementById("v-plate").value = vehicle.plateId;
        document.getElementById("v-observations").value = vehicle.observations;

        // Imagen (si viene del backend como /uploads/...)
        if (vehicle.imageUrl) {
          showPreview(resolveImageUrl(vehicle.imageUrl));
        } else {
          hidePreview();
        }
      }
    } else {
      modalTitle.textContent = "Publicar Nuevo Vehículo";
      hidePreview();
    }

    // Mostramos modal
    vehicleModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Esperamos un toque para que el DOM del modal termine de “pintar”
    setTimeout(() => {
      goToStep(1);
    }, 10);
  };

  /**
   * Cambia el step del slider (Paso 1 / Paso 2).
   */
  function goToStep(step) {
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");

    if (step === 1) {
      formSlider.classList.remove("step-2-active");
      dot1.classList.add("active");
      dot2.classList.remove("active");
      modalSubtitle.textContent = "Paso 1: Información básica del auto.";
      updateModalHeight(step1);
      return;
    }

    // step === 2
    formSlider.classList.add("step-2-active");
    dot1.classList.remove("active");
    dot2.classList.add("active");
    modalSubtitle.textContent = "Paso 2: Detalles y multimedia.";
    updateModalHeight(step2);
  }

  /**
   * Cierra modal y resetea estilos.
   */
  function closeModal() {
    vehicleModal.style.display = "none";
    document.body.style.overflow = "auto";

    // Reset de altura para que no quede fijo si se reabre
    modalContent.style.height = "auto";

    // Volvemos al paso 1 después de la animación (si existe)
    setTimeout(() => {
      goToStep(1);
    }, 400);
  }

  // =========================
  // 7) Navegación de pasos
  // =========================

  nextStepBtn.addEventListener("click", () => {
    // Validación rápida de inputs requeridos del paso 1
    const brandOk = document.getElementById("v-brand").checkValidity();
    const modelOk = document.getElementById("v-model").checkValidity();
    const yearOk = document.getElementById("v-year").checkValidity();
    const priceOk = document.getElementById("v-price").checkValidity();

    if (brandOk && modelOk && yearOk && priceOk) {
      goToStep(2);
    } else {
      // Muestra mensajes nativos del navegador (required, min, etc.)
      vehicleForm.reportValidity();
    }
  });

  prevStepBtn.addEventListener("click", () => goToStep(1));

  // =========================
  // 8) Imagen: preview / remover
  // =========================

  /**
   * Cuando el usuario selecciona una imagen, la leemos con FileReader
   * y mostramos el preview en el modal.
   */
  imageInput.addEventListener("change", function () {
    const file = this.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      showPreview(e.target.result); // data URL
    };
    reader.readAsDataURL(file);
  });

  removeImageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hidePreview();
  });

  function showPreview(src) {
    imagePreview.src = src;
    imagePreviewContainer.style.display = "block";
    fileUploadLabel.style.display = "none";

    // Si ya hay preview, no forzamos imagen requerida
    imageInput.required = false;
  }

  function hidePreview() {
    imagePreview.src = "";
    imagePreviewContainer.style.display = "none";
    fileUploadLabel.style.display = "flex";

    // Limpiamos input file
    imageInput.value = "";

    // Si tu flujo requiere imagen SIEMPRE, lo mantenés en true.
    // Si querés que sea opcional, cambiá esto a false.
    imageInput.required = true;
  }

  // =========================
  // 9) Acciones CRUD (FRONT)
  // =========================

  /*
   * Estas funciones están en window porque se usan en onclick="" en el HTML generado.
   */
  window.editVehicle = (id) => window.openModal(id);


  // Cambia el estado del vehiculo
  window.toggleStatus = async (id) => {
    const token = localStorage.getItem('token');
    let vehicle;

    try {
      const response = await fetch('http://localhost:3000/vehicles/specification/' + id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("No se pudo obtener el vehículo");

      vehicle = await response.json();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al obtener el vehículo.");
      return; // Salimos si no hay vehiculo
    }

    if (!vehicle) return;

    const newStatus = vehicle.status === "Disponible" ? "Vendido" : "Disponible";

    try {
      const response = await fetch('http://localhost:3000/vehicles/changeStatus/' + id, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Error al cambiar el estado del vehículo');
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al cambiar el estado.");
    }
  };

  // Elimina el vehiculo
  window.deleteVehicle = async (id) => {
    const ok = confirm("¿Estás seguro de que quieres eliminar este vehículo?");
    if (!ok) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/vehicles/' + id, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Error al eliminar el vehículo');
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      throw error;
    }

    window.location.reload();
  };

  // =========================
  // 10) Submit del formulario
  // =========================

  vehicleForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const idValue = document.getElementById("vehicle-id").value;

    // Armamos el objeto con datos del form
    const vehicleData = {
      id: idValue ? parseInt(idValue) : Date.now(), // temporal si no hay id
      brand: document.getElementById("v-brand").value,
      model: document.getElementById("v-model").value,
      year: parseInt(document.getElementById("v-year").value),
      price: parseFloat(document.getElementById("v-price").value),
      mileage: parseInt(document.getElementById("v-mileage").value) || 0,
      status: document.getElementById("v-status").value,
      plateId: document.getElementById("v-plate").value,
      observations: document.getElementById("v-observations").value,

      /**
       * Si el preview es dataURL (imagen recién subida) o http (imagen ya existente),
       * lo guardamos. Si no, lo dejamos vacío.
       *
       * Nota: en un flujo real con backend, normalmente aquí mandarías el File
       * en FormData y el backend devuelve imageUrl.
       */
      imageUrl:
        imagePreview.src.startsWith("data:") || imagePreview.src.startsWith("http")
          ? imagePreview.src
          : "",
    };

    // Si viene id, editamos en el array; si no, insertamos al inicio
    if (idValue) {
      const index = myVehicles.findIndex((v) => v.id === parseInt(idValue));
      if (index !== -1) myVehicles[index] = vehicleData;
    } else {
      myVehicles.unshift(vehicleData);
    }

    renderStock();
    closeModal();
  });

  // =========================
  // 11) Otros listeners
  // =========================

  addVehicleBtn.addEventListener("click", () => window.openModal());
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/home";
  });

  // =========================
  // 12) Init
  // =========================
  loadVehicles();
});