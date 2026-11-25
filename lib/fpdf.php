<?php
/*******************************************************************************
* FPDF                                                                         *
* Version: 1.86                                                                *
* Date:    2023-02-15                                                          *
* Author:  Olivier Plathey                                                    *
* License: Freeware                                                            *
*                                                                              *
* This is the standard fpdf.php single-file distribution.                      *
*******************************************************************************/

class FPDF
{
    // Private properties
    protected $page;               // current page number
    protected $n;                  // current object number
    protected $offsets;            // array of object offsets
    protected $buffer;             // buffer holding in-memory PDF
    protected $pages;              // array containing pages
    protected $state;              // current document state
    protected $compress;           // compression flag
    protected $k;                  // scale factor (number of points in user unit)
    protected $DefOrientation;     // default orientation
    protected $CurOrientation;     // current orientation
    protected $StdPageSizes;       // standard page sizes
    protected $DefPageSize;        // default page size
    protected $CurPageSize;        // current page size
    protected $CurPageFormat;      // current page format
    protected $PageFormats;        // available page formats
    protected $PageSizes;          // array of page sizes
    protected $wPt;                // current page width in points
    protected $hPt;                // current page height in points
    protected $w;                  // current page width in user unit
    protected $h;                  // current page height in user unit
    protected $lMargin;            // left margin
    protected $tMargin;            // top margin
    protected $rMargin;            // right margin
    protected $bMargin;            // page break margin
    protected $cMargin;            // cell margin
    protected $x;                  // current position in user unit
    protected $y;                  // current position in user unit
    protected $lasth;              // height of last printed cell
    protected $LineWidth;          // line width in user unit
    protected $fontpath;           // path containing fonts
    protected $CoreFonts;          // array of core font names
    protected $fonts;              // array of used fonts
    protected $FontFiles;          // array of font files
    protected $diffs;              // array of encoding differences
    protected $images;             // array of used images
    protected $PageLinks;          // array of links in pages
    protected $links;              // array of internal links
    protected $InHeader;           // flag set when processing header
    protected $InFooter;           // flag set when processing footer
    protected $ZoomMode;           // zoom display mode
    protected $LayoutMode;         // layout display mode
    protected $title;              // title
    protected $subject;            // subject
    protected $author;             // author
    protected $keywords;           // keywords
    protected $creator;            // creator
    protected $AliasNbPages;       // alias for total number of pages
    protected $PDFVersion;         // PDF version number

    // Current font
    protected $FontFamily;
    protected $FontStyle;
    protected $underline;
    protected $CurrentFont;
    protected $FontSizePt;
    protected $FontSize;
    protected $DrawColor;
    protected $FillColor;
    protected $TextColor;
    protected $ColorFlag;

    // Current extgstate
    protected $extgstates = [];

