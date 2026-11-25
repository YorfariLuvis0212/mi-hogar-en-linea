// Arrendamientos: listado + acciones de contrato (generar/descargar/subir firmado)

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

let leasesListStatus = 'active';

async function fetchJson(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options });
    const txt = await res.text();
    let data = null;
    try {
        data = JSON.parse(txt);
    } catch (e) {
        data = { success: false, message: 'Respuesta no válida del servidor', raw: txt };
    }
    return { res, data };
}

function formatMoney(value) {
    const n = Number(value || 0);
    return n.toLocaleString('es-CO');
}

async function loadLeases() {
    const container = document.getElementById('leasesList');
    if (!container) return;

    const { data } = await fetchJson(`../api/leases.php?scope=mine&status=${encodeURIComponent(leasesListStatus)}`);
    if (!data.success) {
        container.innerHTML = '<div style="color: var(--gris);">Error al cargar arrendamientos</div>';
        return;
    }

    const leases = data.leases || [];
    if (!leases.length) {
        container.innerHTML = '<div style="text-align:center; color: var(--gris); padding: 30px;">No tienes arrendamientos aún.</div>';
        return;
    }

    container.innerHTML = leases.map(l => {
        const isOwner = Number(l.id_arrendador) === (currentUser?.id ?? -1);
        const counterpartName = isOwner ? l.arrendatario_nombre : l.arrendador_nombre;
        const counterpartEmail = isOwner ? l.arrendatario_email : l.arrendador_email;
        const counterpartPhone = isOwner ? l.arrendatario_telefono : l.arrendador_telefono;

        return `
            <div class="message-item" style="border-left-color: var(--azul-primario);">
                <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                    <div>
                        <div style="font-weight:700; color: var(--azul-primario);">${escapeHtml(l.propiedad_titulo)}</div>
                        <div style="color: var(--gris); font-size: 0.95rem;">${isOwner ? 'Arrendatario' : 'Arrendador'}: ${escapeHtml(counterpartName)} (${escapeHtml(counterpartEmail)})</div>
                        ${counterpartPhone ? `<div style="color: var(--gris); font-size: 0.95rem;">Tel: ${escapeHtml(counterpartPhone)}</div>` : ''}
                        <div style="margin-top: 8px; color: var(--gris-oscuro);">
                            <strong>Canon:</strong> $ ${formatMoney(l.canon_mensual)} COP
                            <br>
                            <strong>Inicio:</strong> ${escapeHtml(l.fecha_inicio)}
                            ${l.fecha_fin ? ` | <strong>Fin:</strong> ${escapeHtml(l.fecha_fin)}` : ''}
                            <br>
                            <strong>Estado:</strong> ${escapeHtml(l.estado)}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; align-items:flex-start; flex-wrap: wrap;">
                        <button class="btn btn-outline" type="button" data-action="contract-status" data-lease-id="${l.id}"><i class="fas fa-info-circle"></i> Estado</button>
                        ${isOwner ? `<button class="btn btn-primario" type="button" data-action="contract-generate" data-lease-id="${l.id}"><i class="fas fa-file-pdf"></i> Generar</button>` : ''}
                        <a class="btn btn-outline" href="../api/contracts.php?action=download_generated&lease_id=${l.id}" target="_blank"><i class="fas fa-download"></i> Descargar</a>
                        <button class="btn btn-secundario" id="uploadBtn_${l.id}" type="button" data-action="contract-upload" data-lease-id="${l.id}"><i class="fas fa-upload"></i> Subir firmado</button>
                        <a class="btn btn-outline" href="../api/contracts.php?action=download_signed&lease_id=${l.id}" target="_blank"><i class="fas fa-file-signature"></i> Firmado</a>
                        ${isOwner && String(l.estado).toLowerCase() === 'activo' ? `<button class="btn btn-outline" type="button" data-action="lease-archive" data-lease-id="${l.id}"><i class="fas fa-archive"></i> Archivar</button>` : ''}
                    </div>
                </div>
                <div id="contractStatus_${l.id}" style="margin-top: 12px; color: var(--gris);">Estado del contrato: (clic en "Estado")</div>
                <input type="file" id="signedFile_${l.id}" accept="application/pdf" style="display:none;" />
            </div>
        `;
    }).join('');

    // Event delegation (evita perder eventos tras re-render)
    if (!container.dataset.boundActions) {
        container.dataset.boundActions = '1';
        container.addEventListener('click', async (e) => {
            const target = e.target?.closest?.('[data-action]');
            if (!target) return;

            const action = target.getAttribute('data-action');
            const leaseId = Number(target.getAttribute('data-lease-id'));
            if (!leaseId) return;

            if (action === 'contract-status') {
                await loadContractStatus(leaseId);
            }

            if (action === 'contract-generate') {
                await generateContract(leaseId);
                await loadContractStatus(leaseId);
            }

            if (action === 'contract-upload') {
                const input = document.getElementById(`signedFile_${leaseId}`);
                if (!input || input.disabled) return;
                input.onchange = async () => {
                    if (!input.files || !input.files[0]) return;
                    await uploadSignedContract(leaseId, input.files[0]);
                    input.value = '';
                    await loadContractStatus(leaseId);
                };
                input.click();
            }

            if (action === 'lease-archive') {
                if (!confirm('¿Archivar este arrendamiento? Quedará en historial y no se eliminará.')) return;
                const { data } = await fetchJson('../api/leases.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'archive', lease_id: leaseId })
                });
                if (!data.success) {
                    alert(data.message || 'Error al archivar');
                    return;
                }
                await loadLeases();
            }
        });
    }

    // pre-cargar estado
    for (const l of leases) {
        loadContractStatus(Number(l.id));
    }
}

