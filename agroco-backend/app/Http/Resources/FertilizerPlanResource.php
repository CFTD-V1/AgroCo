<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FertilizerPlanResource extends JsonResource
{
    public function toArray($request): array
    {
        // Área del lote (ha)
        $areaHa = (float) ($this->soilAnalysis->lot->area_ha ?? 1);

        // Helpers
        $onlyPositive = fn (array $arr): array
            => array_filter($arr, fn($v) => is_numeric($v) ? (float)$v > 0 : !empty($v));

        $fixKeys = function (array $arr): array {
            $out = [];
            foreach ($arr as $k => $v) {
                $k = str_replace(' ', '_', strtolower((string)$k));
                $out[$k] = $v;
            }
            return $out;
        };

        // Etiquetas amigables (para UI)
        $labels = [
            'urea_46'            => 'Urea 46% N',
            'asam_21_24s'        => 'Sulfato de amonio 21-24S',
            'dap_18_46_0'        => 'DAP 18-46-0',
            'kcl_0_0_60'         => 'Cloruro de potasio 0-0-60',
            'k2so4_0_0_50_18s'   => 'Sulfato de potasio 0-0-50 (18% S)',
            'yeso_agricola'      => 'Yeso agrícola',
            'cal_agricola'       => 'Cal agrícola',
            'kieserita_16mg_13s' => 'Kieserita (16% Mg, 13% S)',
            'dolomita'           => 'Dolomita',
            'znso4_suelo'        => 'Sulfato de zinc (suelo)',
            'znso4_foliar'       => 'Sulfato de zinc (foliar)',
            'mnso4_suelo'        => 'Sulfato de manganeso (suelo)',
            'mnso4_foliar'       => 'Sulfato de manganeso (foliar)',
            'borax_11b'          => 'Bórax (11% B)',
            'cuso4_25cu'         => 'Sulfato de cobre (25% Cu)',
            'fe_eddha_6fe'       => 'Fe-EDDHA (6% Fe)',
        ];

        // === 1) Objetivos (kg/ha de nutriente) ===
        $objetivosHa = [
            'n'    => (float) ($this->n    ?? 0),
            'p2o5' => (float) ($this->p2o5 ?? 0),
            'k2o'  => (float) ($this->k2o  ?? 0),
            's'    => (float) ($this->s    ?? 0),
        ];
        $objetivosLote = [];
        foreach ($objetivosHa as $k => $v) { $objetivosLote[$k] = round($v * $areaHa, 2); }

        // === 2) Productos por ha (bloque general) ===
        $productosHaBase = $onlyPositive([
            'urea_46'            => (float) ($this->urea_46            ?? 0),
            'asam_21_24s'        => (float) ($this->asam_21_24s        ?? 0),
            'dap_18_46_0'        => (float) ($this->dap_18_46_0        ?? 0),
            'kcl_0_0_60'         => (float) ($this->kcl_0_0_60         ?? 0),
            'k2so4_0_0_50_18s'   => (float) ($this->k2so4_0_0_50_18s   ?? 0),
            'yeso_agricola'      => (float) ($this->yeso_agricola      ?? 0),
            'cal_agricola'       => (float) ($this->cal_agricola       ?? 0),
            'kieserita_16mg_13s' => (float) ($this->kieserita_16mg_13s ?? 0),
            'dolomita'           => (float) ($this->dolomita           ?? 0),

            // Micros
            'znso4_suelo'        => (float) ($this->znso4_suelo        ?? 0),
            'znso4_foliar'       => (float) ($this->znso4_foliar       ?? 0),
            'mnso4_suelo'        => (float) ($this->mnso4_suelo        ?? 0),
            'mnso4_foliar'       => (float) ($this->mnso4_foliar       ?? 0),
            'borax_11b'          => (float) ($this->borax_11b          ?? 0),
            'cuso4_25cu'         => (float) ($this->cuso4_25cu         ?? 0),
            'fe_eddha_6fe'       => (float) ($this->fe_eddha_6fe       ?? 0),
        ]);

        // === 3) Fases por ha (ES) ===
        $fasesHa = [];
        $split = $this->split ?? [];
        if (is_array($split)) {
            $map = ['sowing' => 'siembra', 'tillering' => 'macollamiento', 'panicle' => 'embuche'];
            foreach ($split as $faseEn => $insumos) {
                $faseEs = $map[$faseEn] ?? $faseEn;
                $ins = is_array($insumos) ? $fixKeys($insumos) : (array)$insumos;
                $ins = $onlyPositive($ins); // oculta 0 dentro de cada fase
                if (!empty($ins)) {
                    $fasesHa[$faseEs] = $ins;
                }
            }
        }

        // === 4) Suma por-hectárea desde fases (para coherencia productos ↔ fases) ===
        $productosHaDesdeFases = [];
        foreach ($fasesHa as $fase => $insumos) {
            foreach ($insumos as $prod => $kgHa) {
                $productosHaDesdeFases[$prod] = ($productosHaDesdeFases[$prod] ?? 0) + (float) $kgHa;
            }
        }

        // === 5) Por-hectárea final = MAX( general , suma_por_fases ) ===
        $productosHa = [];
        $allProducts = array_unique(array_merge(array_keys($productosHaBase), array_keys($productosHaDesdeFases)));
        foreach ($allProducts as $prod) {
            $base = (float) ($productosHaBase[$prod] ?? 0);
            $fromPhases = (float) ($productosHaDesdeFases[$prod] ?? 0);
            $val = max($base, $fromPhases);
            if ($val > 0) {
                $productosHa[$prod] = round($val, 2);
            }
        }

        // === 6) Totales del lote (productos y por fase) ===
        $productosLote = [];
        foreach ($productosHa as $k => $v) { $productosLote[$k] = round($v * $areaHa, 0); }

        $fasesLote = [];
        foreach ($fasesHa as $fase => $insumos) {
            $fila = [];
            foreach ($insumos as $prod => $kgHa) { $fila[$prod] = round($kgHa * $areaHa, 0); }
            if (!empty($fila)) {
                $fasesLote[$fase] = $fila;
            }
        }

        // === 7) Resumen totales del lote (ordenado desc) ===
        $resumenTotales = [];
        foreach ($productosLote as $k => $kg) {
            if ($kg > 0) {
                $resumenTotales[$k] = [
                    'nombre'     => $labels[$k] ?? $k,
                    'kg_totales' => (int) $kg,
                ];
            }
        }
        uasort($resumenTotales, fn($a,$b) => $b['kg_totales'] <=> $a['kg_totales']);

        return [
            'id'                => $this->id,
            'analisis_suelo_id' => $this->soil_analysis_id,

            // Requerimientos nutricionales del cultivo (por ha y para el lote)
            'objetivos' => [
                'descripcion'    => 'Requerimientos nutricionales del cultivo de arroz para alcanzar el rendimiento objetivo.',
                'unidad_por_ha'  => 'kg/ha de nutriente',
                'por_hectarea'   => $objetivosHa,
                'unidad_lote'    => 'kg totales para el lote',
                'para_tu_lote'   => $objetivosLote,
            ],

            // Decisiones de manejo
            'usar_zinc_suelo'       => (bool) $this->use_zn_soil,
            'usar_manganeso_foliar' => (bool) $this->use_mn_foliar,

            // Fuentes comerciales (qué comprar y cuánto aplicar)
            'productos' => [
                'descripcion'    => 'Dosis recomendadas de fertilizantes/fuentes.',
                'unidad_por_ha'  => 'kg/ha de fuente comercial',
                'etiquetas'      => $labels,
                'por_hectarea'   => $productosHa,
                'unidad_lote'    => 'kg totales para el lote',
                'para_tu_lote'   => $productosLote,
            ],

            // Fraccionamiento por fases fenológicas
            'fases' => [
                'descripcion'    => 'Distribución de las fuentes por fase: siembra, macollamiento, embuche.',
                'unidad_por_ha'  => 'kg/ha por fase',
                'por_hectarea'   => $fasesHa,
                'unidad_lote'    => 'kg totales para el lote (por fase)',
                'para_tu_lote'   => $fasesLote,
            ],

            // Resumen listo para compra (kg totales por producto)
            'resumen_totales_lote' => array_values($resumenTotales),

            'creado_en'      => $this->created_at,
            'actualizado_en' => $this->updated_at,
        ];
    }
}