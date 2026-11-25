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

function ensure_dir($dir) {
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0777, true) && !is_dir($dir)) {
            throw new Exception('No se pudo crear el directorio de contratos');
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'status';
    $lease_id = isset($_GET['lease_id']) ? (int)$_GET['lease_id'] : 0;
    if ($lease_id <= 0) {
        respond(400, ["success" => false, "message" => "lease_id requerido"]);
    }

    try {
        // Access control: owner or tenant or super_admin
        $stmt = $pdo->prepare(
            "SELECT a.*, c.id AS contrato_id, c.archivo_generado, c.archivo_firmado, c.estado AS contrato_estado,
                    c.fecha_generacion, c.fecha_firma
             FROM arrendamientos a
             LEFT JOIN contratos c ON c.id_arrendamiento = a.id
             WHERE a.id = :lid"
        );
        $stmt->execute([":lid" => $lease_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            respond(404, ["success" => false, "message" => "Arrendamiento no encontrado"]);
        }

        $is_super = (($_SESSION['user_rol'] ?? 'user') === 'super_admin');
        if (!$is_super && (int)$row['id_arrendador'] !== $user_id && (int)$row['id_arrendatario'] !== $user_id) {
            respond(403, ["success" => false, "message" => "Sin permisos"]);
        }

        // Autocrear fila de contrato si no existe
        if (empty($row['contrato_id'])) {
            $stmt = $pdo->prepare("INSERT INTO contratos (id_arrendamiento, estado) VALUES (:lid, 'borrador')");
            $stmt->execute([":lid" => $lease_id]);

            // refrescar datos
            $stmt = $pdo->prepare(
                "SELECT a.*, c.id AS contrato_id, c.archivo_generado, c.archivo_firmado, c.estado AS contrato_estado,
                        c.fecha_generacion, c.fecha_firma
                 FROM arrendamientos a
                 LEFT JOIN contratos c ON c.id_arrendamiento = a.id
                 WHERE a.id = :lid"
            );
            $stmt->execute([":lid" => $lease_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if ($action === 'status') {
            respond(200, ["success" => true, "contract" => $row]);
        }

        if ($action === 'download_generated') {
            if (empty($row['archivo_generado'])) {
                respond(400, ["success" => false, "message" => "Contrato no generado"]);
            }
            $path = realpath(__DIR__ . '/../' . $row['archivo_generado']);
            if (!$path || !file_exists($path)) {
                respond(404, ["success" => false, "message" => "Archivo no encontrado"]);
            }
            header('Content-Type: application/msword');
            header('Content-Disposition: attachment; filename="contrato-'.$lease_id.'.doc"');
            readfile($path);
            exit;
        }

        if ($action === 'download_signed') {
            if (empty($row['archivo_firmado'])) {
                respond(400, ["success" => false, "message" => "Contrato no firmado"]);
            }
            $path = realpath(__DIR__ . '/../' . $row['archivo_firmado']);
            if (!$path || !file_exists($path)) {
                respond(404, ["success" => false, "message" => "Archivo no encontrado"]);
            }
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="contrato-firmado-'.$lease_id.'.pdf"');
            readfile($path);
            exit;
        }

        respond(400, ["success" => false, "message" => "Acción no válida"]);
    } catch (PDOException $e) {
        respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

if ($method === 'POST') {
    // For file upload we use multipart/form-data, but also support JSON actions
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'multipart/form-data') !== false) {
        $action = $_POST['action'] ?? '';
        $lease_id = isset($_POST['lease_id']) ? (int)$_POST['lease_id'] : 0;

        if ($action !== 'upload_signed') {
            respond(400, ["success" => false, "message" => "Acción no válida"]);
        }
        if ($lease_id <= 0) {
            respond(400, ["success" => false, "message" => "lease_id requerido"]);
        }
        if (!isset($_FILES['signed_pdf'])) {
            respond(400, ["success" => false, "message" => "signed_pdf requerido"]);
        }

        try {
            // Access control: only arrendador or arrendatario
            $stmt = $pdo->prepare("SELECT * FROM arrendamientos WHERE id = :lid");
            $stmt->execute([":lid" => $lease_id]);
            $lease = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$lease) {
                respond(404, ["success" => false, "message" => "Arrendamiento no encontrado"]);
            }
            if ((int)$lease['id_arrendador'] !== $user_id && (int)$lease['id_arrendatario'] !== $user_id) {
                respond(403, ["success" => false, "message" => "Sin permisos"]);
            }

            // Ensure contract row exists
            $stmt = $pdo->prepare("SELECT id FROM contratos WHERE id_arrendamiento = :lid LIMIT 1");
            $stmt->execute([":lid" => $lease_id]);
            $has = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$has) {
                $pdo->prepare("INSERT INTO contratos (id_arrendamiento, estado) VALUES (:lid, 'borrador')")
                    ->execute([":lid" => $lease_id]);
            }

            $file = $_FILES['signed_pdf'];
            $file_name = $file['name'] ?? '';
            $file_size = (int)($file['size'] ?? 0);
            $tmp = $file['tmp_name'] ?? '';
            $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

            if ($ext !== 'pdf') {
                respond(400, ["success" => false, "message" => "Solo se permite PDF"]);
            }
            if ($file_size <= 0 || $file_size > 10000000) {
                respond(400, ["success" => false, "message" => "Archivo inválido o demasiado grande (max 10MB)"]);
            }

            $dir = __DIR__ . '/../uploads/contracts/' . $lease_id . '/';
            ensure_dir($dir);

            $new_name = 'signed_' . time() . '.pdf';
            $full = $dir . $new_name;

            if (!move_uploaded_file($tmp, $full)) {
                respond(500, ["success" => false, "message" => "Error al subir el archivo"]);
            }

            $rel_path = 'uploads/contracts/' . $lease_id . '/' . $new_name;
            $stmt = $pdo->prepare(
                "UPDATE contratos
                 SET archivo_firmado = :p, estado = 'firmado', fecha_firma = NOW()
                 WHERE id_arrendamiento = :lid"
            );
            $stmt->execute([":p" => $rel_path, ":lid" => $lease_id]);

            respond(200, ["success" => true, "message" => "Contrato firmado subido", "path" => $rel_path]);
        } catch (PDOException $e) {
            respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    }

    // JSON actions
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        respond(400, ["success" => false, "message" => "JSON inválido"]);
    }

    $action = $data['action'] ?? '';
    if ($action !== 'generate') {
        respond(400, ["success" => false, "message" => "Acción no válida"]);
    }

    $lease_id = isset($data['lease_id']) ? (int)$data['lease_id'] : 0;
    if ($lease_id <= 0) {
        respond(400, ["success" => false, "message" => "lease_id requerido"]);
    }

    try {
        // Only arrendador can generate
        $stmt = $pdo->prepare(
            "SELECT a.*, p.titulo AS propiedad_titulo, p.direccion, p.ubicacion,
                    p.tipo AS propiedad_tipo, p.habitaciones, p.banos, p.area, p.estacionamiento, p.mascotas, p.amueblado,
                    u1.nombre AS arrendador_nombre, u1.email AS arrendador_email, u1.telefono AS arrendador_telefono,
                    u2.nombre AS arrendatario_nombre, u2.email AS arrendatario_email, u2.telefono AS arrendatario_telefono
             FROM arrendamientos a
             INNER JOIN propiedades p ON p.id = a.id_propiedad
             INNER JOIN usuarios u1 ON u1.id = a.id_arrendador
             INNER JOIN usuarios u2 ON u2.id = a.id_arrendatario
             WHERE a.id = :lid"
        );
        $stmt->execute([":lid" => $lease_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            respond(404, ["success" => false, "message" => "Arrendamiento no encontrado"]);
        }
        if ((int)$row['id_arrendador'] !== $user_id) {
            respond(403, ["success" => false, "message" => "Solo el arrendador puede generar el contrato"]);
        }

        // Ensure contract row exists
        $stmt = $pdo->prepare("SELECT id FROM contratos WHERE id_arrendamiento = :lid LIMIT 1");
        $stmt->execute([":lid" => $lease_id]);
        $has = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$has) {
            $pdo->prepare("INSERT INTO contratos (id_arrendamiento, estado) VALUES (:lid, 'borrador')")
                ->execute([":lid" => $lease_id]);
        }

        $dir = __DIR__ . '/../uploads/contracts/' . $lease_id . '/';
        ensure_dir($dir);
        $rel_path = 'uploads/contracts/' . $lease_id . '/generated.doc';
        $full = $dir . 'generated.doc';

        $canon = number_format((float)$row['canon_mensual'], 0, ',', '.');
        $direccion = trim(($row['direccion'] ?? '') . ' ' . ($row['ubicacion'] ?? ''));

        $caracteristicas = [];
        if (!empty($row['propiedad_tipo'])) $caracteristicas[] = 'Tipo: ' . $row['propiedad_tipo'];
        if (isset($row['habitaciones'])) $caracteristicas[] = 'Habitaciones: ' . $row['habitaciones'];
        if (isset($row['banos'])) $caracteristicas[] = 'Baños: ' . $row['banos'];
        if (!empty($row['area'])) $caracteristicas[] = 'Área: ' . $row['area'] . ' m²';
        $caracteristicas[] = 'Estacionamiento: ' . ((int)($row['estacionamiento'] ?? 0) ? 'Sí' : 'No');
        $caracteristicas[] = 'Mascotas: ' . ((int)($row['mascotas'] ?? 0) ? 'Sí' : 'No');
        $caracteristicas[] = 'Amueblado: ' . ((int)($row['amueblado'] ?? 0) ? 'Sí' : 'No');

        $caracteristicas_texto = implode("\n", $caracteristicas);

        $vigencia = '';
        if (!empty($row['fecha_fin'])) {
            $vigencia = 'El contrato inicia el {FECHA_INICIO} y finaliza el {FECHA_FIN}.';
        } else {
            $vigencia = 'El contrato inicia el {FECHA_INICIO} y su vigencia será indefinida hasta que cualquiera de las partes notifique la terminación conforme a la ley.';
        }

        $template = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">";
        $template .= "<title>Contrato de Arrendamiento</title>";
        $template .= "<style>body{font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.4;}h1{text-align:center;font-size:16pt;}h2{font-size:13pt;margin-top:18px;} .small{font-size:10pt;color:#444;} .box{border:1px solid #999;padding:10px;margin-top:10px;} table{width:100%;border-collapse:collapse;} td{vertical-align:top;padding:4px;} .sign{margin-top:30px;} .line{display:inline-block;border-bottom:1px solid #000;min-width:280px;height:18px;}</style>";
        $template .= "</head><body>";
        $template .= "<h1>CONTRATO DE ARRENDAMIENTO</h1>";
        $template .= "<p class=\"small\">Documento generado por Mi Hogar en Línea. Puedes editar este archivo en Word y luego firmarlo.</p>";

        $template .= "<h2>1. Partes</h2>";
        $template .= "<div class=\"box\"><strong>ARRENDADOR:</strong> {ARRENDADOR_NOMBRE}<br><strong>Email:</strong> {ARRENDADOR_EMAIL} {ARRENDADOR_TEL}<br>";
        $template .= "<strong>ARRENDATARIO:</strong> {ARRENDATARIO_NOMBRE}<br><strong>Email:</strong> {ARRENDATARIO_EMAIL} {ARRENDATARIO_TEL}</div>";

        $template .= "<h2>2. Inmueble</h2>";
        $template .= "<div class=\"box\"><strong>Inmueble:</strong> {PROPIEDAD_TITULO}<br><strong>Dirección:</strong> {DIRECCION}<br>";
        $template .= "<strong>Características:</strong><br><pre style=\"white-space:pre-wrap; font-family:inherit;\">{CARACTERISTICAS}</pre></div>";

        $template .= "<h2>3. Canon</h2>";
        $template .= "<div class=\"box\">El canon mensual es de <strong>$ {CANON} COP</strong>, pagadero por el ARRENDATARIO según acuerdo entre las partes.</div>";

        $template .= "<h2>4. Vigencia</h2>";
        $template .= "<div class=\"box\">".$vigencia."</div>";

        $template .= "<h2>5. Destinación</h2>";
        $template .= "<div class=\"box\">El inmueble se destinará exclusivamente para vivienda.</div>";

        $template .= "<h2>6. Entrega y conservación</h2>";
        $template .= "<div class=\"box\">El ARRENDATARIO recibe el inmueble en buen estado y se compromete a conservarlo y devolverlo en condiciones similares, salvo el deterioro natural por uso normal.</div>";

        $template .= "<h2>7. Firma del arrendatario</h2>";
        $template .= "<div class=\"box\"><strong>ARRENDATARIO</strong><br><span class=\"line\"></span><br>Nombre: {ARRENDATARIO_NOMBRE}</div>";

        $template .= "</body></html>";

        $texto = str_replace(
            [
                '{ARRENDADOR_NOMBRE}', '{ARRENDADOR_EMAIL}', '{ARRENDADOR_TEL}',
                '{ARRENDATARIO_NOMBRE}', '{ARRENDATARIO_EMAIL}', '{ARRENDATARIO_TEL}',
                '{PROPIEDAD_TITULO}', '{DIRECCION}', '{CARACTERISTICAS}',
                '{CANON}', '{FECHA_INICIO}', '{FECHA_FIN}'
            ],
            [
                (string)$row['arrendador_nombre'],
                (string)$row['arrendador_email'],
                !empty($row['arrendador_telefono']) ? ('- Tel: ' . $row['arrendador_telefono']) : '',
                (string)$row['arrendatario_nombre'],
                (string)$row['arrendatario_email'],
                !empty($row['arrendatario_telefono']) ? ('- Tel: ' . $row['arrendatario_telefono']) : '',
                (string)$row['propiedad_titulo'],
                (string)$direccion,
                (string)$caracteristicas_texto,
                (string)$canon,
                (string)$row['fecha_inicio'],
                (string)($row['fecha_fin'] ?? '')
            ],
            $template
        );

        if (file_put_contents($full, $texto) === false) {
            throw new Exception('No se pudo generar el documento. Verifica permisos de escritura en uploads/contracts');
        }

        $stmt = $pdo->prepare(
            "UPDATE contratos
             SET archivo_generado = :p, estado = 'generado', fecha_generacion = NOW()
             WHERE id_arrendamiento = :lid"
        );
        $stmt->execute([":p" => $rel_path, ":lid" => $lease_id]);

        // Notificar por chat al arrendatario (misma conversación propiedad/arrendador/arrendatario)
        try {
            $stmt = $pdo->prepare(
                "SELECT id FROM conversaciones
                 WHERE id_propiedad = :pid AND id_arrendador = :aid AND id_arrendatario = :tid
                 LIMIT 1"
            );
            $stmt->execute([
                ":pid" => (int)$row['id_propiedad'],
                ":aid" => (int)$row['id_arrendador'],
                ":tid" => (int)$row['id_arrendatario']
            ]);
            $conv = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($conv) {
                $msg = "Contrato generado (Word editable). Ve a Arrendamientos para descargarlo y luego subirlo firmado en PDF.";
                $stmt = $pdo->prepare(
                    "INSERT INTO chat_mensajes (id_conversacion, id_remitente, mensaje)
                     VALUES (:cid, :uid, :msg)"
                );
                $stmt->execute([":cid" => (int)$conv['id'], ":uid" => $user_id, ":msg" => $msg]);
                $pdo->prepare("UPDATE conversaciones SET ultima_actividad = NOW() WHERE id = :cid")
                    ->execute([":cid" => (int)$conv['id']]);
            }
        } catch (Exception $e) {
            // ignore notify errors
        }

        respond(200, ["success" => true, "message" => "Contrato generado", "path" => $rel_path]);
    } catch (Exception $e) {
        respond(500, ["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

respond(405, ["success" => false, "message" => "Método no permitido"]);
