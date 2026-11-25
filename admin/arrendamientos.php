<?php
$pageTitle = 'Arrendamientos';
require_once 'includes/header.php';
?>

<div class="section-content active">
    <div class="dashboard-header">
        <div style="display:flex; align-items:center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <h2 style="margin:0;">Arrendamientos</h2>
            <div style="display:flex; gap:8px; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.9rem;" type="button" id="showActiveLeases">Activos</button>
                <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.9rem;" type="button" id="showArchivedLeases">Archivados</button>
            </div>
        </div>
    </div>

    <div class="form-container">
        <div class="form-header">
            <h3><i class="fas fa-file-contract"></i> Mis arrendamientos</h3>
        </div>
        <div id="leasesList">
            <div style="text-align: center; padding: 40px; color: var(--gris);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
                <p style="margin-top: 15px;">Cargando...</p>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
