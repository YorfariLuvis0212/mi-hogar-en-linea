<?php
$pageTitle = 'Chat';
require_once 'includes/header.php';
?>

<div class="section-content active">
    <div class="dashboard-header">
        <h2>Chat</h2>
    </div>

    <div class="form-container" style="margin-bottom: 20px;">
        <div class="form-header">
            <h3><i class="fas fa-comments"></i> Iniciar conversación</h3>
        </div>

        <form id="startConversationForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="chatProperty">Propiedad *</label>
                    <select id="chatProperty" class="form-control" required>
                        <option value="">Cargando...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tenantEmail">Email del arrendatario *</label>
                    <input type="email" id="tenantEmail" class="form-control" placeholder="arrendatario@email.com" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primario" id="startConversationBtn"><i class="fas fa-paper-plane"></i> Iniciar</button>
            </div>
        </form>
    </div>

    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px;">
        <div class="form-container" style="height: 600px; overflow-y: auto; overflow-x: hidden;">
            <div class="form-header">
                <div style="display:flex; align-items:center; justify-content: space-between; gap: 10px; width: 100%;">
                    <h3 style="margin:0;"><i class="fas fa-inbox"></i> Conversaciones</h3>
                    <div style="display:flex; gap:8px; flex-wrap: wrap; justify-content: flex-end;">
                        <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.9rem;" type="button" id="showActiveConversations">Activas</button>
                        <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.9rem;" type="button" id="showArchivedConversations">Archivadas</button>
                    </div>
                </div>
            </div>
            <div id="conversationsList" style="display: flex; flex-direction: column; gap: 10px;"></div>
        </div>

        <div class="form-container" style="height: 600px; display: flex; flex-direction: column;">
            <div class="form-header" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <h3 style="margin: 0;"><i class="fas fa-comment-dots"></i> Mensajes</h3>
                <div style="display:flex; gap: 8px;">
                    <button class="btn btn-outline" id="archiveConversationBtn" type="button" disabled><i class="fas fa-archive"></i> Archivar</button>
                    <button class="btn btn-outline" id="createLeaseBtn" type="button" disabled><i class="fas fa-file-signature"></i> Crear arrendamiento</button>
                </div>
            </div>

            <div id="chatHeader" style="color: var(--gris); margin-bottom: 10px; font-size: 0.95rem;"></div>

            <div id="messagesBox" style="flex: 1; overflow: auto; background: var(--beige); border-radius: 8px; padding: 12px;">
                <div style="text-align:center; color: var(--gris); padding: 30px;">Selecciona una conversación</div>
            </div>

            <form id="sendMessageForm" style="display: flex; gap: 10px; margin-top: 12px;">
                <input type="text" id="messageInput" class="form-control" placeholder="Escribe un mensaje..." disabled>
                <button class="btn btn-primario" id="sendMessageBtn" type="submit" disabled><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    </div>
</div>

<div id="leaseModal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); padding: 30px; z-index: 9999;">
    <div class="form-container" style="max-width: 560px; margin: 0 auto;">
        <div class="form-header" style="display:flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;"><i class="fas fa-file-contract"></i> Crear arrendamiento</h3>
            <button class="btn btn-outline" id="closeLeaseModal" type="button">Cerrar</button>
        </div>
        <form id="createLeaseForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="canonMensual">Canon mensual (COP) *</label>
                    <input type="number" id="canonMensual" class="form-control" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="fechaInicio">Fecha inicio *</label>
                    <input type="date" id="fechaInicio" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="display:flex; align-items:center; gap: 10px;">
                    <input type="checkbox" id="fechaFinIndefinida">
                    <label for="fechaFinIndefinida" style="margin:0;">Fecha fin indefinida</label>
                </div>
                <div class="form-group">
                    <label for="fechaFin">Fecha fin</label>
                    <input type="date" id="fechaFin" class="form-control">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primario" id="createLeaseSubmit"><i class="fas fa-check"></i> Crear</button>
            </div>
        </form>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
