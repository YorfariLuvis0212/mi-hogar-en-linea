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

if (($_SESSION['user_rol'] ?? 'user') !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Sin permisos"]);
    exit;
}

include_once '../config/database.php';

$database = new Database();
$pdo = $database->getConnection();

function respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';

        if ($action === 'users') {
            $stmt = $pdo->query("SELECT id, nombre, email, telefono, whatsapp, rol, fecha_registro, activo FROM usuarios ORDER BY id DESC");
            respond(200, ["success" => true, "users" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'properties') {
            $stmt = $pdo->query(
                "SELECT p.*, u.nombre AS propietario_nombre, u.email AS propietario_email
                 FROM propiedades p
                 INNER JOIN usuarios u ON u.id = p.id_usuario
                 ORDER BY p.fecha_publicacion DESC"
            );
            respond(200, ["success" => true, "properties" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'leases') {
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
            respond(200, ["success" => true, "leases" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'contracts') {
            $stmt = $pdo->query(
                "SELECT c.*, a.id_propiedad, a.id_arrendador, a.id_arrendatario
                 FROM contratos c
                 INNER JOIN arrendamientos a ON a.id = c.id_arrendamiento
                 ORDER BY c.id DESC"
            );
            respond(200, ["success" => true, "contracts" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        respond(400, ["success" => false, "message" => "Acción no válida"]);
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            respond(400, ["success" => false, "message" => "JSON inválido"]);
        }

        $action = $data['action'] ?? '';

        if ($action === 'set_role') {
            $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
            $rol = $data['rol'] ?? '';
            if ($user_id <= 0 || !in_array($rol, ['user', 'super_admin'], true)) {
                respond(400, ["success" => false, "message" => "Datos inválidos"]);
            }

            $stmt = $pdo->prepare("UPDATE usuarios SET rol = :rol WHERE id = :id");
            $stmt->execute([":rol" => $rol, ":id" => $user_id]);
            respond(200, ["success" => true]);
        }

        respond(400, ["success" => false, "message" => "Acción no válida"]);
    }

    respond(405, ["success" => false, "message" => "Método no permitido"]);
} catch (PDOException $e) {
    respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
}
