// Chat del dashboard: conversaciones, mensajes (long-polling) y crear arrendamiento

let chatState = {
    conversations: [],
    activeConversationId: null,
    activeConversationMeta: null,
    lastMessageId: 0,
    polling: false,
    stopPolling: false,
    listRefreshLock: false
};

let chatListStatus = 'active';

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options });
    const data = await res.json();
    return { res, data };
}

function renderConversations() {
    const el = document.getElementById('conversationsList');
    if (!el) return;

    if (!chatState.conversations || chatState.conversations.length === 0) {
        el.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 20px;">Sin conversaciones</div>';
        return;
    }

    el.innerHTML = chatState.conversations.map(c => {
        const active = chatState.activeConversationId === Number(c.id);
        const title = `${c.propiedad_titulo}`;
        const subtitle = (Number(c.id_arrendador) === (currentUser?.id ?? -1))
            ? `Arrendatario: ${c.arrendatario_nombre}`
            : `Arrendador: ${c.arrendador_nombre}`;

        const border = active ? 'border-left: 4px solid var(--verde);' : 'border-left: 4px solid var(--azul-primario);';
        return `
            <button type="button" data-conv-id="${c.id}" class="message-item" style="text-align:left; cursor:pointer; ${border}">
                <div style="display:flex; justify-content: space-between; gap: 10px; align-items:center;">
                    <div>
                        <div style="font-weight: 700; color: var(--azul-primario);">${escapeHtml(title)}</div>
                        <div style="font-size: 0.9rem; color: var(--gris);">${escapeHtml(subtitle)}</div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--gris);">#${c.id}</div>
                </div>
            </button>
        `;
    }).join('');

    el.querySelectorAll('button[data-conv-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = Number(btn.getAttribute('data-conv-id'));
            await openConversation(id);
        });
    });
}

function renderMessages(messages, append = true) {
    const box = document.getElementById('messagesBox');
    if (!box) return;

    if (!append) {
        box.innerHTML = '';
    }

    for (const m of messages) {
        const mine = Number(m.id_remitente) === (currentUser?.id ?? -1);
        const align = mine ? 'flex-end' : 'flex-start';
        const bg = mine ? 'var(--azul-primario)' : 'var(--blanco)';
        const color = mine ? 'var(--blanco)' : 'var(--gris-oscuro)';

        box.insertAdjacentHTML('beforeend', `
            <div style="display:flex; justify-content:${align}; margin: 6px 0;">
                <div style="max-width: 75%; background:${bg}; color:${color}; padding:10px 12px; border-radius: 10px; box-shadow: var(--sombra);">
                    <div style="font-size: 0.85rem; opacity: 0.85; margin-bottom: 4px;">${escapeHtml(m.remitente_nombre)}</div>
                    <div style="white-space: pre-wrap;">${escapeHtml(m.mensaje)}</div>
                </div>
            </div>
        `);
    }

    box.scrollTop = box.scrollHeight;
}

async function loadConversations() {
    if (chatState.listRefreshLock) return;
    const { data } = await fetchJson(`../api/chat.php?action=list&status=${encodeURIComponent(chatListStatus)}`);
    if (data.success) {
        chatState.conversations = data.conversations || [];
        renderConversations();

        // Auto-seleccionar primera si no hay activa
        if (!chatState.activeConversationId && chatState.conversations.length > 0) {
            await openConversation(Number(chatState.conversations[0].id));
        }
    } else {
        document.getElementById('conversationsList').innerHTML = '<div style="color: var(--gris);">Error al cargar conversaciones</div>';
    }
}

