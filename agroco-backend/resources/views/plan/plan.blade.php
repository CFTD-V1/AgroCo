<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>Plan de FertilizaciÃ³n - {{ $plan['cultivo'] ?? 'Arroz' }}</title>
    <style>
    body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 12px;
    }

    h1,
    h2 {
        margin: 0 0 8px;
    }

    .box {
        border: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 12px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        border: 1px solid #ddd;
        padding: 6px;
        text-align: left;
    }

    th {
        background: #f2f2f2;
    }

    .small {
        color: #666;
        font-size: 11px;
    }
    </style>
</head>

<body>
    <h1>Plan de FertilizaciÃ³n â {{ $plan['cultivo'] ?? 'Arroz' }}</h1>
    <div class="small">Lote: {{ $lot->name ?? ('#'.$lot->id) }} |
        Ãrea: {{ number_format($plan['area_ha'] ?? 1,2) }} ha |
        Zona: {{ $plan['zona'] ?? 'Huila' }}</div>

    <div class="box">
        <h2>Resumen de suelo</h2>
        <p>pH: <strong>{{ data_get($plan,'suelo.ph') }}</strong> |
            P: <strong>{{ data_get($plan,'suelo.p_mg') }} mg/kg</strong> |
            K: <strong>{{ data_get($plan,'suelo.k_mg') }} mg/kg</strong></p>
    </div>

    <div class="box">
        <h2>Recomendaciones</h2>
        <table>
            <thead>
                <tr>
                    <th>Insumo</th>
                    <th>Dosis (kg/ha)</th>
                    <th>Momento</th>
                    <th>JustificaciÃ³n</th>
                </tr>
            </thead>
            <tbody>
                @foreach(($plan['recs'] ?? []) as $r)
                <tr>
                    <td>{{ $r['insumo'] }}</td>
                    <td>{{ $r['dosis_ha'] }}</td>
                    <td>{{ $r['momento'] }}</td>
                    <td>{{ $r['justifica'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="box">
        <h2>Totales</h2>
        <p>Por hectÃ¡rea: <strong>{{ data_get($plan,'totales.kg_ha') }} kg/ha</strong><br>
            Para el Ã¡rea ({{ number_format($plan['area_ha'] ?? 1,2) }} ha):
            <strong>{{ data_get($plan,'totales.kg_area') }} kg</strong>
        </p>
    </div>

    <p class="small">Generado automÃ¡ticamente por Agroco.</p>
</body>

</html>