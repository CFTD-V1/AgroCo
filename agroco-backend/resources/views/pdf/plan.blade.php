<!doctype html>
<html lang="es">
@php
// Helpers de formato
$fmt = function($n, $dec = 0) {
if (!is_numeric($n)) return $n;
return number_format((float)$n, $dec, ',', '.');
};
$smart = function($n) use ($fmt) {
if (!is_numeric($n)) return $n;
$dec = (floor($n) != $n) ? 2 : 0;
return $fmt($n, $dec);
};

// Estructura esperada (la misma del FertilizerPlanResource)
// $plan = [
// 'objetivos' => ['por_hectarea'=>[], 'para_tu_lote'=>[]],
// 'productos' => ['etiquetas'=>[], 'por_hectarea'=>[], 'para_tu_lote'=>[]],
// 'fases' => ['por_hectarea'=>['siembra'=>[], 'macollamiento'=>[], 'embuche'=>[]],
// 'para_tu_lote'=>[...]],
// 'resumen_totales_lote' => [ ['nombre'=>'...', 'kg_totales'=>...], ...]
// ]
$plan = $plan ?? [];
$lotName = $lotName ?? 'Lote';
$areaHa = (float) ($areaHa ?? 1);
@endphp

<head>
    <meta charset="utf-8">
    <title>Plan de fertilización</title>
    <style>
    @page {
        margin: 24mm 16mm 20mm 16mm;
    }

    body {
        font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
        font-size: 12px;
        color: #222;
    }

    h1 {
        font-size: 22px;
        margin: 0 0 6px;
    }

    h2 {
        font-size: 16px;
        margin: 14px 0 8px;
    }

    h3 {
        font-size: 14px;
        margin: 10px 0 6px;
    }

    .small {
        color: #666;
        font-size: 11px;
    }

    .muted {
        color: #6b7280;
    }

    .section {
        margin-top: 10px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0 14px;
    }

    th,
    td {
        border: 1px solid #e5e7eb;
        padding: 6px 8px;
        text-align: left;
    }

    th {
        background: #f3f4f6;
    }

    td.num,
    th.num {
        text-align: right;
        width: 110px;
    }

    .grid-2 {
        width: 100%;
        display: table;
    }

    .col {
        display: table-cell;
        vertical-align: top;
        width: 50%;
        padding-right: 10px;
    }

    .col:last-child {
        padding-right: 0;
        padding-left: 10px;
    }

    .pill {
        display: inline-block;
        background: #f5f7fb;
        border: 1px solid #e5e9f2;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
    }

    .footer {
        position: fixed;
        bottom: -12mm;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 11px;
        color: #666;
    }
    </style>
</head>

<body>

    {{-- Encabezado simple --}}
    <h1>Plan de fertilización</h1>
    <div class="small muted">
        Lote: <strong>{{ $lotName }}</strong> • Área: <strong>{{ $smart($areaHa) }} ha</strong> • Generado:
        {{ now()->format('Y-m-d H:i') }}
    </div>

    {{-- 1) Objetivos nutricionales --}}
    <div class="section">
        <h2>Objetivos nutricionales</h2>
        <div class="small muted">Requerimientos del cultivo de arroz para alcanzar el rendimiento objetivo.</div>
        <div class="grid-2">
            <div class="col">
                <h3>Por hectárea (kg/ha)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nutriente</th>
                            <th class="num">kg/ha</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Nitrógeno (N)</td>
                            <td class="num">{{ $smart($plan['objetivos']['por_hectarea']['n']   ?? 0) }}</td>
                        </tr>
                        <tr>
                            <td>Fósforo (P₂O₅)</td>
                            <td class="num">{{ $smart($plan['objetivos']['por_hectarea']['p2o5']?? 0) }}</td>
                        </tr>
                        <tr>
                            <td>Potasio (K₂O)</td>
                            <td class="num">{{ $smart($plan['objetivos']['por_hectarea']['k2o'] ?? 0) }}</td>
                        </tr>
                        <tr>
                            <td>Azufre (S)</td>
                            <td class="num">{{ $smart($plan['objetivos']['por_hectarea']['s']    ?? 0) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col">
                <h3>Para tu lote (kg totales)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nutriente</th>
                            <th class="num">kg lote</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Nitrógeno (N)</td>
                            <td class="num">{{ $smart($plan['objetivos']['para_tu_lote']['n']   ?? 0) }}</td>
                        </tr>
                        <tr>
                            <td>Fósforo (P₂O₅)</td>
                            <td class="num">{{ $smart($plan['objetivos']['para_tu_lote']['p2o5']?? 0) }}</td>
                        </tr>
                        <tr>
                            <td>Potasio (K₂O)</td>
                            <td class="num">{{ $smart($plan['objetivos']['para_tu_lote']['k2o'] ?? 0) }}</td>
                        </tr>
                        <tr>
                            <td>Azufre (S)</td>
                            <td class="num">{{ $smart($plan['objetivos']['para_tu_lote']['s']    ?? 0) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- 2) Fuentes comerciales --}}
    <div class="section">
        <h2>Fuentes comerciales</h2>
        <div class="small muted">Dosis por hectárea y totales del lote.</div>
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th class="num">kg/ha</th>
                    <th class="num">kg lote</th>
                </tr>
            </thead>
            <tbody>
                @foreach(($plan['productos']['por_hectarea'] ?? []) as $key => $kgHa)
                <tr>
                    <td>{{ $plan['productos']['etiquetas'][$key] ?? $key }}</td>
                    <td class="num">{{ $smart($kgHa) }}</td>
                    <td class="num">{{ $smart($plan['productos']['para_tu_lote'][$key] ?? 0) }}</td>
                </tr>
                @endforeach
                @if(empty($plan['productos']['por_hectarea']))
                <tr>
                    <td colspan="3" class="muted">Sin datos</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    {{-- 3) Fraccionamiento por fases --}}
    <div class="section">
        <h2>Fraccionamiento por fases</h2>
        <div class="small muted">Distribución por fase fenológica (kg/ha y kg totales).</div>

        @foreach(($plan['fases']['por_hectarea'] ?? []) as $fase => $insumos)
        <h3 style="margin-top:10px;">{{ ucfirst($fase) }}</h3>
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th class="num">kg/ha</th>
                    <th class="num">kg lote</th>
                </tr>
            </thead>
            <tbody>
                @foreach($insumos as $prod => $kgHa)
                <tr>
                    <td>{{ $plan['productos']['etiquetas'][$prod] ?? $prod }}</td>
                    <td class="num">{{ $smart($kgHa) }}</td>
                    <td class="num">{{ $smart($plan['fases']['para_tu_lote'][$fase][$prod] ?? 0) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endforeach

        @if(empty($plan['fases']['por_hectarea']))
        <div class="small muted">Sin fraccionamiento definido.</div>
        @endif
    </div>

    {{-- 4) Resumen totales para compra --}}
    <div class="section">
        <h2>Resumen para compra</h2>
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th class="num">kg totales lote</th>
                </tr>
            </thead>
            <tbody>
                @foreach(($plan['resumen_totales_lote'] ?? []) as $r)
                <tr>
                    <td>{{ $r['nombre'] }}</td>
                    <td class="num">{{ $smart($r['kg_totales']) }}</td>
                </tr>
                @endforeach
                @if(empty($plan['resumen_totales_lote']))
                <tr>
                    <td colspan="2" class="muted">Sin datos</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <div class="footer">Documento generado por AgroCo • {{ now()->toDateString() }}</div>
</body>

</html>