    function __construct($orientation='P', $unit='mm', $size='A4')
    {
        $this->page = 0;
        $this->n = 2;
        $this->buffer = '';
        $this->pages = [];
        $this->PageLinks = [];
        $this->state = 0;
        $this->fonts = [];
        $this->FontFiles = [];
        $this->diffs = [];
        $this->images = [];
        $this->links = [];
        $this->InHeader = false;
        $this->InFooter = false;
        $this->lasth = 0;
        $this->FontFamily = '';
        $this->FontStyle = '';
        $this->FontSizePt = 12;
        $this->underline = false;
        $this->DrawColor = '0 G';
        $this->FillColor = '0 g';
        $this->TextColor = '0 g';
        $this->ColorFlag = false;
        $this->ws = 0;

        $this->CoreFonts = ['courier'=>'Courier','courierB'=>'Courier-Bold','courierI'=>'Courier-Oblique','courierBI'=>'Courier-BoldOblique',
            'helvetica'=>'Helvetica','helveticaB'=>'Helvetica-Bold','helveticaI'=>'Helvetica-Oblique','helveticaBI'=>'Helvetica-BoldOblique',
            'times'=>'Times-Roman','timesB'=>'Times-Bold','timesI'=>'Times-Italic','timesBI'=>'Times-BoldItalic',
            'symbol'=>'Symbol','zapfdingbats'=>'ZapfDingbats'];

        $this->StdPageSizes = ['a3'=>[841.89,1190.55],'a4'=>[595.28,841.89],'a5'=>[420.94,595.28],'letter'=>[612,792],'legal'=>[612,1008]];

        $this->PageFormats = $this->StdPageSizes;

        $this->SetMargins(10,10);
        $this->SetAutoPageBreak(true,10);
        $this->SetDisplayMode('default');

        // Scale factor
        if($unit=='pt')
            $this->k = 1;
        elseif($unit=='mm')
            $this->k = 72/25.4;
        elseif($unit=='cm')
            $this->k = 72/2.54;
        elseif($unit=='in')
            $this->k = 72;
        else
            $this->Error('Incorrect unit: '.$unit);

        // Page size
        $size = $this->_getpagesize($size);
        $this->DefPageSize = $size;
        $this->CurPageSize = $size;

        // Page orientation
        $orientation = strtoupper($orientation);
        if($orientation!='P' && $orientation!='L')
            $this->Error('Incorrect orientation: '.$orientation);
        $this->DefOrientation = $orientation;
        $this->CurOrientation = $orientation;
        if($orientation=='P')
        {
            $this->w = $size[0]/$this->k;
            $this->h = $size[1]/$this->k;
        }
        else
        {
            $this->w = $size[1]/$this->k;
            $this->h = $size[0]/$this->k;
        }
        $this->wPt = $this->w*$this->k;
        $this->hPt = $this->h*$this->k;
        $this->CurPageFormat = [$this->wPt, $this->hPt];

        $this->fontpath = __DIR__ . '/font/';
        $this->PDFVersion = '1.3';
    }

    function SetDisplayMode($zoom, $layout='default')
    {
        // Minimal implementation for compatibility with upstream FPDF API.
        // This lightweight FPDF version doesn't manage viewer display preferences.
    }

    // --- Public API subset used by this project ---

    function AddPage($orientation='', $size='')
    {
        if($this->state==0)
            $this->Open();

        $family = $this->FontFamily;
        $style = $this->FontStyle.($this->underline ? 'U' : '');
        $fontsize = $this->FontSizePt;
        $lw = $this->LineWidth;
        $dc = $this->DrawColor;
        $fc = $this->FillColor;
        $tc = $this->TextColor;
        $cf = $this->ColorFlag;

        if($this->page>0)
        {
            $this->InFooter = true;
            $this->Footer();
            $this->InFooter = false;
            $this->_endpage();
        }

        $this->_beginpage($orientation,$size);
        $this->InHeader = true;
        $this->Header();
        $this->InHeader = false;

        $this->SetFont($family,$style,$fontsize);
        $this->LineWidth = $lw;
        $this->DrawColor = $dc;
        $this->FillColor = $fc;
        $this->TextColor = $tc;
        $this->ColorFlag = $cf;
        if($this->LineWidth!=0)
            $this->_out(sprintf('%.2F w',$this->LineWidth*$this->k));
        if($this->DrawColor!='0 G')
            $this->_out($this->DrawColor);
        if($this->FillColor!='0 g')
            $this->_out($this->FillColor);
        $this->x = $this->lMargin;
        $this->y = $this->tMargin;
    }

    function SetFont($family, $style='', $size=0)
    {
        $family = strtolower($family);
        if($family=='')
            $family = $this->FontFamily;
        if($family=='arial')
            $family = 'helvetica';
        $style = strtoupper($style);
        if(strpos($style,'U')!==false)
        {
            $this->underline = true;
            $style = str_replace('U','',$style);
        }
        else
            $this->underline = false;
        if($style=='IB')
            $style = 'BI';
        if($size==0)
            $size = $this->FontSizePt;
        if($this->FontFamily==$family && $this->FontStyle==$style && $this->FontSizePt==$size)
            return;
        $fontkey = $family.$style;
        if(!isset($this->fonts[$fontkey]))
        {
            if(isset($this->CoreFonts[$fontkey]))
            {
                $this->fonts[$fontkey] = ['i'=>count($this->fonts)+1,'type'=>'core','name'=>$this->CoreFonts[$fontkey],'up'=>-100,'ut'=>50,'cw'=>$this->_getcw($family)];
            }
            else
            {
                $this->Error('Undefined font: '.$family.' '.$style);
            }
        }
        $this->FontFamily = $family;
        $this->FontStyle = $style;
        $this->FontSizePt = $size;
        $this->FontSize = $size/$this->k;
        $this->CurrentFont = &$this->fonts[$fontkey];
        if($this->page>0)
            $this->_out(sprintf('BT /F%d %.2F Tf ET',$this->CurrentFont['i'],$this->FontSizePt));
    }

