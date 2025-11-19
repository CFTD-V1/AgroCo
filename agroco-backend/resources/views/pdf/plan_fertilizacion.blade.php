{{-- resources/views/pdf/plan_fertilizacion.blade.php --}}

@php
$fmt = function ($n, $d = 0) {
    return is_numeric($n) ? number_format($n, $d, ',', '.') : ($n ?? '-');
};

$num = function ($n) use ($fmt) {
    if (!is_numeric($n)) {
        return $n ?? '-';
    }
    $d = (floor($n) != $n) ? 2 : 0;
    return $fmt($n, $d);
};

$lotName    = $lot->name ?? ('Lote '.$lot->id);
$areaHa     = $lot->area_ha ?? 1;
$yieldTarget = $soil->yield_target_t_ha ?? null;
$sampleDate  = optional($soil->sampled_at)->format('d/m/Y');

$objHa  = $plan['objetivos']['por_hectarea']   ?? [];
$objLot = $plan['objetivos']['para_tu_lote']   ?? [];

$prodHa = $plan['productos']['por_hectarea']   ?? [];
$prodLot= $plan['productos']['para_tu_lote']   ?? [];
$labels = $plan['productos']['etiquetas']      ?? [];

$fasesHa = $plan['fases']['por_hectarea']      ?? [];
$fasesLt = $plan['fases']['para_tu_lote']      ?? [];

$resumenCompra = $plan['resumen_totales_lote'] ?? [];

$phaseTitles = [
    'siembra'       => 'Siembra (0 - 20 dias)',
    'macollamiento' => 'Macollamiento (20 - 40 dias)',
    'embuche'       => 'Embuche (40 - 80 dias)',
];

$phaseGuides = collect($phaseTitles)->map(function (string $title, string $key) use ($fasesHa, $labels, $fmt) {
    $items = collect($fasesHa[$key] ?? [])->map(function ($kgHa, $code) use ($labels, $fmt) {
        $label = $labels[$code] ?? $code;
        return $label.' '.$fmt($kgHa, 1).' kg por hectarea';
    });

    if ($items->isEmpty()) {
        return null;
    }

    return $title.': '.$items->implode(', ');
})->filter()->values()->all();

$topProducts = collect($resumenCompra)
    ->sortByDesc('kg_totales')
    ->take(3)
    ->map(function ($item) {
        return ($item['nombre'] ?? 'Producto').' '.number_format($item['kg_totales'] ?? 0, 0, ',', '.').' kg totales';
    });
@endphp

