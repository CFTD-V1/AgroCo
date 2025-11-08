<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('normalized_full_name')->nullable()->after('email');
            $table->unsignedSmallInteger('failed_login_attempts')->default(0)->after('must_change_password');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');

            $table->index('normalized_full_name', 'users_normalized_full_name_idx');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_normalized_full_name_idx');
            $table->dropColumn(['normalized_full_name', 'failed_login_attempts', 'locked_until']);
        });
    }
};

