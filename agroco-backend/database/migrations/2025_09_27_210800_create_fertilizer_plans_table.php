<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fertilizer_plans', function (Blueprint $table) {
            $table->id();

            // Relación con análisis de suelo
            $table->foreignId('soil_analysis_id')->constrained()->cascadeOnDelete();

            // Nutrientes objetivo (kg/ha)
            $table->decimal('n', 8, 2)->default(0);
            $table->decimal('p2o5', 8, 2)->default(0);
            $table->decimal('k2o', 8, 2)->default(0);
            $table->decimal('s', 8, 2)->default(0);

            // Productos principales (kg/ha)
            $table->decimal('urea_46', 10, 2)->default(0);
            $table->decimal('dap_18_46_0', 10, 2)->default(0);
            $table->decimal('kcl_0_0_60', 10, 2)->default(0);
            $table->decimal('k2so4_0_0_50_18s', 10, 2)->default(0);
            $table->decimal('yeso_agricola', 10, 2)->default(0);
            $table->decimal('cal_agricola', 10, 2)->default(0);
            $table->decimal('kieserita_16mg_13s', 10, 2)->default(0);
            $table->decimal('dolomita', 10, 2)->default(0);

            // Micronutrientes (kg/ha o g/ha según el caso)
            $table->decimal('znso4_suelo', 10, 2)->default(0);
            $table->decimal('znso4_foliar', 10, 2)->default(0);
            $table->decimal('mnso4_suelo', 10, 2)->default(0);
            $table->decimal('mnso4_foliar', 10, 2)->default(0);
            $table->decimal('borax_11b', 10, 2)->default(0);
            $table->decimal('cuso4_25cu', 10, 2)->default(0);
            $table->decimal('fe_eddha_6fe', 10, 2)->default(0);

            // JSON flexibles (detalles por fase, nutrientes, cronograma, observaciones)
            $table->json('split')->nullable();        // fraccionamiento de aplicaciones
            $table->json('phases')->nullable();       // siembra/macollamiento/espigamiento
            $table->json('nutrients')->nullable();    // metas vs aportes
            $table->json('schedule')->nullable();     // cronograma con fechas
            $table->json('observations')->nullable(); // lista de observaciones
            $table->json('summary')->nullable();      // resumen general

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('fertilizer_plans');
    }
};