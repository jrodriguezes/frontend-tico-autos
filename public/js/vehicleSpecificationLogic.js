const API_URL = 'http://localhost:3000';

export async function getVehicleById(id) {
    try {
        const response = await fetch(`${API_URL}/vehicles/specification/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
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

export async function getChatHistory(vehicleId, interestedClientId) {
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
        console.error('Error obteniendo historial de chat:', error);
        return [];
    }
}

export async function getCurrentChat(vehicleId, interestedClientId) {
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
            },
        });

        if (response.status === 404) return null;
        if (!response.ok) return null;

        const text = await response.text();
        if (!text) return null;

        return JSON.parse(text);
    } catch (error) {
        console.error('Error obteniendo chat actual:', error);
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

export async function sendMessageToBackend({ vehicleId, sellerId, text }) {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) return null;

        const currentUser = await getCurrentUser();
        if (!currentUser) return null;

        const isOwner = currentUser.numberId === Number(sellerId);

        if (isOwner) {
            const chat = await getCurrentChat(vehicleId, currentUser.numberId);
            if (!chat) throw new Error('No se encontró el chat');

            const lastQuestion = await fetchLastQuestion(chat._id || chat.id);
            if (!lastQuestion) throw new Error('No se encontró la última pregunta');

            const response = await fetch(`${API_URL}/chats/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat: {
                        vehicleId,
                        ownerId: Number(sellerId),
                        interestedClientId: Number(chat.interestedClientId),
                        turn: 'owner'
                    },
                    answer: {
                        questionId: lastQuestion._id || lastQuestion.id,
                        vehicleOwnerId: Number(sellerId),
                        content: text
                    }
                })
            });

            const respText = await response.text();
            if (!response.ok) {
                let errPayload;
                try { errPayload = JSON.parse(respText); } catch { }
                throw new Error(errPayload?.message || respText || `Error HTTP ${response.status}`);
            }

            return respText ? JSON.parse(respText) : {};
        }

        const response = await fetch(`${API_URL}/chats/message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat: {
                    vehicleId,
                    ownerId: Number(sellerId),
                    interestedClientId: currentUser.numberId,
                    turn: 'client'
                },
                question: {
                    interestedClientId: currentUser.numberId,
                    content: text,
                    status: 'waiting'
                }
            })
        });

        const respText = await response.text();
        if (!response.ok) {
            let errPayload;
            try { errPayload = JSON.parse(respText); } catch { }
            throw new Error(errPayload?.message || respText || `Error HTTP ${response.status}`);
        }

        return respText ? JSON.parse(respText) : {};
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        return null;
    }
}