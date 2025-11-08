<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Objetivos nutricionales por cultivo
    |--------------------------------------------------------------------------
    |
    | Valores base para calcular dosis de fertilización y correcciones
    | de saturación de bases y micronutrientes.
    |
    */
    'targets' => [
        'rice' => [
            'N'    => 120, // kg/ha
            'P2O5' => 30,
            'K2O'  => 100,
            'S'    => 20,

            // Metas de saturación de bases (% de CEC)
            'sat' => [
                'Ca' => 65,
                'Mg' => 10,
                'K'  => 3,
                'Na' => 2,
            ],

            // Niveles críticos de micronutrientes (mg/kg)
            'criticals' => [
                'Zn' => 1.5,
                'Mn' => 5.0,
                'B'  => 0.3,
                'Cu' => 0.5,
                'Fe' => 4.0,
            ],

            // Dosis sugeridas cuando el suelo está por debajo del crítico
            'micros_dose_kg_ha' => [
                'Zn_soil'   => 10,  // ZnSO4 monohidrato
                'Zn_foliar' => 1,
                'Mn_foliar' => 4.5, // MnSO4 comercial
                'B_soil'    => 2,   // Borax 11% B ≈ 18 kg producto
                'Cu_soil'   => 5,   // CuSO4·5H2O
                'Fe_soil'   => 10,  // EDDHA 6% Fe
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Conversión de cmol(+)/kg a kg/ha (0-20 cm de suelo)
    |--------------------------------------------------------------------------
    */
    'cmol_to_kg_per_ha' => [
        'Ca' => 400,
        'Mg' => 240,
        'K'  => 780,
        'Na' => 230,
    ],

    /*
    |--------------------------------------------------------------------------
    | Fuentes de nutrientes y % de ingrediente activo
    |--------------------------------------------------------------------------
    */
    'sources' => [
        'urea_46'            => ['N' => 0.46],
        'asam_21_24s'        => ['N' => 0.21, 'S' => 0.24], // sulfato de amonio
        'dap_18_46_0'        => ['N' => 0.18, 'P2O5' => 0.46],
        'kcl_0_0_60'         => ['K2O' => 0.60],
        'k2so4_0_0_50_18s'   => ['K2O' => 0.50, 'S' => 0.18],
        'yeso_agricola'      => ['Ca' => 0.233, 'S' => 0.186],
        'cal_agricola'       => ['Ca' => 0.40],
        'kieserita_16mg_13s' => ['Mg' => 0.16, 'S' => 0.13],
        'dolomita'           => ['Ca' => 0.30, 'Mg' => 0.22],
        'znso4_suelo'        => ['Zn' => 0.36],
        'znso4_foliar'       => ['Zn' => 0.36],
        'mnso4_foliar'       => ['Mn' => 0.31],
        'borax_11b'          => ['B'  => 0.11],
        'cuso4_25cu'         => ['Cu' => 0.25],
        'fe_eddha_6fe'       => ['Fe' => 0.06],
    ],

    /*
    |--------------------------------------------------------------------------
    | Límites prácticos de aplicación por campaña (kg/ha)
    |--------------------------------------------------------------------------
    */
    'max_amendment_kg_ha' => [
        'yeso_agricola'      => 2000,
        'cal_agricola'       => 2000,
        'dolomita'           => 2000,
        'kieserita_16mg_13s' => 500,
    ],
];