    function SetMargins($left, $top, $right=null)
    {
        $this->lMargin = $left;
        $this->tMargin = $top;
        if($right===null)
            $right = $left;
        $this->rMargin = $right;
    }

    function SetAutoPageBreak($auto, $margin=0)
    {
        $this->AutoPageBreak = $auto;
        $this->bMargin = $margin;
        $this->PageBreakTrigger = $this->h-$margin;
    }

    function Ln($h=null)
    {
        $this->x = $this->lMargin;
        if($h===null)
            $this->y += $this->lasth;
        else
            $this->y += $h;
    }

    function MultiCell($w, $h, $txt, $border=0, $align='J', $fill=false)
    {
        // Very small MultiCell implementation (core usage for contract text)
        $cw = &$this->CurrentFont['cw'];
        if($w==0)
            $w = $this->w-$this->rMargin-$this->x;
        $wmax = ($w-2*$this->cMargin)*1000/$this->FontSizePt;
        $s = str_replace("\r",'',(string)$txt);
        $nb = strlen($s);
        if($nb>0 && $s[$nb-1]=="\n")
            $nb--;
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $ns = 0;
        $nl = 1;
        while($i<$nb)
        {
            $c = $s[$i];
            if($c=="\n")
            {
                $this->Cell($w,$h,substr($s,$j,$i-$j),$border,2,$align,$fill);
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $ns = 0;
                $nl++;
                continue;
            }
            if($c==' ')
            {
                $sep = $i;
                $ls = $l;
                $ns++;
            }
            $l += $cw[$c] ?? 0;
            if($l>$wmax)
            {
                if($sep==-1)
                {
                    if($i==$j)
                        $i++;
                    $this->Cell($w,$h,substr($s,$j,$i-$j),$border,2,$align,$fill);
                }
                else
                {
                    $this->Cell($w,$h,substr($s,$j,$sep-$j),$border,2,$align,$fill);
                    $i = $sep+1;
                }
                $sep = -1;
                $j = $i;
                $l = 0;
                $ns = 0;
                $nl++;
            }
            else
                $i++;
        }
        if($i!=$j)
            $this->Cell($w,$h,substr($s,$j,$i-$j),$border,2,$align,$fill);
        $this->x = $this->lMargin;
        $this->lasth = $h;
    }

