ï»¿{{-- resources/views/pdf/plan_fertilizacion.blade.php --}}
@php
$fmt = fn($n,$d=0)=>is_numeric($n)?number_format($n,$d,',','.'):($n??'-');
$smart = function($n) use($fmt){ if(!is_numeric($n)) return $n; $d = (floor($n)!=$n)?2:0; return $fmt($n,$d); };

$lotName = $lot->name ?? ('Lote '.$lot->id);
$areaHa = (float)($plan['objetivos']['para_tu_lote']['n'] ?? 0) > 0
? ($resumen['area_ha'] ?? ($lot->area_ha ?? null))
: ($resumen['area_ha'] ?? ($lot->area_ha ?? null));

$objHa = $plan['objetivos']['por_hectarea'] ?? [];
$objLot = $plan['objetivos']['para_tu_lote'] ?? [];

$prodHa = $plan['productos']['por_hectarea'] ?? [];
$prodLot = $plan['productos']['para_tu_lote'] ?? [];
$labels = $plan['productos']['etiquetas'] ?? [];

$fasesHa = $plan['fases']['por_hectarea'] ?? [];
$fasesLt = $plan['fases']['para_tu_lote'] ?? [];

$resumenCompra = $plan['resumen_totales_lote'] ?? [];
$yieldTarget = $soil->yield_target_t_ha ?? null;
$sampleDate = optional($soil->sampled_at)->format('d/m/Y');
$labels = $plan['productos']['etiquetas'] ?? [];

$phaseTitles = [
    'siembra' => 'Primera aplicacion (0-20 dias)',
    'macollamiento' => 'Segunda aplicacion (20-40 dias)',
    'embuche' => 'Tercera aplicacion (40-80 dias)',
];

$phaseGuides = collect($phaseTitles)->map(function (string $title, string $key) use ($fasesHa, $labels, $fmt) {
    $items = collect($fasesHa[$key] ?? [])->map(function ($kgHa, $code) use ($labels, $fmt) {
        $label = $labels[$code] ?? $code;
        return $label.' '.$fmt($kgHa, 1).' kilogramos por hectarea';
    });

    if ($items->isEmpty()) {
        return null;
    }

    return $title.': '.$items->implode(', ');
})->filter()->values()->all();

$topProducts = collect($resumenCompra)->sortByDesc('kg_totales')->take(3)->map(function ($item) {
    return ($item['nombre'] ?? 'Producto').' '.number_format($item['kg_totales'] ?? 0, 0, ',', '.').' kilogramos totales';
});
@endphp
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Plan de fertilizaciÃ³n</title>
    <style>
    @page {
        margin: 16mm 14mm 16mm 14mm;
    }

    /* Header SOLO primera pÃ¡gina: no usar fixed; va en el flujo normal */
    body {
        font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
        color: #222;
        font-size: 12px;
    }

    h1 {
        font-size: 22px;
        margin: 0 0 2mm 0;
    }

    h2 {
        font-size: 16px;
        margin: 10px 0 6px 0;
    }

    h3 {
        font-size: 14px;
        margin: 8px 0 6px 0;
    }

    .muted {
        color: #666;
    }

    .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .logo img {
        height: 26px;
    }

    .grid-2 {
        width: 100%;
        display: flex;
        gap: 16px;
    }

    .col {
        flex: 1 1 0;
        vertical-align: top;
        padding: 0;
    }

    .col + .col {
        margin-left: 16px;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
        margin: 6px 0 12px 0;
        page-break-inside: avoid;
    }

    .table th,
    .table td {
        border: 1px solid #e5e5e5;
        padding: 6px 8px;
    }

    .table th {
        background: #f2f4f8;
        font-weight: 600;
        text-align: left;
    }

    .num {
        text-align: right;
        width: 110px;
    }

    /* Evita que los bloques/mesas se partan */
    .section {
        page-break-inside: avoid;
    }

    .block {
        page-break-inside: avoid;
    }

    /* Forzar saltos de pÃ¡gina cuando lo pedimos */
    .page-break-before {
        page-break-before: always;
    }

    /* TÃ­tulos de âPor faseâ alineados en dos columnas */
    .two-col-title {
        display: flex;
        justify-content: space-between;
        gap: 16px;
    }

    .two-col-title>div {
        width: 50%;
    }

    /* Espacio superior cuando venimos de salto de pÃ¡gina para que no se âpegueâ arriba */
    .top-pad {
        margin-top: 6mm;
    }

    .farmer-summary {
        background: #f8fafc;
        border: 1px solid #d0d7e3;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 14px;
        line-height: 1.5;
    }

    .farmer-summary strong {
        color: #1f2937;
    }

    .farmer-summary ul {
        margin: 8px 0 0 16px;
        padding: 0;
    }

    .farmer-summary li {
        margin-bottom: 4px;
    }
    .card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
    }

    .card h2 {
        margin-top: 0;
    }

    .phase-card {
        margin-bottom: 12px;
    }

    .phase-card:last-child {
        margin-bottom: 0;
    }
    </style>