async function openConversation(conversationId) {
    chatState.activeConversationId = conversationId;
    chatState.activeConversationMeta = chatState.conversations.find(c => Number(c.id) === Number(conversationId)) || null;
    chatState.lastMessageId = 0;
    chatState.stopPolling = true;

    renderConversations();

    const header = document.getElementById('chatHeader');
    if (header && chatState.activeConversationMeta) {
        header.innerHTML = `
            <div><strong>Propiedad:</strong> ${escapeHtml(chatState.activeConversationMeta.propiedad_titulo)}</div>
            <div><strong>Participantes:</strong> ${escapeHtml(chatState.activeConversationMeta.arrendador_nombre)} - ${escapeHtml(chatState.activeConversationMeta.arrendatario_nombre)}</div>
        `;
    }

    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendMessageBtn').disabled = false;

    // Habilitar crear arrendamiento solo si soy el arrendador
    const createLeaseBtn = document.getElementById('createLeaseBtn');
    if (createLeaseBtn && chatState.activeConversationMeta) {
        const isOwner = Number(chatState.activeConversationMeta.id_arrendador) === (currentUser?.id ?? -1);
        createLeaseBtn.disabled = !isOwner;
    }

    const archiveBtn = document.getElementById('archiveConversationBtn');
    if (archiveBtn && chatState.activeConversationMeta) {
        const isArchived = (chatState.activeConversationMeta.estado && String(chatState.activeConversationMeta.estado).toLowerCase() !== 'activa');
        archiveBtn.disabled = false;
        archiveBtn.innerHTML = isArchived
            ? '<i class="fas fa-box-open"></i> Desarchivar'
            : '<i class="fas fa-archive"></i> Archivar';
    }

    // cargar historial inicial
    const box = document.getElementById('messagesBox');
    box.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 20px;">Cargando mensajes...</div>';

    const { data } = await fetchJson(`../api/chat.php?action=messages&conversation_id=${conversationId}&since_id=0&timeout=0`);
    if (data.success) {
        const msgs = data.messages || [];
        box.innerHTML = '';
        renderMessages(msgs, true);
        chatState.lastMessageId = msgs.length ? Number(msgs[msgs.length - 1].id) : 0;
    } else {
        box.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 20px;">Error al cargar mensajes</div>';
        return;
    }

    // arrancar long-poll
    chatState.stopPolling = false;
    startPolling();
}

async function startPolling() {
    if (chatState.polling) return;
    chatState.polling = true;

    while (!chatState.stopPolling) {
        const cid = chatState.activeConversationId;
        if (!cid) break;

        try {
            const url = `../api/chat.php?action=messages&conversation_id=${cid}&since_id=${chatState.lastMessageId}&timeout=10`;
            const { data } = await fetchJson(url);
            if (data.success) {
                const msgs = data.messages || [];
                if (msgs.length) {
                    renderMessages(msgs, true);
                    chatState.lastMessageId = Number(msgs[msgs.length - 1].id);
                    // actualizar lista con menos frecuencia (evita recargar pesado)
                    chatState.listRefreshLock = true;
                    setTimeout(() => {
                        chatState.listRefreshLock = false;
                        loadConversations();
                    }, 2500);
                }
            }
        } catch (e) {
            // backoff
            await new Promise(r => setTimeout(r, 900));
        }
    }

    chatState.polling = false;
}

async function sendMessage(text) {
    if (!chatState.activeConversationId) return;

    const payload = {
        action: 'send',
        conversation_id: chatState.activeConversationId,
        message: text
    };

    const { data } = await fetchJson('../api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!data.success) {
        alert(data.message || 'Error al enviar');
    }
}

async function loadPropertiesForChat() {
    const select = document.getElementById('chatProperty');
    if (!select) return;

    const { data } = await fetchJson('../api/properties.php');
    if (!data.success) {
        select.innerHTML = '<option value="">Error al cargar</option>';
        return;
    }

    const props = (data.properties || []).filter(p => p.estado === 'disponible' || p.estado === 'arrendada');
    if (!props.length) {
        select.innerHTML = '<option value="">No tienes propiedades</option>';
        return;
    }

    select.innerHTML = '<option value="">Selecciona...</option>' + props.map(p => `<option value="${p.id}">${escapeHtml(p.titulo)}</option>`).join('');
}

async function startConversation(propertyId, tenantEmail) {
    const { data: lookup } = await fetchJson(`../api/users_lookup.php?email=${encodeURIComponent(tenantEmail)}`);
    if (!lookup.success) {
        alert(lookup.message || 'No se encontró el usuario');
        return;
    }

    const payload = {
        action: 'start',
        property_id: Number(propertyId),
        tenant_user_id: Number(lookup.user.id)
    };

    const { data } = await fetchJson('../api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (data.success) {
        await loadConversations();
        await openConversation(Number(data.conversation_id));
    } else {
        alert(data.message || 'Error al iniciar conversación');
    }
}

function openLeaseModal() {
    document.getElementById('leaseModal').style.display = 'block';

    const inicio = document.getElementById('fechaInicio');
    const fin = document.getElementById('fechaFin');
    const indef = document.getElementById('fechaFinIndefinida');
    if (inicio) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;
        inicio.min = iso;
        if (!inicio.value) inicio.value = iso;
    }

    if (indef && fin) {
        fin.disabled = indef.checked;
        fin.required = !indef.checked;
        if (indef.checked) fin.value = '';
    }
}

