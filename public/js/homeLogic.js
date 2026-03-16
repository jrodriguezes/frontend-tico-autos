const API_URL = 'http://localhost:3000';

function buildVehicleUrl(filters = null, page = 1, limit = 8) {
    if (!filters) {
        return `${API_URL}/vehicles?page=${page}&limit=${limit}`;
    }

    const params = new URLSearchParams();

    if (filters.brand) params.append('brand', filters.brand);
    if (filters.model) params.append('model', filters.model);
    if (filters.minYear) params.append('minYear', filters.minYear);
    if (filters.maxYear) params.append('maxYear', filters.maxYear);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.status) params.append('status', filters.status);

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

export async function getCurrentUser() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        return null;
    }
}

export async function fetchInboxChats() {
    const token = sessionStorage.getItem('token');
    if (!token) return [];

    try {
        const response = await fetch(`${API_URL}/chats/inbox`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener inbox');
        }

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo inbox:', error);
        return [];
    }
}

export async function getUserNameById(id) {
    try {
        const response = await fetch(`${API_URL}/users/userNameById/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

export async function fetchInboxChatHistory(vehicleId, interestedClientId) {
    const token = sessionStorage.getItem('token');
    if (!token) return [];

    const params = new URLSearchParams();
    params.append('vehicleId', vehicleId);
    params.append('interestedClientId', interestedClientId);

    try {
        const response = await fetch(`${API_URL}/chats/history?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        return [];
    }
}

export async function fetchChatByVehicleAndClient(vehicleId, interestedClientId) {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    const params = new URLSearchParams();
    params.append('vehicleId', vehicleId);
    params.append('interestedClientId', interestedClientId);

    try {
        const response = await fetch(`${API_URL}/chats?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        const text = await response.text();
        if (!text) return null;

        return JSON.parse(text);
    } catch (error) {
        console.error('Error obteniendo chat:', error);
        return null;
    }
}

export async function fetchLastQuestion(chatId) {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/chats/lastQuestion?chatId=${chatId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('Error obteniendo última pregunta:', error);
        return null;
    }
}

export async function sendInboxMessage(currentInboxChat, text) {
    if (!currentInboxChat) return null;

    const token = sessionStorage.getItem('token');
    if (!token) return null;

    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const { chatId, vehicleId, ownerId, interestedClientId } = currentInboxChat;
    const isOwner = currentUser.numberId === Number(ownerId);

    try {
        if (isOwner) {
            const lastQuestion = await fetchLastQuestion(chatId);
            if (!lastQuestion) {
                throw new Error('No se pudo obtener la última pregunta');
            }

            const chat = {
                vehicleId,
                ownerId: Number(ownerId),
                interestedClientId: Number(interestedClientId),
                turn: 'owner'
            };

            const answer = {
                questionId: lastQuestion._id || lastQuestion.id,
                vehicleOwnerId: Number(ownerId),
                content: text
            };

            const response = await fetch(`${API_URL}/chats/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chat, answer })
            });

            const respText = await response.text();

            if (!response.ok) {
                let errPayload;
                try { errPayload = JSON.parse(respText); } catch { }
                throw new Error(errPayload?.message || respText || `Error HTTP ${response.status}`);
            }

            return respText ? JSON.parse(respText) : {};
        } else {
            const chat = {
                vehicleId,
                ownerId: Number(ownerId),
                interestedClientId: currentUser.numberId,
                turn: 'client'
            };

            const question = {
                chatId,
                interestedClientId: currentUser.numberId,
                content: text,
                status: 'waiting'
            };

            const response = await fetch(`${API_URL}/chats/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chat, question })
            });

            const respText = await response.text();

            if (!response.ok) {
                let errPayload;
                try { errPayload = JSON.parse(respText); } catch { }
                throw new Error(errPayload?.message || respText || `Error HTTP ${response.status}`);
            }

            return respText ? JSON.parse(respText) : {};
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        throw error;
    }
}

export { API_URL };