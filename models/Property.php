<?php
class Property {
    private $conn;
    private $table_name = "propiedades";

    public $id;
    public $id_usuario;
    public $titulo;
    public $descripcion;
    public $tipo;
    public $precio;
    public $ubicacion;
    public $direccion;
    public $habitaciones;
    public $banos;
    public $area;
    public $amueblado;
    public $mascotas;
    public $estacionamiento;
    public $estado;
    public $fecha_publicacion;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET id_usuario=:id_usuario, titulo=:titulo, descripcion=:descripcion, 
                  tipo=:tipo, precio=:precio, ubicacion=:ubicacion, direccion=:direccion,
                  habitaciones=:habitaciones, banos=:banos, area=:area, 
                  amueblado=:amueblado, mascotas=:mascotas, estacionamiento=:estacionamiento";
        
        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->ubicacion = htmlspecialchars(strip_tags($this->ubicacion));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));

        // Vincular parámetros
        $stmt->bindParam(":id_usuario", $this->id_usuario);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":ubicacion", $this->ubicacion);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":habitaciones", $this->habitaciones);
        $stmt->bindParam(":banos", $this->banos);
        $stmt->bindParam(":area", $this->area);
        $stmt->bindParam(":amueblado", $this->amueblado);
        $stmt->bindParam(":mascotas", $this->mascotas);
        $stmt->bindParam(":estacionamiento", $this->estacionamiento);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function getPropertiesByUser($user_id) {
        // Primero verificar si existe la columna visualizaciones
        try {
            $checkCol = $this->conn->query("SHOW COLUMNS FROM propiedades LIKE 'visualizaciones'");
            $hasVisualizaciones = $checkCol->rowCount() > 0;
        } catch (PDOException $e) {
            $hasVisualizaciones = false;
        }
        
        if ($hasVisualizaciones) {
            $query = "SELECT p.*, 
                      (SELECT imagen_url FROM imagenes_propiedad WHERE id_propiedad = p.id AND es_principal = 1 LIMIT 1) as imagen_principal,
                      COUNT(DISTINCT m.id) as total_mensajes,
                      COALESCE(p.visualizaciones, 0) as visualizaciones
                      FROM " . $this->table_name . " p 
                      LEFT JOIN mensajes m ON p.id = m.id_propiedad
                      WHERE p.id_usuario = :user_id AND (p.estado = 'disponible' OR p.estado = 'arrendada')
                      GROUP BY p.id
                      ORDER BY p.fecha_publicacion DESC";
        } else {
            $query = "SELECT p.*, 
                      (SELECT imagen_url FROM imagenes_propiedad WHERE id_propiedad = p.id AND es_principal = 1 LIMIT 1) as imagen_principal,
                      COUNT(DISTINCT m.id) as total_mensajes,
                      0 as visualizaciones
                      FROM " . $this->table_name . " p 
                      LEFT JOIN mensajes m ON p.id = m.id_propiedad
                      WHERE p.id_usuario = :user_id AND (p.estado = 'disponible' OR p.estado = 'arrendada')
                      GROUP BY p.id
                      ORDER BY p.fecha_publicacion DESC";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        return $stmt;
    }

    public function getPropertyById($id, $user_id = null) {
        $query = "SELECT p.*, 
                  (SELECT COUNT(*) FROM mensajes WHERE id_propiedad = p.id) as total_mensajes
                  FROM " . $this->table_name . " p 
                  WHERE p.id = :id";
        
        if ($user_id) {
            $query .= " AND p.id_usuario = :user_id";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        
        if ($user_id) {
            $stmt->bindParam(":user_id", $user_id);
        }
        
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET titulo=:titulo, descripcion=:descripcion, tipo=:tipo, 
                  precio=:precio, ubicacion=:ubicacion, direccion=:direccion,
                  habitaciones=:habitaciones, banos=:banos, area=:area, 
                  amueblado=:amueblado, mascotas=:mascotas, estacionamiento=:estacionamiento,
                  estado=:estado
                  WHERE id = :id AND id_usuario = :id_usuario";
        
        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->ubicacion = htmlspecialchars(strip_tags($this->ubicacion));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));

        // Vincular parámetros
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":id_usuario", $this->id_usuario);
        $stmt->bindParam(":titulo", $this->titulo);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":tipo", $this->tipo);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":ubicacion", $this->ubicacion);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":habitaciones", $this->habitaciones);
        $stmt->bindParam(":banos", $this->banos);
        $stmt->bindParam(":area", $this->area);
        $stmt->bindParam(":amueblado", $this->amueblado);
        $stmt->bindParam(":mascotas", $this->mascotas);
        $stmt->bindParam(":estacionamiento", $this->estacionamiento);
        $stmt->bindParam(":estado", $this->estado);

        return $stmt->execute();
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id = :id AND id_usuario = :id_usuario";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":id_usuario", $this->id_usuario);

        return $stmt->execute();
    }

    public function getPropertyImages($property_id) {
        $query = "SELECT * FROM imagenes_propiedad 
                  WHERE id_propiedad = :property_id 
                  ORDER BY es_principal DESC, id ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":property_id", $property_id);
        $stmt->execute();

        return $stmt;
    }

    public function addImage($property_id, $image_url, $is_primary = 0) {
        $query = "INSERT INTO imagenes_propiedad 
                  SET id_propiedad=:property_id, imagen_url=:image_url, es_principal=:is_primary";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":property_id", $property_id);
        $stmt->bindParam(":image_url", $image_url);
        $stmt->bindParam(":is_primary", $is_primary);

        return $stmt->execute();
    }

    private function ensureVideosTable() {
        $sql = "CREATE TABLE IF NOT EXISTS videos_propiedad (
                    id INT(11) NOT NULL AUTO_INCREMENT,
                    id_propiedad INT(11) NOT NULL,
                    video_url VARCHAR(255) NOT NULL,
                    es_principal TINYINT(4) DEFAULT 0,
                    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    KEY idx_videos_propiedad (id_propiedad)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
        $this->conn->exec($sql);

        // Migración: si la tabla existía sin es_principal, agregarla
        try {
            $checkCol = $this->conn->query("SHOW COLUMNS FROM videos_propiedad LIKE 'es_principal'");
            if ($checkCol && $checkCol->rowCount() === 0) {
                $this->conn->exec("ALTER TABLE videos_propiedad ADD COLUMN es_principal TINYINT(4) DEFAULT 0");
            }
        } catch (PDOException $e) {
            // ignore
        }
    }

    public function addVideo($property_id, $video_url) {
        $this->ensureVideosTable();

        // Si es el primer video, hacerlo principal
        $is_primary = 0;
        try {
            $stmt = $this->conn->prepare("SELECT COUNT(*) as c FROM videos_propiedad WHERE id_propiedad = :property_id");
            $stmt->bindParam(":property_id", $property_id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = (int)($row['c'] ?? 0);
            if ($count === 0) {
                $is_primary = 1;
            }
        } catch (PDOException $e) {
            $is_primary = 0;
        }

        $query = "INSERT INTO videos_propiedad SET id_propiedad=:property_id, video_url=:video_url, es_principal=:is_primary";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":property_id", $property_id);
        $stmt->bindParam(":video_url", $video_url);
        $stmt->bindParam(":is_primary", $is_primary);
        return $stmt->execute();
    }

    public function getPropertyVideos($property_id) {
        $this->ensureVideosTable();
        $query = "SELECT * FROM videos_propiedad WHERE id_propiedad = :property_id ORDER BY es_principal DESC, id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":property_id", $property_id);
        $stmt->execute();
        return $stmt;
    }

    public function setPrimaryVideo($video_id, $property_id) {
        $this->ensureVideosTable();

        $query = "UPDATE videos_propiedad SET es_principal = 0 WHERE id_propiedad = :property_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":property_id", $property_id);
        $stmt->execute();

        $query = "UPDATE videos_propiedad SET es_principal = 1 WHERE id = :video_id AND id_propiedad = :property_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":video_id", $video_id);
        $stmt->bindParam(":property_id", $property_id);
        return $stmt->execute();
    }

    public function deleteVideo($video_id, $property_id) {
        $this->ensureVideosTable();
        $query = "DELETE FROM videos_propiedad WHERE id = :video_id AND id_propiedad = :property_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":video_id", $video_id);
        $stmt->bindParam(":property_id", $property_id);
        return $stmt->execute();
    }

    public function deleteImage($image_id, $property_id) {
        $query = "DELETE FROM imagenes_propiedad 
                  WHERE id = :image_id AND id_propiedad = :property_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":image_id", $image_id);
        $stmt->bindParam(":property_id", $property_id);

        return $stmt->execute();
    }

    public function setPrimaryImage($image_id, $property_id) {
        // Primero, quitar cualquier imagen principal existente
        $query = "UPDATE imagenes_propiedad SET es_principal = 0 
                  WHERE id_propiedad = :property_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":property_id", $property_id);
        $stmt->execute();

        // Luego, establecer la nueva imagen como principal
        $query = "UPDATE imagenes_propiedad SET es_principal = 1 
                  WHERE id = :image_id AND id_propiedad = :property_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":image_id", $image_id);
        $stmt->bindParam(":property_id", $property_id);

        return $stmt->execute();
    }
}
?>