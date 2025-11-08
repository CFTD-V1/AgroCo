<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Fuentes K alternativas
        if (!Schema::hasColumn('fertilizer_plans', 'k2so4_0_0_50_18S')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('k2so4_0_0_50_18S', 7, 1)->default(0);
            });
        }

        // Enmiendas Ca/Mg y S
        if (!Schema::hasColumn('fertilizer_plans', 'yeso_agricola')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('yeso_agricola', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'cal_agricola')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('cal_agricola', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'kieserita_16Mg_13S')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('kieserita_16Mg_13S', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'dolomita')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('dolomita', 7, 1)->default(0);
            });
        }

        // Micros suelo/foliar
        if (!Schema::hasColumn('fertilizer_plans', 'znso4_suelo')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('znso4_suelo', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'znso4_foliar')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('znso4_foliar', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'mnso4_suelo')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('mnso4_suelo', 7, 1)->default(0);
            });
        }
        // OJO: esta ya existe en tu tabla inicial; NO intentes crearla otra vez
        if (!Schema::hasColumn('fertilizer_plans', 'mnso4_foliar')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('mnso4_foliar', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'borax_11B')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('borax_11B', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'cuso4_25Cu')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('cuso4_25Cu', 7, 1)->default(0);
            });
        }
        if (!Schema::hasColumn('fertilizer_plans', 'fe_eddha_6Fe')) {
            Schema::table('fertilizer_plans', function (Blueprint $table) {
                $table->decimal('fe_eddha_6Fe', 7, 1)->default(0);
            });
        }
    }

    public function down(): void
    {
        // Borramos solo si existe cada columna (idempotente)
        $cols = [
            'k2so4_0_0_50_18S',
            'yeso_agricola',
            'cal_agricola',
            'kieserita_16Mg_13S',
            'dolomita',
            'znso4_suelo',
            'znso4_foliar',
            'mnso4_suelo',
            'mnso4_foliar',
            'borax_11B',
            'cuso4_25Cu',
            'fe_eddha_6Fe',
        ];

        foreach ($cols as $col) {
            if (Schema::hasColumn('fertilizer_plans', $col)) {
                Schema::table('fertilizer_plans', function (Blueprint $table) use ($col) {
                    $table->dropColumn($col);
                });
            }
        }
    }
};