<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Nombres y apellidos (2dos opcionales)
            $table->string('primer_nombre');
            $table->string('segundo_nombre')->nullable();
            $table->string('primer_apellido');
            $table->string('segundo_apellido')->nullable();

            // Otros datos
            $table->string('ocupacion');
            $table->string('telefono');

            // Documento
            $table->string('tipo_documento', 3)->default('CC'); // CC, CE, TI, PAS, NIT
            $table->string('documento_identidad');

            // Credenciales
            // Nota: hacemos unicidad case-insensitive vía índice funcional (abajo).
            $table->string('username')->unique(false);
            // Dejamos email nullable; añadimos índice único case-insensitive parcial (abajo).
            $table->string('email')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();

            // Forzar cambio de contraseña en primer ingreso
            $table->boolean('must_change_password')->default(true);

            $table->timestamps();
        });

        // ---- Reglas / constraints a nivel BD (PostgreSQL) ----

        // Formatos
        DB::statement("
            ALTER TABLE users
            ADD CONSTRAINT users_documento_format_chk
            CHECK (documento_identidad ~ '^[0-9]{6,12}$')
        ");
        DB::statement("
            ALTER TABLE users
            ADD CONSTRAINT users_telefono_format_chk
            CHECK (telefono ~ '^[0-9]{7,13}$')
        ");
        DB::statement("
            ALTER TABLE users
            ADD CONSTRAINT users_tipo_documento_chk
            CHECK (tipo_documento IN ('CC','CE','TI','PAS','NIT'))
        ");

        // Unicidad compuesta: (tipo_documento, documento_identidad)
        DB::statement("
            ALTER TABLE users
            ADD CONSTRAINT users_tipo_doc_num_unique UNIQUE (tipo_documento, documento_identidad)
        ");

        // Unicidad case-insensitive para username
        DB::statement("CREATE UNIQUE INDEX users_username_lower_uidx ON users (lower(username));");

        // Unicidad case-insensitive y PARCIAL para email (permite múltiples NULL)
        DB::statement("
            CREATE UNIQUE INDEX users_email_lower_uidx
            ON users (lower(email))
            WHERE email IS NOT NULL
        ");
    }

    public function down(): void
    {
        // Eliminar índices funcionales antes de eliminar la tabla
        DB::statement("DROP INDEX IF EXISTS users_email_lower_uidx");
        DB::statement("DROP INDEX IF EXISTS users_username_lower_uidx");

        Schema::dropIfExists('users');
    }
};