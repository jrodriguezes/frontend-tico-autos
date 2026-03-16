import {
    fetchVehicles,
    getFiltersFromForm,
    resolveVehicleImage,
    getCurrentUser,
    fetchInboxChats,
    fetchInboxChatHistory,
    fetchChatByVehicleAndClient,
    sendInboxMessage,
    getUserNameById
} from './homeLogic.js';

document.addEventListener('DOMContentLoaded', async () => {
    const filterForm = document.getElementById('filter-form');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const resultsCount = document.getElementById('results-count');
    const paginationControls = document.getElementById('pagination-controls');

    const inboxBtn = document.getElementById('inbox-btn');
    const inboxWindow = document.getElementById('inbox-window');
    const closeInboxBtn = document.getElementById('close-inbox');
    const inboxListView = document.getElementById('inbox-list-view');
    const inboxChatView = document.getElementById('inbox-chat-view');
    const backToListBtn = document.getElementById('back-to-list');
    const inboxListContainer = document.getElementById('inbox-list-container');
    const sendInboxBtn = document.getElementById('btn-send-inbox');
    const inboxInput = document.getElementById('inbox-chat-input');
    const inboxChatMessages = document.getElementById('inbox-chat-messages');

    let currentPage = 1;
    const itemsPerPage = 8;
    let currentFilters = null;
    let currentInboxChat = null;

    const token = sessionStorage.getItem('token');
    const currentUser = token ? await getCurrentUser() : null;

    loadVehicles();
    setupNavbarAuth();
    setupInbox();
    setupScrollEffects();

    filterForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentPage = 1;
        currentFilters = getFiltersFromForm(filterForm);
        await loadVehicles();
    });

    async function loadVehicles() {
        showLoader();

        try {
            const response = await fetchVehicles(currentFilters, currentPage, itemsPerPage);
            await renderVehicles(response.data);
            renderPagination(response.total);
            resultsCount.textContent = `${response.total} Vehículos Encontrados`;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            vehiclesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    Ocurrió un error al cargar los vehículos.
                </div>
            `;
        }
    }

    async function renderVehicles(vehicles) {
        if (!vehicles || vehicles.length === 0) {
            vehiclesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    No se encontraron vehículos que coincidan con tu búsqueda.
                </div>
            `;
            return;
        }

        const vehicleCardsHTML = await Promise.all(vehicles.map(async vehicle => {
            const imagePath = resolveVehicleImage(vehicle.imageUrl);

            let ownerName = 'Vendedor Privado';
            if (vehicle.ownerId) {
                const userData = await getUserNameById(vehicle.ownerId);
                if (userData && userData.name) {
                    ownerName = userData.name;
                } else if (userData && typeof userData === 'string') {
                    ownerName = userData;
                } else {
                    ownerName = vehicle.ownerId;
                }
            }

            return `
                <div class="vehicle-card" data-id="${vehicle._id}">
                    <div class="vehicle-img" style="background: url('${imagePath || ''}') center/cover no-repeat; height: 220px; position: relative;">
                        ${!imagePath ? '<i class="fas fa-car-side" style="font-size: 3rem; color: var(--border);"></i>' : ''}
                        <span class="status-badge ${vehicle.status === 'Disponible' ? 'status-available' : 'status-sold'}">
                            ${vehicle.status}
                        </span>
                    </div>
                    <div class="vehicle-info" style="padding: 1.5rem;">
                        <div class="vehicle-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                            <h2 class="vehicle-title" style="font-size: 1.2rem; font-weight: 700; color: #fff;">
                                ${vehicle.brand} ${vehicle.model}
                            </h2>
                            <span class="vehicle-price" style="font-size: 1.25rem; font-weight: 800; color: var(--accent);">
                                $${Number(vehicle.price).toLocaleString()}
                            </span>
                        </div>
                        <div class="vehicle-details" style="display: flex; gap: 1.25rem; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
                            <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                            <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage || '0'} km</span>
                        </div>
                        <button class="btn btn-primary btn-block" style="margin-top: 0;" onclick="viewDetail('${vehicle._id}')">
                            Ver Detalles
                        </button>
                    </div>
                    <div class="vehicle-footer" style="padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                        <div class="owner-info" style="font-size: 0.8rem; color: var(--text-secondary);">
                            Vendedor
                            <span style="display: block; color: #fff; font-weight: 600; font-size: 0.9rem; margin-top: 0.1rem;">
                                ${ownerName}
                            </span>
                        </div>
                        <button class="btn-share" onclick="shareVehicle('${vehicle._id}')" title="Copiar enlace" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }));

        vehiclesGrid.innerHTML = vehicleCardsHTML.join('');
    }

    function renderPagination(total) {
        const totalPages = Math.ceil(total / itemsPerPage);

        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">
                    ${i}
                </button>
            `;
        }

        html += `
            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationControls.innerHTML = html;
    }

    window.changePage = async (page) => {
        currentPage = page;
        await loadVehicles();

        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.shareVehicle = (id) => {
        const url = `${window.location.origin}/specification?id=${id}`;
        navigator.clipboard.writeText(url).catch(err => {
            console.error('Error copying link:', err);
        });
    };

    window.viewDetail = (id) => {
        window.location.href = `/specification?id=${id}`;
    };

    function showLoader() {
        vehiclesGrid.innerHTML = `
            <div class="loader" style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
                <span style="color: var(--text-secondary);">Buscando los mejores autos...</span>
            </div>
        `;
    }

    function setupNavbarAuth() {
        const authLink = document.getElementById('auth-link');
        const registerLink = document.getElementById('register-link');
        const userMenu = document.getElementById('user-menu');
        const logoutBtn = document.getElementById('logout-btn');

        if (token) {
            if (authLink) authLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
        }

        logoutBtn?.addEventListener('click', () => {
            sessionStorage.removeItem('token');
            window.location.reload();
        });

        if (token && inboxBtn) {
            inboxBtn.style.display = 'flex';
        } else if (inboxBtn) {
            inboxBtn.style.display = 'none';
        }
    }

    async function setupInbox() {
        if (inboxListContainer) {
            await renderInboxList();
        }

        if (inboxBtn && inboxWindow) {
            inboxBtn.addEventListener('click', () => {
                inboxWindow.classList.toggle('active');
                if (!inboxWindow.classList.contains('active')) {
                    inboxListView.style.display = 'flex';
                    inboxChatView.classList.remove('active');
                }
            });
        }

        closeInboxBtn?.addEventListener('click', () => {
            inboxWindow?.classList.remove('active');
        });

        backToListBtn?.addEventListener('click', () => {
            inboxListView.style.display = 'flex';
            inboxChatView.classList.remove('active');
        });

        if (sendInboxBtn && inboxInput) {
            const sendInboxMessageHandler = async () => {
                const text = inboxInput.value.trim();
                if (text === '') return;
                if (!currentInboxChat) return;

                try {
                    await sendInboxMessage(currentInboxChat, text);
                    inboxInput.value = '';
                    await renderInboxChatHistory();
                    await updateInboxChatAvailability();
                } catch (error) {
                    alert(`Error al enviar el mensaje: ${error.message}`);
                }
            };

            sendInboxBtn.addEventListener('click', sendInboxMessageHandler);
            inboxInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendInboxMessageHandler();
            });
        }
    }

    async function renderInboxList() {
        if (!inboxListContainer) return;

        try {
            if (!token) throw new Error('No hay sesión iniciada');

            const data = await fetchInboxChats();

            if (data.length === 0) {
                inboxListContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No tienes mensajes.</div>';
                return;
            }

            inboxListContainer.innerHTML = data.map(chat => {
                const isOwner = Number(chat.ownerId) === Number(currentUser?.numberId);
                const displayName = isOwner ? chat.interestedClientName : chat.ownerName;

                const words = displayName.trim().split(' ');
                const initials = words.length > 1
                    ? (words[0][0] + words[1][0]).toUpperCase()
                    : displayName.substring(0, 2).toUpperCase();

                return `
                    <div class="chat-item" data-chat='${JSON.stringify(chat).replace(/'/g, "&apos;")}'>
                        <div class="chat-item-avatar" style="background: var(--primary);">${initials}</div>
                        <div class="chat-item-info">
                            <div class="chat-item-name">${displayName}</div>
                            <div class="chat-item-last-msg">Vehículo: ${chat.vehiclePlate || 'Sin placa'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="chat-item-time"></div>
                        </div>
                    </div>
                `;
            }).join('');

            const chatItems = inboxListContainer.querySelectorAll('.chat-item');
            chatItems.forEach(item => {
                item.addEventListener('click', async () => {
                    const chat = JSON.parse(item.dataset.chat.replace(/&apos;/g, "'"));
                    await openChat(chat);
                });
            });

        } catch (error) {
            console.error('Error obteniendo historial de chat:', error);
            inboxListContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">Error al cargar los mensajes.</div>';
        }
    }

    async function openChat(chat) {
        const activeName = document.getElementById('active-chat-name');
        const activeAvatar = document.getElementById('active-chat-avatar');

        const isOwner = Number(chat.ownerId) === Number(currentUser?.numberId);
        const displayName = isOwner ? chat.interestedClientName : chat.ownerName;
        const words = displayName.trim().split(' ');
        const initials = words.length > 1
            ? (words[0][0] + words[1][0]).toUpperCase()
            : displayName.substring(0, 2).toUpperCase();

        if (activeName) activeName.textContent = displayName;
        if (activeAvatar) {
            activeAvatar.textContent = initials;
            activeAvatar.style.background = 'var(--primary)';
        }

        currentInboxChat = chat;

        inboxListView.style.display = 'none';
        inboxChatView.classList.add('active');

        await renderInboxChatHistory();
        await updateInboxChatAvailability();
    }

    async function renderInboxChatHistory() {
        if (!inboxChatMessages || !currentInboxChat) return;

        const chatHistory = await fetchInboxChatHistory(
            currentInboxChat.vehicleId,
            currentInboxChat.interestedClientId
        );

        inboxChatMessages.innerHTML = '';

        if (!chatHistory.length) {
            return;
        }

        const isOwner = Number(currentUser?.numberId) === Number(currentInboxChat.ownerId);

        for (const message of chatHistory) {
            if (message.question) {
                const questionDiv = document.createElement('div');
                questionDiv.className = isOwner ? 'message-received' : 'message-sent';
                questionDiv.textContent = message.question.content;
                inboxChatMessages.appendChild(questionDiv);
            }

            if (message.answer) {
                const answerDiv = document.createElement('div');
                answerDiv.className = isOwner ? 'message-sent' : 'message-received';
                answerDiv.textContent = message.answer.content;
                inboxChatMessages.appendChild(answerDiv);
            }
        }

        inboxChatMessages.scrollTop = inboxChatMessages.scrollHeight;
    }

    async function updateInboxChatAvailability() {
        const chatInput = document.getElementById('inbox-chat-input');
        const sendMsgBtn = document.getElementById('btn-send-inbox');
        if (!chatInput || !sendMsgBtn || !currentInboxChat) return;

        try {
            const chat = await fetchChatByVehicleAndClient(
                currentInboxChat.vehicleId,
                currentInboxChat.interestedClientId
            );

            if (!chat) return;

            const isOwner = Number(currentUser?.numberId) === Number(currentInboxChat.ownerId);

            if (isOwner) {
                const canWrite = chat.turn === 'owner';
                chatInput.disabled = !canWrite;
                sendMsgBtn.disabled = !canWrite;
                chatInput.placeholder = canWrite
                    ? 'Escribe una respuesta...'
                    : 'Debes esperar a que el cliente escriba';
            } else {
                const canWrite = chat.turn === 'client';
                chatInput.disabled = !canWrite;
                sendMsgBtn.disabled = !canWrite;
                chatInput.placeholder = canWrite
                    ? 'Escribe un mensaje...'
                    : 'Debes esperar a que el vendedor responda';
            }
        } catch (error) {
            console.error('Error actualizando disponibilidad del chat:', error);
        }
    }

    function setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
});