function closeLeaseModal() {
    document.getElementById('leaseModal').style.display = 'none';
}

async function createLeaseFromConversation(canon, inicio, fin) {
    const payload = {
        conversation_id: chatState.activeConversationId,
        canon_mensual: Number(canon),
        fecha_inicio: inicio,
        fecha_fin: fin || null
    };

    const { data } = await fetchJson('../api/leases.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (data.success) {
        closeLeaseModal();
        alert('Arrendamiento creado. Ahora puedes ir a Arrendamientos para generar el contrato.');
    } else {
        alert(data.message || 'Error al crear arrendamiento');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof loadUserInfo === 'function') {
        await loadUserInfo();
    }

    await Promise.all([
        loadPropertiesForChat(),
        loadConversations()
    ]);

    document.getElementById('showActiveConversations')?.addEventListener('click', async () => {
        chatListStatus = 'active';
        chatState.activeConversationId = null;
        await loadConversations();
    });

    document.getElementById('showArchivedConversations')?.addEventListener('click', async () => {
        chatListStatus = 'archived';
        chatState.activeConversationId = null;
        await loadConversations();
    });

    document.getElementById('archiveConversationBtn')?.addEventListener('click', async () => {
        if (!chatState.activeConversationId || !chatState.activeConversationMeta) return;
        const isArchived = (chatState.activeConversationMeta.estado && String(chatState.activeConversationMeta.estado).toLowerCase() !== 'activa');
        const action = isArchived ? 'unarchive' : 'archive';

        const { data } = await fetchJson('../api/chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, conversation_id: chatState.activeConversationId })
        });

        if (!data.success) {
            alert(data.message || 'Error al actualizar conversación');
            return;
        }

        // refresh list and current meta
        await loadConversations();
        const updated = chatState.conversations.find(c => Number(c.id) === Number(chatState.activeConversationId)) || null;
        chatState.activeConversationMeta = updated;
        const archiveBtn = document.getElementById('archiveConversationBtn');
        if (archiveBtn && updated) {
            const nowArchived = (updated.estado && String(updated.estado).toLowerCase() !== 'activa');
            archiveBtn.innerHTML = nowArchived
                ? '<i class="fas fa-box-open"></i> Desarchivar'
                : '<i class="fas fa-archive"></i> Archivar';
        }
    });

    document.getElementById('sendMessageForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('messageInput');
        const text = (input.value || '').trim();
        if (!text) return;
        input.value = '';
        await sendMessage(text);
    });

    document.getElementById('startConversationForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const propertyId = document.getElementById('chatProperty').value;
        const email = (document.getElementById('tenantEmail').value || '').trim();
        if (!propertyId || !email) return;
        await startConversation(propertyId, email);
    });

    document.getElementById('createLeaseBtn')?.addEventListener('click', () => {
        openLeaseModal();
    });

    document.getElementById('closeLeaseModal')?.addEventListener('click', () => {
        closeLeaseModal();
    });

    document.getElementById('leaseModal')?.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'leaseModal') closeLeaseModal();
    });

    document.getElementById('createLeaseForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const canon = document.getElementById('canonMensual').value;
        const inicio = document.getElementById('fechaInicio').value;
        const indef = document.getElementById('fechaFinIndefinida')?.checked;
        const fin = indef ? '' : document.getElementById('fechaFin').value;

        if (!inicio) {
            alert('Fecha inicio es requerida');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inicioDate = new Date(`${inicio}T00:00:00`);
        if (inicioDate < today) {
            alert('La fecha de inicio debe ser hoy o una fecha futura');
            return;
        }
        if (!indef && fin) {
            const finDate = new Date(`${fin}T00:00:00`);
            if (finDate < inicioDate) {
                alert('La fecha fin no puede ser menor a la fecha inicio');
                return;
            }
        }
        await createLeaseFromConversation(canon, inicio, fin);
    });

    document.getElementById('fechaFinIndefinida')?.addEventListener('change', (e) => {
        const fin = document.getElementById('fechaFin');
        if (!fin) return;
        fin.disabled = e.target.checked;
        fin.required = !e.target.checked;
        if (e.target.checked) fin.value = '';
    });
});
