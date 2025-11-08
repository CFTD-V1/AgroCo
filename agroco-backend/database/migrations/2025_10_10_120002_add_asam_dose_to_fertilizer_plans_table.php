<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fertilizer_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('fertilizer_plans', 'asam_21_24s')) {
                $table->decimal('asam_21_24s', 10, 2)
                    ->default(0)
                    ->after('urea_46');
            }
        });

        if (Schema::hasColumn('fertilizer_plans', 'asam_21_24S') && Schema::hasColumn('fertilizer_plans', 'asam_21_24s')) {
            DB::statement('UPDATE fertilizer_plans SET asam_21_24s = asam_21_24S WHERE asam_21_24s = 0');
        }
    }

    public function down(): void
    {
        Schema::table('fertilizer_plans', function (Blueprint $table) {
            if (Schema::hasColumn('fertilizer_plans', 'asam_21_24s')) {
                $table->dropColumn('asam_21_24s');
            }
        });
    }
};