</head>

<body>

    {{-- ===== Encabezado SOLO en la primera pÃ¡gina (no fixed) ===== --}}
    <div class="header">
        <div>
            <h1>Plan de fertilizacin - {{ $lotName }}</h1>
            <div class="muted">
                Cultivo: {{ $lot->crop ?? '-' }} | rea: {{ $fmt($areaHa,2) }} ha | Meta: {{ $fmt($yieldTarget,1) }} t/ha |
                Fecha base: {{ $sampleDate ?? 'Sin dato' }}
            </div>
        </div>
            </div>

    {{-- ================= OBJETIVOS ================= --}}
    <div class="card farmer-summary">
        <h2>Como aplicar este plan</h2>
        <p>Este plan esta pensado para lograr {{ $fmt($yieldTarget,1) }} toneladas por hectarea en {{ $fmt($areaHa,2) }} hectareas. Sigue el orden que ves a continuacion y trata de cumplir las fechas lo mejor posible.</p>
        @if($phaseGuides)
            <ol>
                @foreach($phaseGuides as $guide)
                    <li>{{ $guide }}.</li>
                @endforeach
            </ol>
        @endif
        @if($topProducts->isNotEmpty())
            <p><strong>Compra minima sugerida:</strong> {{ $topProducts->implode('; ') }}.</p>
        @endif
        <p class="small muted">Consejo practico: aplica siempre con el suelo ligeramente humedo, calibra la fertilizadora para repartir parejo y anota en la app lo que observes para mejorar cada campaÃ±a.</p>
    </div>
    <div class="card">
        <h2>Requerimientos nutricionales</h2>
        <div class="grid-2">
            <div class="col">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nutriente</th>
                            <th class="num">kg por hectarea</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($objHa as $nut => $kg)
                        <tr>
                            <td>{{ strtoupper($nut) }}</td>
                            <td class="num">{{ $smart($kg) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="col">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nutriente</th>
                            <th class="num">kg totales para el lote</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($objLot as $nut => $kg)
                        <tr>
                            <td>{{ strtoupper($nut) }}</td>
                            <td class="num">{{ $smart($kg) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- ================= PRODUCTOS ================= --}}
    <h2 class="section">Productos totales</h2>
    <div class="grid-2 section">
        <div class="col">
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="num">kg/ha</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($prodHa as $key => $kg)
                    <tr>
                        <td>{{ $labels[$key] ?? $key }}</td>
                        <td class="num">{{ $smart($kg) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="col">
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="num">kg totales</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($prodLot as $key => $kg)
                    <tr>
                        <td>{{ $labels[$key] ?? $key }}</td>
                        <td class="num">{{ $smart($kg) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    {{-- ====== SALTO DE PÃGINA ANTES DE âPOR FASEâ ====== --}}
    <div class="page-break-before"></div>

    {{-- ================= POR FASE (dos columnas por fase) ================= --}}
    <h2 class="top-pad section">Por fase</h2>

    @php
    $titulos = ['siembra' => 'Siembra (0-20)dias', 'macollamiento' => 'Macollamiento (20-40)dias', 'embuche' => 'Embuche
    (40-80)dias'];
    @endphp

    @foreach ($fasesHa as $fase => $tabla)
    <h3 class="section">{{ $titulos[$fase] ?? ucfirst($fase) }}</h3>
    <div class="grid-2 section">
        <div class="col">
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="num">kg/ha</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($tabla as $key => $kg)
                    <tr>
                        <td>{{ $labels[$key] ?? $key }}</td>
                        <td class="num">{{ $smart($kg) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="col">
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="num">kg totales</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach (($fasesLt[$fase] ?? []) as $key => $kg)
                    <tr>
                        <td>{{ $labels[$key] ?? $key }}</td>
                        <td class="num">{{ $smart($kg) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endforeach

    {{-- ====== SALTO DE PÃGINA ANTES DEL RESUMEN ====== --}}
    <div class="page-break-before"></div>

    {{-- ================= RESUMEN DE COMPRA EN HOJA SOLA ================= --}}
    <h2 class="top-pad section">Resumen de compra (kg totales por producto)</h2>
    <table class="table section">
        <thead>
            <tr>
                <th>Producto</th>
                <th class="num">kg totales</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($resumenCompra as $row)
            <tr>
                <td>{{ $row['nombre'] ?? '-' }}</td>
                <td class="num">{{ $smart($row['kg_totales'] ?? 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

</body>

</html>



