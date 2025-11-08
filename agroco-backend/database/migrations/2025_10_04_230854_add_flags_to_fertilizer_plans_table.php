<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fertilizer_plans', function (Blueprint $table) {
            // Flags booleans usados por el controlador
            if (!Schema::hasColumn('fertilizer_plans', 'use_zn_soil')) {
                $table->boolean('use_zn_soil')->default(false);
            }
            if (!Schema::hasColumn('fertilizer_plans', 'use_mn_foliar')) {
                $table->boolean('use_mn_foliar')->default(false);
            }

            // (Opcional) por si faltara algún JSON en entornos limpios
            if (!Schema::hasColumn('fertilizer_plans', 'split'))        $table->json('split')->nullable();
            if (!Schema::hasColumn('fertilizer_plans', 'phases'))       $table->json('phases')->nullable();
            if (!Schema::hasColumn('fertilizer_plans', 'nutrients'))    $table->json('nutrients')->nullable();
            if (!Schema::hasColumn('fertilizer_plans', 'schedule'))     $table->json('schedule')->nullable();
            if (!Schema::hasColumn('fertilizer_plans', 'observations')) $table->json('observations')->nullable();
            if (!Schema::hasColumn('fertilizer_plans', 'summary'))      $table->json('summary')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('fertilizer_plans', function (Blueprint $table) {
            if (Schema::hasColumn('fertilizer_plans', 'use_zn_soil'))   $table->dropColumn('use_zn_soil');
            if (Schema::hasColumn('fertilizer_plans', 'use_mn_foliar')) $table->dropColumn('use_mn_foliar');
            // No tocamos los JSON en down() porque son opcionales en up()
        });
    }
};