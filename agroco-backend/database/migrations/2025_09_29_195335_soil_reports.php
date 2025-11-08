<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('soil_reports', function (Blueprint $table) {
            $table->id();

            // Relación con el lote y usuario que subió
            $table->foreignId('lot_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Archivo subido
            $table->string('original_filename')->nullable();
            $table->string('mime')->nullable();
            $table->string('disk')->default('public');
            $table->string('path'); // p.ej. soil_uploads/xxxx.pdf

            // Estado del pipeline
            $table->enum('status', ['uploaded', 'processing', 'ready', 'failed'])->default('uploaded');

            // Datos extraídos y normalizados
            $table->longText('extracted_json')->nullable();
            $table->longText('normalized_json')->nullable();
            $table->longText('plan_json')->nullable();

            // PDF generado del plan
            $table->string('plan_pdf_path')->nullable();
            $table->string('plan_pdf_url')->nullable();

            // Metadatos y errores
            $table->string('lab_name')->nullable();
            $table->date('sampled_at')->nullable();
            $table->json('errors')->nullable();

            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['lot_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soil_reports');
    }
};