<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Plan de fertilizacion</title>
    <style>
        @page { margin: 16mm 14mm 16mm 14mm; }

        body {
            font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
            color: #222;
            font-size: 12px;
        }

        h1 { font-size: 22px; margin: 0 0 4mm 0; }
        h2 { font-size: 16px; margin: 10px 0 6px 0; }
        h3 { font-size: 14px; margin: 8px 0 6px 0; }

        .muted { color: #666; }

        .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .card h2 { margin-top: 0; }

        .grid-2 {
            width: 100%;
            display: flex;
            gap: 16px;
        }
        .col { flex: 1 1 0; vertical-align: top; padding: 0; }
        .col + .col { margin-left: 16px; }

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
       .num { text-align: right; width: 110px; }

       .section { page-break-inside: avoid; }
       .page-break-before { page-break-before: always; }
       .top-pad { margin-top: 6mm; }

        .instructions {
            margin-top: 4mm;
            padding: 12px 16px;
            border-radius: 12px;
            background: #f5f7ff;
            border: 1px solid #dbe4ff;
        }
        .instructions h3 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #1f2937;
        }
        .instructions ul {
            padding-left: 1.1em;
            margin: 0;
            color: #1e1e1e;
        }
        .instructions li {
            margin-bottom: 4px;
            font-size: 12px;
            line-height: 1.4;
        }

        .farmer-summary {
            background: #f8fafc;
            border: 1px solid #d0d7e3;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 14px;
            line-height: 1.5;
        }
        .farmer-summary strong { color: #1f2937; }
        .farmer-summary ul { margin: 8px 0 0 16px; padding: 0; }
        .farmer-summary li { margin-bottom: 4px; }

        .small { font-size: 11px; }
    </style>
</head>
<body>

    {{-- ENCABEZADO PRINCIPAL --}}
    <div class="header">
        <div>
            <h1>Plan de fertilizacion para el lote {{ $lotName }}</h1>
            <div class="muted">
                Cultivo: {{ $lot->crop ?? '-' }} |
                Area: {{ $fmt($areaHa,2) }} ha |
                Meta: {{ $fmt($yieldTarget,1) }} t/ha |
                Fecha base del analisis: {{ $sampleDate ?? 'Sin dato' }}
            </div>
        </div>
    </div>

    {{-- GUIA EN LENGUAJE SENCILLO --}}
    <div class="card farmer-summary">
        <h2>Como leer este plan (explicado sencillo)</h2>
        <p>
            Imagina que este papel es una receta para alimentar tu cultivo de arroz.
            Te dice cuanto alimento necesita la planta y en que momentos debes darselo.
        </p>
        <ul>
            <li><strong>Paso 1:</strong> Mira arriba el nombre del lote, el area en hectareas y la meta de toneladas por hectarea.</li>
            <li><strong>Paso 2:</strong> En <em>Requerimientos nutricionales</em> veras cuanto N, P, K y S necesita la planta.</li>
            <li><strong>Paso 3:</strong> En <em>Productos totales</em> veras cuantos kilos de cada fertilizante comercial debes comprar.</li>
            <li><strong>Paso 4:</strong> En <em>Por fase</em> se explica que aplicar en siembra, macollamiento y embuche.</li>
        </ul>
        @if($phaseGuides)
            <p>En pocas palabras, las aplicaciones se reparten asi:</p>
            <ol>
                @foreach($phaseGuides as $guide)
                    <li>{{ $guide }}.</li>
                @endforeach
            </ol>
        @endif
        @if($topProducts->isNotEmpty())
            <p><strong>Productos mas importantes:</strong> {{ $topProducts->implode('; ') }}.</p>
        @endif
        <p class="small muted">
            Consejo practico: aplica siempre con el suelo ligeramente humedo, calibra la fertilizadora para repartir parejo
            y anota en la app o en un cuaderno lo que observes para mejorar cada campana.
        </p>
    </div>

    {{-- REQUERIMIENTOS NUTRICIONALES --}}
    <div class="card section">
        <h2>Requerimientos nutricionales del cultivo</h2>
        <p class="small">
            Esta tabla muestra cuantos kilos de cada nutriente necesita la planta.
            Piensa que cada hectarea es un "nino" y aqui decimos cuanta comida recibe cada uno
            y cuanto necesita todo el grupo (todo el lote).
        </p>
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
                                <td class="num">{{ $num($kg) }}</td>
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
                                <td class="num">{{ $num($kg) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- PRODUCTOS TOTALES --}}
    <div class="card section">
        <h2>Productos totales (que comprar y cuanto)</h2>
        <p class="small">
            Aqui convertimos los nutrientes (N, P, K, S) en sacos reales de fertilizante.
            Cada fila te dice que producto usar y cuantos kilos por hectarea y para todo el lote.
        </p>
        <div class="grid-2">
            <div class="col">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th class="num">kg por hectarea</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($prodHa as $key => $kg)
                            <tr>
                                <td>{{ $labels[$key] ?? $key }}</td>
                                <td class="num">{{ $num($kg) }}</td>
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
                            <th class="num">kg totales para el lote</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($prodLot as $key => $kg)
                            <tr>
                                <td>{{ $labels[$key] ?? $key }}</td>
                                <td class="num">{{ $num($kg) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- SALTO DE PAGINA ANTES DE POR FASE --}}
    <div class="page-break-before"></div>

    {{-- POR FASE --}}
    <h2 class="top-pad section">Aplicaciones por fase del cultivo</h2>
    <p class="small">
        En esta parte dividimos la "comida" en momentos del crecimiento del cultivo:
        siembra, macollamiento y embuche. Cada tabla indica que producto usar y cuantos kilos.
    </p>

    @php
        $titulos = [
            'siembra'       => 'Siembra (0 - 20 dias)',
            'macollamiento' => 'Macollamiento (20 - 40 dias)',
            'embuche'       => 'Embuche (40 - 80 dias)',
        ];
    @endphp

    @foreach ($fasesHa as $fase => $tabla)
        <div class="card section">
            <h3>{{ $titulos[$fase] ?? ucfirst($fase) }}</h3>
            <div class="grid-2">
                <div class="col">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th class="num">kg por hectarea</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($tabla as $key => $kg)
                                <tr>
                                    <td>{{ $labels[$key] ?? $key }}</td>
                                    <td class="num">{{ $num($kg) }}</td>
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
                                <th class="num">kg totales en esta fase</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach (($fasesLt[$fase] ?? []) as $key => $kg)
                                <tr>
                                    <td>{{ $labels[$key] ?? $key }}</td>
                                    <td class="num">{{ $num($kg) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    @endforeach

    <div class="card security instructions section">
        <h3>Cómo aplicar los fertilizantes</h3>
        <ul>
            <li>Calibra la barrena o aplicador antes de comenzar. Aplica solo con el suelo húmedo y sin lluvia fuerte para evitar pérdidas por lixiviación.</li>
            <li>En siembra, distribuye yeso/amonio y DAP en banda a 8-10 cm del surco; cubre con luz y asegúrate de que el producto quede dentro del perfil de las primeras 10-15 cm.</li>
            <li>Durante macollamiento y embuche, reparte la urea y KCl como cobertura superficial en ambos lados del surco, siguiendo los porcentajes por fase que aparecen arriba; deja un espacio de 5-6 cm del tallo para evitar quema.</li>
            <li>Siempre humedece ligeramente después de cada fraccionamiento para activar los nutrientes, excepto si viene lluvia intensa (entonces espera a que la humedad se estabilice).</li>
            <li>Aplica los micronutrientes (Zn, Mn, B) temprano en la etapa vegetativa para corregir deficiencias; el manganeso foliar es ideal cerca del macollamiento.</li>
            <li>Usa equipo de seguridad y evita mezclar productos incompatibles en una misma tolva.</li>
        </ul>
    </div>

    {{-- SALTO DE PAGINA ANTES DEL RESUMEN --}}
    <div class="page-break-before"></div>

    {{-- RESUMEN DE COMPRA --}}
    <div class="card top-pad section">
        <h2>Resumen de compra (lista para la agropecuaria)</h2>
        <p class="small">
            Esta tabla junta todos los productos y todos los kilos totales.
            Es la lista que puedes llevar a la tienda para comprar lo necesario.
        </p>
        <table class="table">
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
                        <td class="num">{{ $num($row['kg_totales'] ?? 0) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</body>
</html>
