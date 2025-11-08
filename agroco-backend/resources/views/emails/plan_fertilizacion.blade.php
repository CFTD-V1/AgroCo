<!doctype html>
<html>

<body style="font-family: sans-serif; color:#222; line-height:1.4;">
    <p>Hola {{ optional($lot->user)->full_name ?? 'Productor' }},</p>

    <p>
        Adjuntamos el <strong>Plan de fertilizacion</strong> para tu lote
        <strong>{{ $lot->name ?? 'Lote #'.$lot->id }}</strong>.
    </p>

    <p>
        <strong>Resumen:</strong><br>
        &bull; Area: {{ $data['resumen']['area_ha'] ?? $lot->area_ha }} ha<br>
        &bull; Rendimiento objetivo: {{ $data['resumen']['meta_rendimiento_t_ha'] ?? $soil->yield_target_t_ha }} t/ha
    </p>

    @if(isset($data['resumen_totales_lote']))
    <p><strong>Totales de fertilizantes para tu lote:</strong></p>
    <ul>
        @foreach($data['resumen_totales_lote'] as $item)
        <li>{{ $item['nombre'] }}: {{ $item['kg_totales'] }} kg</li>
        @endforeach
    </ul>
    @endif

    <p>
        En el PDF adjunto encontraras el detalle de:<br>
        &bull; Objetivos nutricionales (kg/ha y totales)<br>
        &bull; Dosis de cada fertilizante por hectarea y por lote<br>
        &bull; Fraccionamiento por fases (siembra, macollamiento, embuche)
    </p>

    <p>Exitos en tu cultivo de arroz.</p>

    <p style="margin-top:20px;">Equipo AgroCo</p>
</body>

</html>
