const API_URL = 'http://localhost:3000';

function buildVehicleUrl(filters = null, page = 1, limit = 8) {
    if (!filters) {
        return `${API_URL}/vehicles?page=${page}&limit=${limit}`;
    }

    const params = new URLSearchParams();

    if (filters.brand) {
        params.append('brand', filters.brand)
    };
    if (filters.model) {
        params.append('model', filters.model)
    };
    if (filters.minYear) {
        params.append('minYear', filters.minYear)
    };
    if (filters.maxYear) {
        params.append('maxYear', filters.maxYear)
    };
    if (filters.minPrice) {
        params.append('minPrice', filters.minPrice)
    };
    if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice)
    };
    if (filters.status) {
        params.append('status', filters.status)
    };

    params.append('page', page);
    params.append('limit', limit);

    return `${API_URL}/vehicles?${params.toString()}`;
}

export function getFiltersFromForm(formElement) {
    const formData = new FormData(formElement);

    return {
        brand: formData.get('brand')?.toString().trim(),
        model: formData.get('model')?.toString().trim(),
        minYear: formData.get('minYear')?.toString().trim(),
        maxYear: formData.get('maxYear')?.toString().trim(),
        minPrice: formData.get('minPrice')?.toString().trim(),
        maxPrice: formData.get('maxPrice')?.toString().trim(),
        status: formData.get('status')?.toString().trim(),
    };
}

export async function fetchVehicles(filters = null, page = 1, limit = 8) {
    const url = buildVehicleUrl(filters, page, limit);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Error al cargar vehículos');
    }

    return await response.json();
}

export function resolveVehicleImage(imagePath) {
    if (!imagePath) return '';

    if (!imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
        return `${API_URL}${imagePath}`;
    }

    return imagePath;
}

export { API_URL };
