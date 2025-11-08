<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('soil_analyses', function (Blueprint $table) {
            $table->id();

            // Relación con el lote
            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            // Metadatos del análisis
            $table->date('sampled_at')->nullable();              // fecha de muestreo
            $table->string('lab_name')->nullable();              // laboratorio (si viene en el PDF)
            $table->string('sample_code')->nullable();           // código de muestra
            $table->string('upload_path')->nullable();           // ruta del archivo subido (pdf/jpg/png)
            $table->json('raw_payload')->nullable();             // JSON crudo extraído/intermedio

            // Propiedades fisicoquímicas básicas
            $table->decimal('ph', 4, 2)->nullable();
            $table->decimal('ec_dS_m', 6, 3)->nullable();        // conductividad (dS/m)
            $table->decimal('cec_cmol', 6, 2)->nullable();       // CEC (cmol(+)/kg)
            $table->decimal('mo_percent', 5, 2)->nullable();     // Materia orgánica (%)

            // Macronutrientes (unidades típicas)
            $table->decimal('p_mgkg', 8, 2)->nullable();         // P (mg/kg)
            $table->decimal('s_mgkg', 8, 2)->nullable();         // S (mg/kg)

            // Cationes de intercambio (cmol(+)/kg)
            $table->decimal('ca_cmol', 8, 2)->nullable();
            $table->decimal('mg_cmol', 8, 2)->nullable();
            $table->decimal('k_cmol', 8, 2)->nullable();
            $table->decimal('na_cmol', 8, 2)->nullable();

            // Micronutrientes (mg/kg)
            $table->decimal('b_mgkg', 8, 2)->nullable();
            $table->decimal('fe_mgkg', 8, 2)->nullable();
            $table->decimal('cu_mgkg', 8, 2)->nullable();
            $table->decimal('mn_mgkg', 8, 2)->nullable();
            $table->decimal('zn_mgkg', 8, 2)->nullable();

            // Saturación de bases (%)
            $table->decimal('sat_ca_pct', 5, 2)->nullable();
            $table->decimal('sat_mg_pct', 5, 2)->nullable();
            $table->decimal('sat_k_pct', 5, 2)->nullable();
            $table->decimal('sat_na_pct', 5, 2)->nullable();
            $table->decimal('sat_al_pct', 5, 2)->nullable();

            // Meta de rendimiento para el plan (t/ha)
            $table->decimal('yield_target_t_ha', 6, 2)->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index(['lot_id', 'sampled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soil_analyses');
    }
};