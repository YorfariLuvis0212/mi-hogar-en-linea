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

$method = $_SERVER['REQUEST_METHOD'];

function respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function require_fields($data, $fields) {
    foreach ($fields as $f) {
        if (!isset($data[$f]) || $data[$f] === '' || $data[$f] === null) {
            return $f;
        }
    }
    return null;
}

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';
    $status = $_GET['status'] ?? 'active'; // active|archived|all

    try {
        if ($action === 'list') {
            $whereStatus = '';
            if ($status === 'active') {
                $whereStatus = " AND c.estado = 'activa'";
            } elseif ($status === 'archived') {
                $whereStatus = " AND c.estado <> 'activa'";
            }

            $stmt = $pdo->prepare(
                "SELECT c.*, p.titulo AS propiedad_titulo,
                        u1.nombre AS arrendador_nombre, u2.nombre AS arrendatario_nombre
                 FROM conversaciones c
                 INNER JOIN propiedades p ON p.id = c.id_propiedad
                 INNER JOIN usuarios u1 ON u1.id = c.id_arrendador
                 INNER JOIN usuarios u2 ON u2.id = c.id_arrendatario
                 WHERE (c.id_arrendador = :uid OR c.id_arrendatario = :uid)" . $whereStatus . "
                 ORDER BY COALESCE(c.ultima_actividad, c.fecha_creacion) DESC"
            );
            $stmt->execute([":uid" => $user_id]);
            $convos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(200, ["success" => true, "conversations" => $convos]);
        }

        if ($action === 'messages') {
            $conversation_id = isset($_GET['conversation_id']) ? (int)$_GET['conversation_id'] : 0;
            if ($conversation_id <= 0) {
                respond(400, ["success" => false, "message" => "conversation_id requerido"]);
            }

            // Access control
            $stmt = $pdo->prepare("SELECT * FROM conversaciones WHERE id = :cid AND (id_arrendador = :uid OR id_arrendatario = :uid)");
            $stmt->execute([":cid" => $conversation_id, ":uid" => $user_id]);
            $conv = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$conv) {
                respond(403, ["success" => false, "message" => "Sin permisos"]);
            }

            $since_id = isset($_GET['since_id']) ? (int)$_GET['since_id'] : 0;
            $timeout = isset($_GET['timeout']) ? (int)$_GET['timeout'] : 20;
            if ($timeout < 0) $timeout = 0;
            if ($timeout > 25) $timeout = 25;

            $start = time();
            do {
                $query = "SELECT m.*, u.nombre AS remitente_nombre
                          FROM chat_mensajes m
                          INNER JOIN usuarios u ON u.id = m.id_remitente
                          WHERE m.id_conversacion = :cid AND m.id > :since
                          ORDER BY m.id ASC";
                $stmt = $pdo->prepare($query);
                $stmt->execute([":cid" => $conversation_id, ":since" => $since_id]);
                $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (count($messages) > 0 || $timeout === 0) {
                    respond(200, ["success" => true, "messages" => $messages]);
                }

                usleep(250000); // 0.25s
            } while (time() - $start < $timeout);

            respond(200, ["success" => true, "messages" => []]);
        }

        respond(400, ["success" => false, "message" => "Acción no válida"]);
    } catch (PDOException $e) {
        respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        respond(400, ["success" => false, "message" => "JSON inválido"]);
    }

    $action = $data['action'] ?? '';

    try {
        if ($action === 'archive' || $action === 'unarchive') {
            $conversation_id = isset($data['conversation_id']) ? (int)$data['conversation_id'] : 0;
            if ($conversation_id <= 0) {
                respond(400, ["success" => false, "message" => "conversation_id requerido"]);
            }

            $stmt = $pdo->prepare(
                "SELECT * FROM conversaciones WHERE id = :cid AND (id_arrendador = :uid OR id_arrendatario = :uid)"
            );
            $stmt->execute([":cid" => $conversation_id, ":uid" => $user_id]);
            $conv = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$conv) {
                respond(403, ["success" => false, "message" => "Sin permisos"]);
            }

            $newState = ($action === 'archive') ? 'cerrada' : 'activa';
            $stmt = $pdo->prepare("UPDATE conversaciones SET estado = :st WHERE id = :cid");
            $stmt->execute([":st" => $newState, ":cid" => $conversation_id]);
            respond(200, ["success" => true, "message" => "Conversación actualizada", "estado" => $newState]);
        }

        if ($action === 'start') {
            $missing = require_fields($data, ['property_id', 'tenant_user_id']);
            if ($missing) {
                respond(400, ["success" => false, "message" => "Campo requerido: $missing"]);
            }

            $property_id = (int)$data['property_id'];
            $tenant_user_id = (int)$data['tenant_user_id'];
            if ($property_id <= 0 || $tenant_user_id <= 0) {
                respond(400, ["success" => false, "message" => "IDs inválidos"]);
            }

            // Ensure current user is the property owner (arrendador)
            $stmt = $pdo->prepare("SELECT id, id_usuario FROM propiedades WHERE id = :pid");
            $stmt->execute([":pid" => $property_id]);
            $prop = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$prop || (int)$prop['id_usuario'] !== $user_id) {
                respond(403, ["success" => false, "message" => "Solo el propietario puede iniciar conversación"]);
            }

            // Check tenant exists
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = :uid AND activo = 1");
            $stmt->execute([":uid" => $tenant_user_id]);
            if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
                respond(404, ["success" => false, "message" => "Arrendatario no encontrado"]);
            }

            // Unique conversation per (property, arrendador, arrendatario)
            $stmt = $pdo->prepare(
                "SELECT id FROM conversaciones
                 WHERE id_propiedad = :pid AND id_arrendador = :aid AND id_arrendatario = :tid
                 LIMIT 1"
            );
            $stmt->execute([":pid" => $property_id, ":aid" => $user_id, ":tid" => $tenant_user_id]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                respond(200, ["success" => true, "conversation_id" => (int)$existing['id']]);
            }

            $stmt = $pdo->prepare(
                "INSERT INTO conversaciones (id_propiedad, id_arrendador, id_arrendatario, ultima_actividad)
                 VALUES (:pid, :aid, :tid, NOW())"
            );
            $stmt->execute([":pid" => $property_id, ":aid" => $user_id, ":tid" => $tenant_user_id]);

            respond(201, ["success" => true, "conversation_id" => (int)$pdo->lastInsertId()]);
        }

        if ($action === 'start_from_property') {
            $missing = require_fields($data, ['property_id']);
            if ($missing) {
                respond(400, ["success" => false, "message" => "Campo requerido: $missing"]);
            }

            $property_id = (int)$data['property_id'];
            if ($property_id <= 0) {
                respond(400, ["success" => false, "message" => "IDs inválidos"]);
            }

            // tenant starts conversation; owner is property.id_usuario
            $stmt = $pdo->prepare("SELECT id, id_usuario FROM propiedades WHERE id = :pid");
            $stmt->execute([":pid" => $property_id]);
            $prop = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$prop) {
                respond(404, ["success" => false, "message" => "Propiedad no encontrada"]);
            }

            $owner_id = (int)$prop['id_usuario'];
            if ($owner_id === $user_id) {
                respond(400, ["success" => false, "message" => "No puedes iniciar conversación contigo mismo"]);
            }

            // Ensure both users exist/active
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = :uid AND activo = 1");
            $stmt->execute([":uid" => $owner_id]);
            if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
                respond(404, ["success" => false, "message" => "Arrendador no encontrado"]);
            }

            // Unique conversation per (property, arrendador, arrendatario)
            $stmt = $pdo->prepare(
                "SELECT id FROM conversaciones
                 WHERE id_propiedad = :pid AND id_arrendador = :aid AND id_arrendatario = :tid
                 LIMIT 1"
            );
            $stmt->execute([":pid" => $property_id, ":aid" => $owner_id, ":tid" => $user_id]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                respond(200, ["success" => true, "conversation_id" => (int)$existing['id']]);
            }

            $stmt = $pdo->prepare(
                "INSERT INTO conversaciones (id_propiedad, id_arrendador, id_arrendatario, ultima_actividad)
                 VALUES (:pid, :aid, :tid, NOW())"
            );
            $stmt->execute([":pid" => $property_id, ":aid" => $owner_id, ":tid" => $user_id]);

            respond(201, ["success" => true, "conversation_id" => (int)$pdo->lastInsertId()]);
        }

        if ($action === 'send') {
            $missing = require_fields($data, ['conversation_id', 'message']);
            if ($missing) {
                respond(400, ["success" => false, "message" => "Campo requerido: $missing"]);
            }

            $conversation_id = (int)$data['conversation_id'];
            $message = trim((string)$data['message']);
            if ($conversation_id <= 0 || $message === '') {
                respond(400, ["success" => false, "message" => "Datos inválidos"]);
            }

            // Access control
            $stmt = $pdo->prepare("SELECT * FROM conversaciones WHERE id = :cid AND (id_arrendador = :uid OR id_arrendatario = :uid)");
            $stmt->execute([":cid" => $conversation_id, ":uid" => $user_id]);
            $conv = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$conv) {
                respond(403, ["success" => false, "message" => "Sin permisos"]);
            }

            $stmt = $pdo->prepare(
                "INSERT INTO chat_mensajes (id_conversacion, id_remitente, mensaje)
                 VALUES (:cid, :uid, :msg)"
            );
            $stmt->execute([":cid" => $conversation_id, ":uid" => $user_id, ":msg" => $message]);

            $pdo->prepare("UPDATE conversaciones SET ultima_actividad = NOW() WHERE id = :cid")
                ->execute([":cid" => $conversation_id]);

            respond(201, ["success" => true, "message_id" => (int)$pdo->lastInsertId()]);
        }

        respond(400, ["success" => false, "message" => "Acción no válida"]);
    } catch (PDOException $e) {
        respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

respond(405, ["success" => false, "message" => "Método no permitido"]);
