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

async function getChatHistory() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    const params = new URLSearchParams();

    const getUrlParams = new URLSearchParams(window.location.search);
    const vehicleId = getUrlParams.get('id');

    params.append('vehicleId', vehicleId);

    const currentUser = await getCurrentUser()
    params.append('interestedClientId', currentUser.numberId);

    try {
        const response = await fetch(`http://localhost:3000/chats/history?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo historial de chat:', error);
        return null;
    }
}

async function sendMessageToBackend(text) {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) { return null };

        const urlParams = new URLSearchParams(window.location.search);

        const vehicleId = urlParams.get('id');

        const sellerId = document.getElementById('seller-id').textContent;

        const currentUser = await getCurrentUser();

        let status = "";
        if (currentUser.numberId == sellerId) {
            status = "owner";

            const params = new URLSearchParams();
            params.append('vehicleId', vehicleId);
            params.append('interestedClientId', interestedClientId);

            const chatId = await fetch(`http://localhost:3000/chats?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })

            try {
                const lastQuestion = await fetch('http://localhost:3000/chats/lastQuestion', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chatId: chatId.id,
                    })
                })

                const response = await fetch(`http://localhost:3000/chats/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        questionId: lastQuestion.id,
                        vehicleOwnerId: sellerId,
                        content: text,
                    })
                })

                if (!response.ok) {
                    throw new Error(`Error en el servidor: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error obteniendo historial de chat:', error);
                alert('Error al obtener el historial de chat.');
            }

        } else if (currentUser.numberId != sellerId) {
            status = "client";

            const chat = {
                vehicleId: vehicleId,
                ownerId: sellerId,
                interestedClientId: currentUser.numberId,
                turn: status
            }

            const interestedClientId = currentUser.numberId;
            const content = text;

            const params = new URLSearchParams();
            params.append('vehicleId', vehicleId);
            params.append('interestedClientId', interestedClientId);

            const chatId = await fetch(`http://localhost:3000/chats?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })

            const question = {
                chatId: chatId.id,
                interestedClientId: interestedClientId,
                content: content,
                status: 'waiting'
            }

            try {
                const response = await fetch(`http://localhost:3000/chats/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat,
                        question
                    })
                })

                if (!response.ok) {
                    throw new Error(`Error en el servidor: ${response.status}`);
                }

                return await response.json();

            } catch (error) {
                console.error('Error enviando mensaje:', error);
                alert('Error al enviar el mensajee.');
            }
        }

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        alert('Error al enviar el mensajey.');
    }
}

async function renderChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const chatHistory = await getChatHistory();
    if (!chatHistory) return;

    chatMessages.innerHTML = '';

    for (const message of chatHistory) {
        if (message.question) {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'message-sent';
            questionDiv.textContent = message.question.content;
            chatMessages.appendChild(questionDiv);
        }

        if (message.answer) {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'message-received';
            answerDiv.textContent = message.answer.content;
            chatMessages.appendChild(answerDiv);
        }
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}
export { API_URL };
