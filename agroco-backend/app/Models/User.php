<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'ocupacion',
        'telefono',
        'tipo_documento',
        'documento_identidad',
        'username',
        'password',
        'must_change_password',
        'is_admin',
        'email',
        'email_verified_at',
        'avatar_path',
        'normalized_full_name',
        'failed_login_attempts',
        'locked_until',
        'api_token',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'must_change_password' => 'boolean',
        'is_admin' => 'boolean',
        'locked_until' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            if (empty($user->username)) {
                $base = Str::slug(trim(($user->primer_nombre ?? '').' '.($user->primer_apellido ?? '')), '');
                $base = $base === '' ? 'user' : $base;
                $candidate = $base;
                $suffix = 1;

                while (static::whereRaw('lower(username) = lower(?)', [$candidate])->exists()) {
                    $candidate = $base.$suffix;
                    $suffix++;
                }

                $user->username = $candidate;
            }

            $user->normalized_full_name = static::normalizeNameStatic($user->full_name ?? '');
        });

        static::saving(function (self $user): void {
            if (
                $user->isDirty(['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']) ||
                empty($user->normalized_full_name)
            ) {
                $user->normalized_full_name = static::normalizeNameStatic($user->full_name ?? '');
            }

            if ($user->locked_until && $user->locked_until->isPast()) {
                $user->failed_login_attempts = 0;
                $user->locked_until = null;
            }
        });
    }

    public function lots(): HasMany
    {
        return $this->hasMany(Lot::class);
    }

    public function soilAnalyses(): HasManyThrough
    {
        return $this->hasManyThrough(SoilAnalysis::class, Lot::class);
    }

    public function setPasswordAttribute($value): void
    {
        if (!empty($value)) {
            $this->attributes['password'] = Str::startsWith($value, '$2y$')
                ? $value
                : Hash::make($value);
        }
    }

    public function getFullNameAttribute(): string
    {
        return trim(
            collect([$this->primer_nombre, $this->segundo_nombre, $this->primer_apellido, $this->segundo_apellido])
                ->filter()
                ->implode(' ')
        );
    }

    public function getDocumentoMascaraAttribute(): string
    {
        $doc = (string) $this->documento_identidad;

        return str_repeat('*', max(0, strlen($doc) - 3)) . substr($doc, -3);
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function registerFailedLogin(int $maxAttempts, int $decayMinutes): void
    {
        $attempts = $this->failed_login_attempts + 1;
        $this->forceFill(['failed_login_attempts' => $attempts]);

        if ($attempts >= $maxAttempts) {
            $this->forceFill([
                'locked_until' => now()->addMinutes($decayMinutes),
                'failed_login_attempts' => $maxAttempts,
            ]);
        }

        $this->save();
    }

    public function resetLoginAttempts(): void
    {
        if ($this->failed_login_attempts > 0 || $this->locked_until !== null) {
            $this->forceFill([
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ])->save();
        }
    }

    public static function normalizeNameStatic(string $name): string
    {
        return Str::of($name)
            ->squish()
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z\\s]/', '')
            ->replaceMatches('/\\s+/', ' ')
            ->trim()
            ->toString();
    }
}
