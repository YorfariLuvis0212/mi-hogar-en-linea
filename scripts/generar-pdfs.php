<?php
/**
 * Genera PDF de HISTORIAS_DE_USUARIO.html y DOCUMENTACION.md
 * Uso: php scripts/generar-pdfs.php
 */

$root = dirname(__DIR__);
$docsDir = $root . DIRECTORY_SEPARATOR . 'docs';
if (!is_dir($docsDir)) {
    mkdir($docsDir, 0777, true);
}

function prepareHistoriasForPrint(string $html): string
{
    $html = preg_replace('/<div class="historia">\s*<div class="historia">/', '<div class="historia">', $html);

    $html = preg_replace(
        '/<!-- (HU-\d+) -->\s*(?:<div class="historia">\s*)?<table>/',
        '<!-- $1 --><div class="historia"><table>',
        $html
    );

    $html = preg_replace(
        '/<\/table>\s*(?=\r?\n\s*(?:<!-- HU-\d+|<div class="section-title"))/',
        "</table></div>\n",
        $html
    );

    if (strpos($html, '<div class="contenido">') === false) {
        $html = preg_replace(
            '/(<div class="portada">[\s\S]*?<\/div>)\s*/',
            "$1\n    <div class=\"contenido\">\n",
            $html,
            1
        );
    }

    $html = preg_replace(
        '/\s*<div class="section-title">🏗️ ARQUITECTURA \(REFERENCIA\)<\/div>/',
        "\n    </div>\n    <div class=\"bloque-arquitectura\">\n    <div class=\"section-title arquitectura\">🏗️ ARQUITECTURA (REFERENCIA)</div>",
        $html,
        1
    );

    $html = preg_replace(
        '/(<div class="bloque-arquitectura">[\s\S]*?<\/table>)\s*(<div class="bloque-final">)/',
        "$1</div>\n    $2",
        $html,
        1
    );

    return $html;
}

function mdToHtml(string $md): string
{
    $lines = preg_split('/\r\n|\r|\n/', $md);
    $html = '';
    $inCode = false;
    $inTable = false;
    $tableRows = [];
    $inList = false;
    $sectionOpen = false;

    $closeSection = function () use (&$html, &$sectionOpen) {
        if ($sectionOpen) {
            $html .= '</div>';
            $sectionOpen = false;
        }
    };

    $flushTable = function () use (&$html, &$tableRows, &$inTable) {
        if (!$inTable || empty($tableRows)) {
            return;
        }
        $html .= '<table class="tabla-doc">';
        foreach ($tableRows as $i => $row) {
            $cells = array_map('trim', explode('|', trim($row, '| ')));
            $tag = ($i === 0) ? 'th' : 'td';
            if ($i === 1 && preg_match('/^[\s\-:|]+$/', $row)) {
                continue;
            }
            if (preg_match('/^[\s\-:|]+$/', implode('', $cells))) {
                continue;
            }
            $html .= '<tr>';
            foreach ($cells as $cell) {
                $html .= "<$tag>" . inlineFormat($cell) . "</$tag>";
            }
            $html .= '</tr>';
        }
        $html .= '</table>';
        $tableRows = [];
        $inTable = false;
    };

    $closeList = function () use (&$html, &$inList) {
        if ($inList) {
            $html .= '</ul>';
            $inList = false;
        }
    };

    foreach ($lines as $line) {
        if (preg_match('/^```/', $line)) {
            $flushTable();
            $closeList();
            if ($inCode) {
                $html .= '</pre></code>';
                $inCode = false;
            } else {
                $lang = trim(substr($line, 3));
                $html .= '<pre class="codigo-bloque"><code' . ($lang ? ' class="lang-' . htmlspecialchars($lang) . '"' : '') . '>';
                $inCode = true;
            }
            continue;
        }
        if ($inCode) {
            $html .= htmlspecialchars($line) . "\n";
            continue;
        }

        if (preg_match('/^\|/', $line)) {
            $closeList();
            $inTable = true;
            $tableRows[] = $line;
            continue;
        }
        $flushTable();

        if (preg_match('/^---\s*$/', $line)) {
            $closeList();
            $html .= '<hr class="separador">';
            continue;
        }
        if (preg_match('/^### (.+)$/', $line, $m)) {
            $closeList();
            $html .= '<h3>' . inlineFormat($m[1]) . '</h3>';
            continue;
        }
        if (preg_match('/^## (.+)$/', $line, $m)) {
            $closeList();
            $closeSection();
            $html .= '<div class="doc-seccion"><h2 class="seccion-titulo">' . inlineFormat($m[1]) . '</h2>';
            $sectionOpen = true;
            continue;
        }
        if (preg_match('/^# (.+)$/', $line, $m)) {
            $closeList();
            $closeSection();
            $html .= '<h1 class="titulo-md">' . inlineFormat($m[1]) . '</h1>';
            continue;
        }
        if (preg_match('/^\- (.+)$/', $line, $m)) {
            if (!$inList) {
                $html .= '<ul>';
                $inList = true;
            }
            $html .= '<li>' . inlineFormat($m[1]) . '</li>';
            continue;
        }
        if (preg_match('/^\d+\. (.+)$/', $line, $m)) {
            $closeList();
            $html .= '<p class="paso"><strong>' . inlineFormat($m[1]) . '</strong></p>';
            continue;
        }
        if (trim($line) === '') {
            $closeList();
            continue;
        }
        $closeList();
        $html .= '<p>' . inlineFormat($line) . '</p>';
    }

    $flushTable();
    $closeList();
    $closeSection();
    if ($inCode) {
        $html .= '</pre></code>';
    }

    return $html;
}

