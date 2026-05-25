        </div>
    </div>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-col">
                    <h3>MI HOGAR EN LINEA</h3>
                    <p>La plataforma líder para encontrar y publicar propiedades en arrendamiento.</p>
                </div>
                <div class="footer-col">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><a href="../index.php">Inicio</a></li>
                        <li><a href="../property.php">Propiedades</a></li>
                        <li><a href="dashboard.php">Dashboard</a></li>
                        <li><a href="../sobre-nosotros.php">Sobre Nosotros</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Contacto</h3>
                    <ul>
                        <li>Email: info@mihogarenlinea.com</li>
                        <li>Teléfono: +1 234 567 890</li>
                        <li>Dirección: Calle Principal #123, Ciudad</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2023 MI HOGAR EN LINEA. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
    
    <script src="js/common.js?v=<?php echo file_exists(__DIR__ . '/../js/common.js') ? filemtime(__DIR__ . '/../js/common.js') : time(); ?>"></script>
    <?php if (basename($_SERVER['PHP_SELF']) == 'dashboard.php'): ?>
        <script src="js/dashboard.js?v=<?php echo file_exists(__DIR__ . '/../js/dashboard.js') ? filemtime(__DIR__ . '/../js/dashboard.js') : time(); ?>"></script>
    <?php elseif (basename($_SERVER['PHP_SELF']) == 'publicar-propiedad.php'): ?>
        <script src="js/publicar-propiedad.js?v=<?php echo file_exists(__DIR__ . '/../js/publicar-propiedad.js') ? filemtime(__DIR__ . '/../js/publicar-propiedad.js') : time(); ?>"></script>
    <?php elseif (basename($_SERVER['PHP_SELF']) == 'mis-propiedades.php'): ?>
        <script src="js/mis-propiedades.js?v=<?php echo file_exists(__DIR__ . '/../js/mis-propiedades.js') ? filemtime(__DIR__ . '/../js/mis-propiedades.js') : time(); ?>"></script>
    <?php elseif (basename($_SERVER['PHP_SELF']) == 'configuracion.php'): ?>
        <script src="js/configuracion.js?v=<?php echo file_exists(__DIR__ . '/../js/configuracion.js') ? filemtime(__DIR__ . '/../js/configuracion.js') : time(); ?>"></script>
    <?php elseif (basename($_SERVER['PHP_SELF']) == 'chat.php'): ?>
        <script src="js/chat.js?v=<?php echo file_exists(__DIR__ . '/../js/chat.js') ? filemtime(__DIR__ . '/../js/chat.js') : time(); ?>"></script>
    <?php elseif (basename($_SERVER['PHP_SELF']) == 'arrendamientos.php'): ?>
        <script src="js/arrendamientos.js?v=<?php echo file_exists(__DIR__ . '/../js/arrendamientos.js') ? filemtime(__DIR__ . '/../js/arrendamientos.js') : time(); ?>"></script>
    <?php elseif (basename($_SERVER['PHP_SELF']) == 'super-admin.php'): ?>
        <script src="js/super-admin.js?v=<?php echo file_exists(__DIR__ . '/../js/super-admin.js') ? filemtime(__DIR__ . '/../js/super-admin.js') : time(); ?>"></script>
    <?php endif; ?>
</body>
</html>

