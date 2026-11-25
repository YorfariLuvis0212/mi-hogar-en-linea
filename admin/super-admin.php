<?php
$pageTitle = 'Super Admin';
require_once 'includes/header.php';

if (!isset($_SESSION['user_rol']) || $_SESSION['user_rol'] !== 'super_admin') {
    header('Location: dashboard.php');
    exit();
}
?>

<div class="section-content active">
    <div class="dashboard-header">
        <h2>Super Admin</h2>
    </div>

    <div class="form-container">
        <div class="form-header">
            <h3><i class="fas fa-shield-alt"></i> Panel global</h3>
        </div>

        <div style="display:flex; gap:10px; flex-wrap: wrap; margin-bottom: 15px;">
            <button class="btn btn-outline" type="button" data-admin-tab="users"><i class="fas fa-users"></i> Usuarios</button>
            <button class="btn btn-outline" type="button" data-admin-tab="properties"><i class="fas fa-home"></i> Propiedades</button>
            <button class="btn btn-outline" type="button" data-admin-tab="leases"><i class="fas fa-handshake"></i> Arrendamientos</button>
            <button class="btn btn-outline" type="button" data-admin-tab="contracts"><i class="fas fa-file-signature"></i> Contratos</button>
        </div>

        <div id="adminContent"></div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