function inlineFormat(string $text): string
{
    $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    $text = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $text);
    $text = preg_replace('/`([^`]+)`/', '<code>$1</code>', $text);
    $text = preg_replace('/\*(.+?)\*/', '<em>$1</em>', $text);
    return $text;
}

function wrapDocument(string $title, string $body): string
{
    $titulo = $title;
    $subtitulo = 'Versión 2.0 — Mayo 2026';

    if (preg_match('/<h1 class="titulo-md">(.*?)<\/h1>/s', $body, $m)) {
        $titulo = html_entity_decode(strip_tags($m[1]), ENT_QUOTES, 'UTF-8');
        $body = preg_replace('/<h1 class="titulo-md">.*?<\/h1>\s*/s', '', $body, 1);
    }
    if (preg_match('/<p><strong>Versión:<\/strong>\s*([^<]+)<\/p>/', $body, $m)) {
        $subtitulo = 'Versión ' . trim(strip_tags($m[1])) . ' — Mayo 2026';
        $body = preg_replace('/<p><strong>Versión:<\/strong>[^<]*<\/p>\s*/', '', $body, 1);
        $body = preg_replace('/<p><strong>Última actualización:<\/strong>[^<]*<\/p>\s*/', '', $body, 1);
        $body = preg_replace('/<hr class="separador">\s*/', '', $body, 1);
    }

    $contenido = '<div class="contenido-doc">' . $body . '</div>';

    return '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>' . htmlspecialchars($title) . '</title>
    <style>
        @page { size: A4; margin: 20mm 18mm 22mm 18mm; }
        * { box-sizing: border-box; }
        body {
            font-family: Calibri, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.55;
            color: #1a202c;
            margin: 0;
            padding: 0;
        }
        .portada {
            min-height: 88vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            page-break-after: always;
            break-after: page;
            padding: 40px 28px;
        }
        .portada h1 {
            color: #1a3a5f;
            font-size: 24pt;
            border-bottom: 3px solid #1a3a5f;
            padding-bottom: 12px;
            margin: 0 0 16px;
            max-width: 90%;
        }
        .portada .meta { color: #718096; font-size: 12pt; margin: 6px 0; }
        .contenido-doc { padding: 4px 28px 28px; }
        .doc-seccion {
            page-break-before: always;
            break-before: page;
            padding-top: 8px;
        }
        .doc-seccion:first-child {
            page-break-before: auto;
            break-before: auto;
        }
        h2.seccion-titulo {
            color: #fff;
            background: #2c5282;
            font-size: 13pt;
            margin: 0 0 18px;
            padding: 12px 16px;
            page-break-after: avoid;
            break-after: avoid;
        }
        h3 {
            color: #2d3748;
            font-size: 11.5pt;
            margin: 18px 0 10px;
            page-break-after: avoid;
        }
        table.tabla-doc {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 18px;
            font-size: 10pt;
            page-break-inside: avoid;
            break-inside: avoid-page;
        }
        th {
            background: #1a3a5f;
            color: #fff;
            padding: 9px 10px;
            text-align: left;
            width: 28%;
        }
        td, th { border: 1px solid #cbd5e0; padding: 9px 10px; vertical-align: top; }
        tr:nth-child(even) td { background: #f7fafc; }
        pre.codigo-bloque {
            background: #edf2f7;
            border: 1px solid #cbd5e0;
            padding: 14px;
            font-size: 8.5pt;
            line-height: 1.4;
            white-space: pre-wrap;
            word-break: break-word;
            page-break-inside: avoid;
            break-inside: avoid-page;
            margin: 12px 0 18px;
        }
        code {
            font-family: Consolas, "Courier New", monospace;
            font-size: 9.5pt;
            background: #edf2f7;
            padding: 1px 5px;
        }
        pre.codigo-bloque code { background: none; padding: 0; }
        ul { margin: 10px 0; padding-left: 24px; }
        li { margin: 5px 0; }
        hr.separador { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
        p { margin: 8px 0; orphans: 3; widows: 3; }
        p.paso { margin-left: 8px; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th, h2.seccion-titulo { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="portada">
        <h1>' . htmlspecialchars($titulo) . '</h1>
        <p class="meta">' . htmlspecialchars($subtitulo) . '</p>
        <p class="meta">MI HOGAR EN LÍNEA</p>
    </div>
    ' . $contenido . '
</body></html>';
}

function printPdf(string $chrome, string $inputPath, string $outputPath): bool
{
    $url = 'file:///' . str_replace('\\', '/', realpath($inputPath));
    if (file_exists($outputPath)) {
        @unlink($outputPath);
    }

    $cmd = sprintf(
        '"%s" --headless --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw --virtual-time-budget=15000 --print-to-pdf="%s" "%s" 2>&1',
        $chrome,
        $outputPath,
        $url
    );

    exec($cmd, $output, $code);
    if ($code !== 0 || !file_exists($outputPath)) {
        fwrite(STDERR, "Error PDF: $inputPath\n" . implode("\n", $output) . "\n");
        return false;
    }
    return true;
}

// --- Historias de usuario (HTML preparado para impresión) ---
$historiasSrc = $root . DIRECTORY_SEPARATOR . 'HISTORIAS_DE_USUARIO.html';
$historiasPrint = $docsDir . DIRECTORY_SEPARATOR . 'HISTORIAS_DE_USUARIO_PRINT.html';
$historiasHtml = prepareHistoriasForPrint(file_get_contents($historiasSrc));
file_put_contents($historiasPrint, $historiasHtml);
echo "OK: $historiasPrint\n";

// --- Documentación ---
$mdPath = $root . DIRECTORY_SEPARATOR . 'DOCUMENTACION.md';
$docHtmlPath = $docsDir . DIRECTORY_SEPARATOR . 'DOCUMENTACION.html';
file_put_contents($docHtmlPath, wrapDocument('Documentación Técnica - MI HOGAR EN LÍNEA', mdToHtml(file_get_contents($mdPath))));
echo "OK: $docHtmlPath\n";

// --- Chrome ---
$chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

$chrome = null;
foreach ($chromePaths as $p) {
    if (file_exists($p)) {
        $chrome = $p;
        break;
    }
}

if (!$chrome) {
    fwrite(STDERR, "No se encontró Chrome ni Edge.\n");
    exit(1);
}

$ok1 = printPdf($chrome, $historiasPrint, $docsDir . DIRECTORY_SEPARATOR . 'HISTORIAS_DE_USUARIO.pdf');
$ok2 = printPdf($chrome, $docHtmlPath, $docsDir . DIRECTORY_SEPARATOR . 'DOCUMENTACION.pdf');

if ($ok1) {
    echo "PDF: " . $docsDir . DIRECTORY_SEPARATOR . "HISTORIAS_DE_USUARIO.pdf\n";
}
if ($ok2) {
    echo "PDF: " . $docsDir . DIRECTORY_SEPARATOR . "DOCUMENTACION.pdf\n";
}

echo "\nListo. Archivos en: $docsDir\n";
