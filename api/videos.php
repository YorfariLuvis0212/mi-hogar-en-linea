<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Verificar autenticación
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "No autenticado"));
    exit;
}

include_once '../config/database.php';
include_once '../models/Property.php';

$database = new Database();
$db = $database->getConnection();
$property = new Property($db);

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(array("success" => true));
    exit;
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->video_id) && !empty($data->property_id)) {
        $prop_data = $property->getPropertyById($data->property_id, $user_id);
        if (!$prop_data) {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "No tienes permisos para esta propiedad"));
            exit;
        }

        // Buscar info del video antes de eliminar
        $videos_stmt = $property->getPropertyVideos($data->property_id);
        $video_to_delete = null;
        while ($v = $videos_stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($v['id'] == $data->video_id) {
                $video_to_delete = $v;
                break;
            }
        }

        if ($video_to_delete && $property->deleteVideo($data->video_id, $data->property_id)) {
            $file_path = "../" . $video_to_delete['video_url'];
            if (file_exists($file_path)) {
                unlink($file_path);
            }

            echo json_encode(array(
                "success" => true,
                "message" => "Video eliminado exitosamente"
            ));
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "Video no encontrado"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Datos incompletos"));
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->video_id) && !empty($data->property_id)) {
        $prop_data = $property->getPropertyById($data->property_id, $user_id);
        if (!$prop_data) {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "No tienes permisos para esta propiedad"));
            exit;
        }

        if ($property->setPrimaryVideo($data->video_id, $data->property_id)) {
            echo json_encode(array(
                "success" => true,
                "message" => "Video principal actualizado exitosamente"
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Error al actualizar el video principal"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Datos incompletos"));
    }
    exit;
}

http_response_code(405);
echo json_encode(array("success" => false, "message" => "Método no permitido"));