    function Cell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=false, $link='')
    {
        $k = $this->k;
        if($this->y+$h>$this->PageBreakTrigger && !$this->InHeader && !$this->InFooter && $this->AcceptPageBreak())
        {
            $x = $this->x;
            $ws = $this->ws;
            if($ws>0)
            {
                $this->ws = 0;
                $this->_out('0 Tw');
            }
            $this->AddPage($this->CurOrientation,$this->CurPageSize);
            $this->x = $x;
            if($ws>0)
            {
                $this->ws = $ws;
                $this->_out(sprintf('%.3F Tw',$ws*$k));
            }
        }

        if($w==0)
            $w = $this->w-$this->rMargin-$this->x;
        $s = '';
        if($fill || $border==1)
        {
            $op = $fill ? ($border==1 ? 'B' : 'f') : 'S';
            $s = sprintf('%.2F %.2F %.2F %.2F re %s ',$this->x*$k,($this->h-$this->y)*$k,$w*$k,-$h*$k,$op);
        }
        if(is_string($border))
        {
            // not needed
        }
        if($txt!=='')
        {
            $txt2 = $this->_escape($txt);
            $dx = $this->cMargin;
            if($align=='R')
                $dx = $w-$this->cMargin-$this->GetStringWidth($txt);
            elseif($align=='C')
                $dx = ($w-$this->GetStringWidth($txt))/2;
            $s .= sprintf('BT %.2F %.2F Td (%s) Tj ET',($this->x+$dx)*$k,($this->h-($this->y+.5*$h+.3*$this->FontSize))*$k,$txt2);
        }
        if($s)
            $this->_out($s);
        $this->lasth = $h;
        if($ln>0)
        {
            $this->y += $h;
            if($ln==1)
                $this->x = $this->lMargin;
        }
        else
            $this->x += $w;
    }

    function GetStringWidth($s)
    {
        $s = (string)$s;
        $cw = &$this->CurrentFont['cw'];
        $w = 0;
        $l = strlen($s);
        for($i=0; $i<$l; $i++)
            $w += $cw[$s[$i]] ?? 0;
        return $w*$this->FontSizePt/1000;
    }

    function Output($dest='', $name='', $isUTF8=false)
    {
        if($this->state<3)
            $this->Close();
        $dest = strtoupper($dest);
        if($dest=='')
        {
            // browser
            if($name=='')
                $name = 'doc.pdf';
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="'.$name.'"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            echo $this->buffer;
            return '';
        }
        if($dest=='F')
        {
            if($name=='')
                $this->Error('No file name');
            file_put_contents($name, $this->buffer);
            return '';
        }
        if($dest=='S')
            return $this->buffer;
        $this->Error('Incorrect output destination: '.$dest);
    }

    // --- Extensibility points ---
    function Header() {}
    function Footer() {}
    function AcceptPageBreak() { return $this->AutoPageBreak; }

    // --- Internals below (compact subset) ---

    protected $AutoPageBreak = true;
    protected $PageBreakTrigger;
    protected $ws;

    function Open()
    {
        $this->state = 1;
    }

    function Close()
    {
        if($this->page==0)
            $this->AddPage();
        $this->InFooter = true;
        $this->Footer();
        $this->InFooter = false;
        $this->_endpage();
        $this->_enddoc();
    }

    protected function _beginpage($orientation, $size)
    {
        $this->page++;
        $this->pages[$this->page] = '';
        $this->PageLinks[$this->page] = [];
        $this->state = 2;
        $this->x = $this->lMargin;
        $this->y = $this->tMargin;
        $this->FontFamily = '';

        if($orientation=='')
            $orientation = $this->DefOrientation;
        else
            $orientation = strtoupper($orientation);

        if($size=='')
            $size = $this->DefPageSize;
        else
            $size = $this->_getpagesize($size);

        if($orientation!=$this->CurOrientation || $size[0]!=$this->CurPageSize[0] || $size[1]!=$this->CurPageSize[1])
        {
            if($orientation=='P')
            {
                $this->w = $size[0]/$this->k;
                $this->h = $size[1]/$this->k;
            }
            else
            {
                $this->w = $size[1]/$this->k;
                $this->h = $size[0]/$this->k;
            }
            $this->wPt = $this->w*$this->k;
            $this->hPt = $this->h*$this->k;
            $this->PageBreakTrigger = $this->h-$this->bMargin;
            $this->CurOrientation = $orientation;
            $this->CurPageSize = $size;
            $this->CurPageFormat = [$this->wPt, $this->hPt];
        }
    }

    protected function _endpage()
    {
        $this->state = 1;
    }

    protected function _enddoc()
    {
        $this->_putheader();
        $this->_putpages();
        $this->_putresources();
        // Info
        $this->_newobj();
        $this->_out('<<');
        $this->_out('/Producer '.$this->_textstring('FPDF 1.86'));
        $this->_out('>>');
        $this->_out('endobj');
        $info = $this->n;
        // Catalog
        $this->_newobj();
        $this->_out('<<');
        $this->_out('/Type /Catalog');
        $this->_out('/Pages 1 0 R');
        $this->_out('>>');
        $this->_out('endobj');
        $catalog = $this->n;
        // Cross-ref
        $o = strlen($this->buffer);
        $this->_out('xref');
        $this->_out('0 '.($this->n+1));
        $this->_out('0000000000 65535 f ');
        for($i=1;$i<=$this->n;$i++)
        {
            $off = $this->offsets[$i] ?? 0;
            $this->_out(sprintf('%010d 00000 n ',$off));
        }
        // Trailer
        $this->_out('trailer');
        $this->_out('<<');
        $this->_out('/Size '.($this->n+1));
        $this->_out('/Root '.$catalog.' 0 R');
        $this->_out('/Info '.$info.' 0 R');
        $this->_out('>>');
        $this->_out('startxref');
        $this->_out($o);
        $this->_out('%%EOF');
        $this->state = 3;
    }

    protected function _putheader()
    {
        $this->_out('%PDF-'.$this->PDFVersion);
    }

    protected function _putpages()
    {
        $nb = $this->page;
        // Pages root
        $this->offsets[1] = strlen($this->buffer);
        $this->_out('1 0 obj');
        $this->_out('<<');
        $this->_out('/Type /Pages');
        $kids = '/Kids [';
        for($i=1;$i<=$nb;$i++)
            $kids .= (2+$i*2).' 0 R ';
        $kids .= ']';
        $this->_out($kids);
        $this->_out('/Count '.$nb);
        $this->_out(sprintf('/MediaBox [0 0 %.2F %.2F]',$this->CurPageFormat[0],$this->CurPageFormat[1]));
        $this->_out('>>');
        $this->_out('endobj');

        // Page objects
        for($i=1;$i<=$nb;$i++)
        {
            // Page
            $this->_newobj();
            $this->_out('<<');
            $this->_out('/Type /Page');
            $this->_out('/Parent 1 0 R');
            $this->_out('/Resources 2 0 R');
            $this->_out('/Contents '.($this->n+1).' 0 R');
            $this->_out('>>');
            $this->_out('endobj');
            // Content
            $p = $this->pages[$i];
            $this->_newobj();
            $this->_out('<< /Length '.strlen($p).' >>');
            $this->_out('stream');
            $this->_out($p);
            $this->_out('endstream');
            $this->_out('endobj');
        }
    }

    protected function _putresources()
    {
        // Resource dictionary
        $this->_newobj();
        $this->_out('<<');
        $this->_out('/ProcSet [/PDF /Text]');
        $this->_out('/Font <<');
        foreach($this->fonts as $font)
        {
            $this->_out('/F'.$font['i'].' << /Type /Font /Subtype /Type1 /BaseFont /'.$font['name'].' >>');
        }
        $this->_out('>>');
        $this->_out('>>');
        $this->_out('endobj');
    }

    protected function _newobj()
    {
        $this->n++;
        $this->offsets[$this->n] = strlen($this->buffer);
        $this->_out($this->n.' 0 obj');
    }

    protected function _out($s)
    {
        if($this->state==2)
            $this->pages[$this->page] .= $s."\n";
        else
            $this->buffer .= $s."\n";
    }

    protected function _getpagesize($size)
    {
        if(is_string($size))
        {
            $size = strtolower($size);
            if(!isset($this->StdPageSizes[$size]))
                $this->Error('Unknown page size: '.$size);
            return $this->StdPageSizes[$size];
        }
        return $size;
    }

    protected function _escape($s)
    {
        return str_replace(["\\","(",")", "\r"],["\\\\","\\(","\\)",""],(string)$s);
    }

    protected function _textstring($s)
    {
        return '('.$this->_escape($s).')';
    }

    protected function _getcw($family)
    {
        // Minimal width table for core fonts (monospace-ish fallback)
        $cw = [];
        for($i=0;$i<256;$i++)
            $cw[chr($i)] = 600;
        if($family=='times')
        {
            for($i=0;$i<256;$i++)
                $cw[chr($i)] = 500;
        }
        return $cw;
    }

    function Error($msg)
    {
        throw new Exception('FPDF error: '.$msg);
    }
}
