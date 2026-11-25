// Super Admin: ver usuarios/propiedades/arrendamientos/contratos y cambiar roles

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

async function loadTab(tab) {
    const container = document.getElementById('adminContent');
    container.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 30px;"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

    const { data } = await fetchJson(`../api/admin.php?action=${encodeURIComponent(tab)}`);
    if (!data.success) {
        container.innerHTML = `<div style="color: var(--gris);">${escapeHtml(data.message || 'Error')}</div>`;
        return;
    }

    if (tab === 'users') {
        renderUsers(data.users || []);
        return;
    }
    if (tab === 'properties') {
        renderProperties(data.properties || []);
        return;
    }
    if (tab === 'leases') {
        renderLeases(data.leases || []);
        return;
    }
    if (tab === 'contracts') {
        renderContracts(data.contracts || []);
        return;
    }

    container.innerHTML = '<div style="color: var(--gris);">Tab no válida</div>';
}

function renderUsers(users) {
    const container = document.getElementById('adminContent');
    if (!users.length) {
        container.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 30px;">Sin usuarios</div>';
        return;
    }

    container.innerHTML = `
        <div style="overflow:auto;">
            <table style="width:100%; border-collapse: collapse; background: var(--blanco); border-radius: 10px; overflow:hidden; box-shadow: var(--sombra);">
                <thead>
                    <tr style="background: var(--beige); text-align:left;">
                        <th style="padding: 12px;">ID</th>
                        <th style="padding: 12px;">Nombre</th>
                        <th style="padding: 12px;">Email</th>
                        <th style="padding: 12px;">Rol</th>
                        <th style="padding: 12px;">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr style="border-top: 1px solid #e2e8f0;">
                            <td style="padding: 12px;">${u.id}</td>
                            <td style="padding: 12px;">${escapeHtml(u.nombre)}</td>
                            <td style="padding: 12px;">${escapeHtml(u.email)}</td>
                            <td style="padding: 12px;">
                                <select data-user-id="${u.id}" class="form-control" style="max-width: 180px;">
                                    <option value="user" ${u.rol === 'user' ? 'selected' : ''}>user</option>
                                    <option value="super_admin" ${u.rol === 'super_admin' ? 'selected' : ''}>super_admin</option>
                                </select>
                            </td>
                            <td style="padding: 12px;">
                                <button class="btn btn-primario" data-action="save-role" data-user-id="${u.id}"><i class="fas fa-save"></i> Guardar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('[data-action="save-role"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = Number(btn.getAttribute('data-user-id'));
            const sel = container.querySelector(`select[data-user-id="${userId}"]`);
            const rol = sel.value;

            const { data } = await fetchJson('../api/admin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'set_role', user_id: userId, rol })
            });

            if (!data.success) {
                alert(data.message || 'Error al guardar rol');
                return;
            }

            alert('Rol actualizado');
        });
    });
}

function renderProperties(properties) {
    const container = document.getElementById('adminContent');
    if (!properties.length) {
        container.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 30px;">Sin propiedades</div>';
        return;
    }

    container.innerHTML = properties.map(p => `
        <div class="message-item" style="border-left-color: var(--azul-primario);">
            <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div>
                    <div style="font-weight:700; color: var(--azul-primario);">${escapeHtml(p.titulo)}</div>
                    <div style="color: var(--gris);">Propietario: ${escapeHtml(p.propietario_nombre)} (${escapeHtml(p.propietario_email)})</div>
                    <div style="margin-top: 6px;"><strong>Estado:</strong> ${escapeHtml(p.estado)}</div>
                    <div><strong>Precio:</strong> $ ${escapeHtml(p.precio)}</div>
                </div>
                <div style="color: var(--gris);">#${p.id}</div>
            </div>
        </div>
    `).join('');
}

function renderLeases(leases) {
    const container = document.getElementById('adminContent');
    if (!leases.length) {
        container.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 30px;">Sin arrendamientos</div>';
        return;
    }

    container.innerHTML = leases.map(l => `
        <div class="message-item" style="border-left-color: var(--verde);">
            <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div>
                    <div style="font-weight:700; color: var(--azul-primario);">${escapeHtml(l.propiedad_titulo)}</div>
                    <div style="color: var(--gris);">Arrendador: ${escapeHtml(l.arrendador_nombre)} (${escapeHtml(l.arrendador_email)})</div>
                    <div style="color: var(--gris);">Arrendatario: ${escapeHtml(l.arrendatario_nombre)} (${escapeHtml(l.arrendatario_email)})</div>
                    <div style="margin-top: 6px;"><strong>Canon:</strong> ${escapeHtml(l.canon_mensual)} | <strong>Inicio:</strong> ${escapeHtml(l.fecha_inicio)} | <strong>Estado:</strong> ${escapeHtml(l.estado)}</div>
                </div>
                <div style="color: var(--gris);">#${l.id}</div>
            </div>
        </div>
    `).join('');
}

function renderContracts(contracts) {
    const container = document.getElementById('adminContent');
    if (!contracts.length) {
        container.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 30px;">Sin contratos</div>';
        return;
    }

    container.innerHTML = contracts.map(c => `
        <div class="message-item" style="border-left-color: var(--gris);">
            <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div>
                    <div style="font-weight:700; color: var(--azul-primario);">Contrato #${c.id}</div>
                    <div style="color: var(--gris);"><strong>Arrendamiento:</strong> #${c.id_arrendamiento}</div>
                    <div style="margin-top: 6px;"><strong>Estado:</strong> ${escapeHtml(c.estado)}</div>
                    <div style="color: var(--gris);"><strong>Generado:</strong> ${c.archivo_generado ? escapeHtml(c.archivo_generado) : '-'}</div>
                    <div style="color: var(--gris);"><strong>Firmado:</strong> ${c.archivo_firmado ? escapeHtml(c.archivo_firmado) : '-'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('[data-admin-tab]')?.forEach(btn => {
        btn.addEventListener('click', async () => {
            const tab = btn.getAttribute('data-admin-tab');
            await loadTab(tab);
        });
    });

    await loadTab('users');
});
