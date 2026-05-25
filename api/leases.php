<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autenticado"]);
    exit;
}

include_once '../config/database.php';

$database = new Database();
$pdo = $database->getConnection();
$user_id = (int)$_SESSION['user_id'];

function respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $scope = $_GET['scope'] ?? 'mine';
    $status = $_GET['status'] ?? 'active'; // active|archived|all

    try {
        if ($scope === 'mine') {
            $whereStatus = '';
            if ($status === 'active') {
                $whereStatus = " AND a.estado = 'activo'";
            } elseif ($status === 'archived') {
                $whereStatus = " AND a.estado <> 'activo'";
            }

            $stmt = $pdo->prepare(
                "SELECT a.*, p.titulo AS propiedad_titulo,
                        u1.nombre AS arrendador_nombre, u1.email AS arrendador_email, u1.telefono AS arrendador_telefono,
                        u2.nombre AS arrendatario_nombre, u2.email AS arrendatario_email, u2.telefono AS arrendatario_telefono
                 FROM arrendamientos a
                 INNER JOIN propiedades p ON p.id = a.id_propiedad
                 INNER JOIN usuarios u1 ON u1.id = a.id_arrendador
                 INNER JOIN usuarios u2 ON u2.id = a.id_arrendatario
                 WHERE (a.id_arrendador = :uid OR a.id_arrendatario = :uid)" . $whereStatus . "
                 ORDER BY a.fecha_creacion DESC"
            );
            $stmt->execute([":uid" => $user_id]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(200, ["success" => true, "leases" => $rows]);
        }

        if ($scope === 'super_admin') {
            if (($_SESSION['user_rol'] ?? 'user') !== 'super_admin') {
                respond(403, ["success" => false, "message" => "Sin permisos"]);
            }
            $stmt = $pdo->query(
                "SELECT a.*, p.titulo AS propiedad_titulo,
                        u1.nombre AS arrendador_nombre, u1.email AS arrendador_email,
                        u2.nombre AS arrendatario_nombre, u2.email AS arrendatario_email
                 FROM arrendamientos a
                 INNER JOIN propiedades p ON p.id = a.id_propiedad
                 INNER JOIN usuarios u1 ON u1.id = a.id_arrendador
                 INNER JOIN usuarios u2 ON u2.id = a.id_arrendatario
                 ORDER BY a.fecha_creacion DESC"
            );
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(200, ["success" => true, "leases" => $rows]);
        }

        respond(400, ["success" => false, "message" => "scope no válido"]);
    } catch (PDOException $e) {
        respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        respond(400, ["success" => false, "message" => "JSON inválido"]);
    }

    // Archive/disable actions
    if (!empty($data['action']) && in_array($data['action'], ['archive', 'disable'], true)) {
        $lease_id = isset($data['lease_id']) ? (int)$data['lease_id'] : 0;
        if ($lease_id <= 0) {
            respond(400, ["success" => false, "message" => "lease_id requerido"]);
        }

        try {
            $stmt = $pdo->prepare("SELECT * FROM arrendamientos WHERE id = :lid");
            $stmt->execute([":lid" => $lease_id]);
            $lease = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$lease) {
                respond(404, ["success" => false, "message" => "Arrendamiento no encontrado"]);
            }
            if ((int)$lease['id_arrendador'] !== $user_id) {
                respond(403, ["success" => false, "message" => "Solo el propietario puede archivar/desactivar"]);
            }

            // We keep history by updating estado instead of deleting.
            $newStatus = ($data['action'] === 'disable') ? 'cancelado' : 'finalizado';
            $stmt = $pdo->prepare("UPDATE arrendamientos SET estado = :st WHERE id = :lid");
            $stmt->execute([":st" => $newStatus, ":lid" => $lease_id]);
            respond(200, ["success" => true, "message" => "Arrendamiento actualizado", "estado" => $newStatus]);
        } catch (PDOException $e) {
            respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    $conversation_id = isset($data['conversation_id']) ? (int)$data['conversation_id'] : 0;
    $canon_mensual = isset($data['canon_mensual']) ? (float)$data['canon_mensual'] : 0;
    $fecha_inicio = $data['fecha_inicio'] ?? '';
    $fecha_fin = $data['fecha_fin'] ?? null;

    if ($conversation_id <= 0 || $canon_mensual <= 0 || !$fecha_inicio) {
        respond(400, ["success" => false, "message" => "Datos incompletos"]);
    }

    // Validación de fechas
    $inicio_dt = DateTime::createFromFormat('Y-m-d', $fecha_inicio);
    if (!$inicio_dt || $inicio_dt->format('Y-m-d') !== $fecha_inicio) {
        respond(400, ["success" => false, "message" => "fecha_inicio inválida"]);
    }

    $today = new DateTime('today');
    if ($inicio_dt < $today) {
        respond(400, ["success" => false, "message" => "La fecha de inicio debe ser hoy o una fecha futura"]);
    }

    if ($fecha_fin === '' || $fecha_fin === null) {
        $fecha_fin = null;
    } else {
        $fin_dt = DateTime::createFromFormat('Y-m-d', (string)$fecha_fin);
        if (!$fin_dt || $fin_dt->format('Y-m-d') !== (string)$fecha_fin) {
            respond(400, ["success" => false, "message" => "fecha_fin inválida"]);
        }
        if ($fin_dt < $inicio_dt) {
            respond(400, ["success" => false, "message" => "La fecha fin no puede ser menor a la fecha inicio"]);
        }
    }

    try {
        // Verify conversation and that current user is the arrendador
        $stmt = $pdo->prepare(
            "SELECT c.*, p.id_usuario AS propietario_id
             FROM conversaciones c
             INNER JOIN propiedades p ON p.id = c.id_propiedad
             WHERE c.id = :cid"
        );
        $stmt->execute([":cid" => $conversation_id]);
        $conv = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$conv) {
            respond(404, ["success" => false, "message" => "Conversación no encontrada"]);
        }
        if ((int)$conv['propietario_id'] !== $user_id || (int)$conv['id_arrendador'] !== $user_id) {
            respond(403, ["success" => false, "message" => "Solo el propietario puede crear el arrendamiento"]);
        }

        $property_id = (int)$conv['id_propiedad'];
        $tenant_id = (int)$conv['id_arrendatario'];

        // Prevent duplicate active lease for same property+tenant
        $stmt = $pdo->prepare(
            "SELECT id FROM arrendamientos
             WHERE id_propiedad = :pid AND id_arrendador = :aid AND id_arrendatario = :tid AND estado = 'activo'
             LIMIT 1"
        );
        $stmt->execute([":pid" => $property_id, ":aid" => $user_id, ":tid" => $tenant_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            respond(200, ["success" => true, "lease_id" => (int)$existing['id'], "message" => "Arrendamiento ya existe"]);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO arrendamientos (id_propiedad, id_arrendador, id_arrendatario, canon_mensual, fecha_inicio, fecha_fin)
             VALUES (:pid, :aid, :tid, :canon, :inicio, :fin)"
        );
        $stmt->execute([
            ":pid" => $property_id,
            ":aid" => $user_id,
            ":tid" => $tenant_id,
            ":canon" => $canon_mensual,
            ":inicio" => $fecha_inicio,
            ":fin" => $fecha_fin
        ]);

        $new_lease_id = (int)$pdo->lastInsertId();
        // Ensure contract row exists (borrador)
        $stmt = $pdo->prepare("INSERT INTO contratos (id_arrendamiento, estado) VALUES (:lid, 'borrador')");
        $stmt->execute([":lid" => $new_lease_id]);

        // Mark property as rented
        $pdo->prepare("UPDATE propiedades SET estado = 'arrendada' WHERE id = :pid AND id_usuario = :uid")
            ->execute([":pid" => $property_id, ":uid" => $user_id]);

        respond(201, ["success" => true, "lease_id" => $new_lease_id, "message" => "Arrendamiento creado"]);
    } catch (PDOException $e) {
        respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

respond(405, ["success" => false, "message" => "Método no permitido"]);
