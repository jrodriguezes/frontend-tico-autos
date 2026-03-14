// stock.js
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

  const imageInput = document.getElementById("v-image");
  const imagePreviewContainer = document.getElementById("image-preview-container");
  const imagePreview = document.getElementById("image-preview");
  const removeImageBtn = document.getElementById("remove-image");
  const fileUploadLabel = document.querySelector(".file-upload-label");

  const formSlider = document.getElementById("form-slider");
  const nextStepBtn = document.getElementById("next-step");
  const prevStepBtn = document.getElementById("prev-step");
  const dot1 = document.getElementById("dot-1");
  const dot2 = document.getElementById("dot-2");

  // =========================
  // 2) Estado
  // =========================
  let myVehicles = [];

  // =========================
  // 3) Helpers
  // =========================
  function resolveImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    return `${window.stockLogic.API_URL}${imagePath}`;
  }

  function showLoading() {
    stockLoader.style.display = "flex";
    stockGrid.style.display = "none";
    stockEmpty.style.display = "none";
  }

  function hideLoading() {
    stockLoader.style.display = "none";
  }

  function updateModalHeight(stepElement) {
    const header = document.querySelector(".modal-header-wrapper");
    const stepper = document.querySelector(".stepper-container");

    const height =
      header.offsetHeight + stepper.offsetHeight + stepElement.offsetHeight;

    modalContent.style.height = `${height}px`;
  }

  function getFormValues() {
    return {
      id: document.getElementById("vehicle-id").value,
      brand: document.getElementById("v-brand").value,
      model: document.getElementById("v-model").value,
      year: document.getElementById("v-year").value,
      price: document.getElementById("v-price").value,
      mileage: document.getElementById("v-mileage").value,
      status: document.getElementById("v-status").value,
      plateId: document.getElementById("v-plate").value,
      observations: document.getElementById("v-observations").value,
      imageFile: imageInput.files?.[0] || null,
    };
  }

  // =========================
  // 4) Cargar vehículos
  // =========================
  async function loadVehicles() {
    showLoading();
    myVehicles = await window.stockLogic.getMyVehicles();
    renderStock();
  }

  // =========================
  // 5) Render
  // =========================
  function renderStock() {
    hideLoading();

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
              <span class="status-badge ${vehicle.status === "Disponible" ? "status-available" : "status-sold"}">
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
              <button class="btn-icon" onclick="editVehicle('${vehicle._id}')" title="Editar">
                <i class="fas fa-edit"></i>
              </button>

              <button class="btn-icon btn-success" onclick="toggleStatus('${vehicle._id}')"
                title="${vehicle.status === "Disponible" ? "Marcar como Vendido" : "Marcar como Disponible"}">
                <i class="fas ${vehicle.status === "Disponible" ? "fa-check-circle" : "fa-undo"}"></i>
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
  // 6) Modal
  // =========================
  window.openModal = (editId = null) => {
    vehicleForm.reset();
    document.getElementById("vehicle-id").value = "";

    if (editId) {
      const vehicle = myVehicles.find((v) => v._id === editId);
      if (vehicle) {
        modalTitle.textContent = "Editar Vehículo";

        document.getElementById("vehicle-id").value = vehicle._id;
        document.getElementById("v-brand").value = vehicle.brand;
        document.getElementById("v-model").value = vehicle.model;
        document.getElementById("v-year").value = vehicle.year;
        document.getElementById("v-price").value = vehicle.price;
        document.getElementById("v-mileage").value = vehicle.mileage;
        document.getElementById("v-status").value = vehicle.status;
        document.getElementById("v-plate").value = vehicle.plateId;
        document.getElementById("v-observations").value = vehicle.observations;

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

    vehicleModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      goToStep(1);
    }, 10);
  };

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

    formSlider.classList.add("step-2-active");
    dot1.classList.remove("active");
    dot2.classList.add("active");
    modalSubtitle.textContent = "Paso 2: Detalles y multimedia.";
    updateModalHeight(step2);
  }

  function closeModal() {
    vehicleModal.style.display = "none";
    document.body.style.overflow = "auto";
    modalContent.style.height = "auto";

    setTimeout(() => {
      goToStep(1);
    }, 400);
  }

  // =========================
  // 7) Navegación steps
  // =========================
  nextStepBtn.addEventListener("click", () => {
    const brandOk = document.getElementById("v-brand").checkValidity();
    const modelOk = document.getElementById("v-model").checkValidity();
    const yearOk = document.getElementById("v-year").checkValidity();
    const priceOk = document.getElementById("v-price").checkValidity();

    if (brandOk && modelOk && yearOk && priceOk) {
      goToStep(2);
    } else {
      vehicleForm.reportValidity();
    }
  });

  prevStepBtn.addEventListener("click", () => goToStep(1));

  // =========================
  // 8) Imagen
  // =========================
  imageInput.addEventListener("change", function () {
    const file = this.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      showPreview(e.target.result);
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
    imageInput.required = false;
  }

  function hidePreview() {
    imagePreview.src = "";
    imagePreviewContainer.style.display = "none";
    fileUploadLabel.style.display = "flex";
    imageInput.value = "";
    imageInput.required = true;
  }

  // =========================
  // 9) CRUD
  // =========================
  window.editVehicle = (id) => window.openModal(id);

  window.toggleStatus = async (id) => {
    try {
      const vehicle = await window.stockLogic.getVehicleById(id);
      if (!vehicle) return;

      const newStatus = vehicle.status === "Disponible" ? "Vendido" : "Disponible";
      await window.stockLogic.changeVehicleStatus(id, newStatus);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message || "Hubo un error al cambiar el estado.");
    }
  };

  window.deleteVehicle = async (id) => {
    const ok = confirm("¿Estás seguro de que quieres eliminar este vehículo?");
    if (!ok) return;

    try {
      await window.stockLogic.deleteVehicleRequest(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message || "Hubo un error al eliminar el vehículo.");
    }
  };

  // =========================
  // 10) Submit
  // =========================
  vehicleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const formValues = getFormValues();
      await window.stockLogic.saveVehicle(formValues);
      window.location.reload();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert(error.message || "Error de conexión con el servidor");
    }
  });

  // =========================
  // 11) Otros listeners
  // =========================
  addVehicleBtn.addEventListener("click", () => window.openModal());
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    window.location.href = "/home";
  });

  // =========================
  // 12) Init
  // =========================
  loadVehicles();
});
