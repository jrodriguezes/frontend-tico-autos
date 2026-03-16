# TicoAutos - Frontend Application

## Descripción del Proyecto
TicoAutos es una plataforma web moderna para la publicación, consulta y gestión de vehículos en venta. Este repositorio contiene el **Frontend**, una aplicación cliente desacoplada que se comunica con una API REST para gestionar el inventario de automóviles, usuarios y sistemas de mensajería.

---

## Información Académica
*   **Institución:** Universidad Técnica Nacional (UTN)
*   **Carrera:** Ingeniería del Software
*   **Curso:** Programación en Ambiente Web II (ISW-711)
*   **Profesor:** Bladimir Arroyo
*   **Entrega:** Proyecto Final - Marzo 2026

---

## Características Principales

### Funcionalidades Públicas (Usuarios no autenticados)
*   **Registro e Inicio de Sesión:** Gestión de cuentas de usuario mediante JWT.
*   **Búsqueda Avanzada:** Filtrado dinámico por marca, modelo, rango de años, rango de precios y estado (disponible/vendido) conectado directamente al Backend.
*   **Paginación de Resultados:** Navegación optimizada para grandes volúmenes de datos.
*   **Detalle del Vehículo:** Consulta completa de especificaciones técnica e información del vendedor.
*   **Compartir Vehículo:** Generación de enlaces públicos únicos y botón de copiado rápido al portapapeles.

### Funcionalidades Privadas (Usuarios autenticados)
*   **Gestión de Inventario (Stock):** Panel para Crear, Editar y Eliminar publicaciones de vehículos propios.
*   **Subida de Imágenes:** Soporte para carga de archivos multimedia mediante Multer en el Backend.
*   **Panel de Mensajería (Inbox):** 
    *   **Clientes:** Realizar preguntas a los propietarios y ver historial.
    *   **Propietarios:** Responder preguntas, ver todas las consultas asociadas a sus vehículos y gestionar flujos de conversación.
*   **Reglas de Negocio en Chat:** Control de turnos (cliente/vendedor) y persistencia de mensajes.

---

## Tecnologías Utilizadas
*   **Lenguaje:** JavaScript (ES6+ Vanilla)
*   **Estructura:** HTML5 Semántico
*   **Estilos:** CSS3 Moderno (Variables, Flexbox, CSS Grid)
*   **Iconografía:** FontAwesome
*   **Fuente:** Google Fonts (Inter, Roboto)
*   **Servidor de Desarrollo:** Node.js + Express (para servir archivos estáticos)
*   **Autenticación:** JSON Web Tokens (JWT) almacenados en `sessionStorage`

---

## Estructura del Proyecto
```text
/Frontend-Tico-Autos
├── public/                # Carpeta raíz del servidor estático
│   ├── css/               # Hojas de estilo estructuradas
│   ├── js/                # Lógica del frontend dividida por módulos
│   │   ├── auth.js        # Gestión de login
│   │   ├── home.js        # Control de la vista principal y filtros
│   │   ├── homeLogic.js   # Peticiones API para el Home
│   │   ├── register.js    # Lógica de creación de cuentas
│   │   ├── stock.js       # Gestión de inventario propio
│   │   └── vehicleSpecification.js # Lógica de detalle y chat
│   ├── views/             # Archivos HTML (Vistas)
│   │   ├── home.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── specification.html
│   │   └── stock.html
│   ├── index.js           # Servidor Express básico
│   └── package.json       # Configuración y dependencias
└── README.md              # Documentación del proyecto
```

---

## Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone [url-del-repositorio]
    ```

2.  **Navegar a la carpeta del frontend:**
    ```bash
    cd Frontend-Tico-Autos/public
    ```

3.  **Instalar dependencias:**
    ```bash
    npm install
    ```

4.  **Ejecutar el servidor local:**
    ```bash
    npm run dev
    ```

5.  **Acceder a la aplicación:**
    Abra su navegador en [http://localhost:8080](http://localhost:8080) (o el puerto configurado en `index.js`).

> [!IMPORTANT]
> Asegúrese de que el **Backend-Tico-Autos** esté en ejecución simultáneamente para que la aplicación funcione correctamente, ya que el frontend consume la API ubicada por defecto en `http://localhost:3000`.

---

## Diseño y UX
Se ha priorizado una **estética premium**:
*   Modo oscuro elegante con contrastes altos.
*   Micro-animaciones y efectos hover interactivos en tarjetas de vehículos.
*   Diseño Responsivo adaptado a dispositivos móviles y escritorio.
*   Carga diferida (Loaders) para mejorar la percepción de velocidad en peticiones asíncronas.
