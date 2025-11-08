<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->string('name');                       // Nombre del lote
            $table->decimal('area_ha', 8, 2)->default(1); // Área en hectáreas
            $table->enum('crop', ['arroz']);              // Por ahora solo arroz
            $table->json('location')->nullable();         // {dept, muni, vereda, lat,lng}

            // Información adicional para PDF del plan
            $table->string('farm_name')->nullable();      // Nombre de la finca
            $table->string('owner_name')->nullable();     // Propietario

            $table->timestamps();
        });
    }

    public function down(): void { 
        Schema::dropIfExists('lots');
    }
};