async function loadContractStatus(leaseId) {
    const el = document.getElementById(`contractStatus_${leaseId}`);
    if (!el) return;

    el.textContent = 'Cargando estado...';

    let data = null;
    try {
        ({ data } = await fetchJson(`../api/contracts.php?action=status&lease_id=${leaseId}`));
    } catch (err) {
        el.textContent = 'Error de red al cargar estado';
        console.error(err);
        return;
    }

    if (!data || !data.success) {
        const raw = (data && data.raw) ? String(data.raw).slice(0, 200) : '';
        el.textContent = (data && data.message) ? data.message : 'Error al cargar estado';
        if (raw) {
            el.textContent += `: ${raw}`;
        }
        return;
    }

    try {
        const c = data.contract;
        const estado = c?.contrato_estado || c?.estado || 'borrador';
        el.innerHTML = `<strong>Contrato:</strong> ${escapeHtml(estado)}`;

        const uploadBtn = document.getElementById(`uploadBtn_${leaseId}`);
        const fileInput = document.getElementById(`signedFile_${leaseId}`);
        if (String(estado).toLowerCase() === 'firmado') {
            if (uploadBtn) uploadBtn.style.display = 'none';
            if (fileInput) fileInput.disabled = true;
        } else {
            if (uploadBtn) uploadBtn.style.display = '';
            if (fileInput) fileInput.disabled = false;
        }
    } catch (err) {
        el.textContent = 'Error al mostrar estado';
        console.error(err);
    }
}

async function generateContract(leaseId) {
    try {
        const res = await fetch('../api/contracts.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generate', lease_id: leaseId }),
            credentials: 'include'
        });

        const txt = await res.text();
        let data = null;
        try {
            data = JSON.parse(txt);
        } catch (e) {
            alert('Error al generar contrato. Respuesta no válida del servidor.\n\n' + txt.slice(0, 300));
            return;
        }

        if (!res.ok || !data?.success) {
            alert(data?.message || `Error al generar contrato (HTTP ${res.status})`);
            return;
        }

        alert('Contrato generado. Ya puedes descargarlo.');
    } catch (err) {
        alert('Error de red al generar contrato. Revisa la consola para más detalle.');
        console.error(err);
    }
}

async function uploadSignedContract(leaseId, file) {
    const form = new FormData();
    form.append('action', 'upload_signed');
    form.append('lease_id', String(leaseId));
    form.append('signed_pdf', file);

    const res = await fetch('../api/contracts.php', {
        method: 'POST',
        body: form,
        credentials: 'include'
    });

    const data = await res.json();
    if (!data.success) {
        alert(data.message || 'Error al subir firmado');
        return;
    }

    alert('Contrato firmado subido.');
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof loadUserInfo === 'function') {
        await loadUserInfo();
    }

    document.getElementById('showActiveLeases')?.addEventListener('click', async () => {
        leasesListStatus = 'active';
        await loadLeases();
    });
    document.getElementById('showArchivedLeases')?.addEventListener('click', async () => {
        leasesListStatus = 'archived';
        await loadLeases();
    });

    await loadLeases();
});
