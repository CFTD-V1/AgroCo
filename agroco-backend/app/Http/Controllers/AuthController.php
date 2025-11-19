<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private const DEFAULT_PHONE = '0000000';
    private const DEFAULT_DOCUMENT_TYPE = 'CC';

    private const IP_LOGIN_LIMIT = 10;
    private const IP_LOGIN_DECAY_SECONDS = 60;

    private const DOC_LOGIN_LIMIT = 5;
    private const DOC_LOGIN_DECAY_SECONDS = 900; // 15 minutos

    public function register(StoreUserRequest $request)
    {
        $data = $request->validated();
        $nameParts = $this->splitFullName($data['nombre_completo']);
        if ($nameParts['primer_nombre'] === '' || $nameParts['primer_apellido'] === '') {
            return response()->json([
                'message' => 'No se pudo interpretar el nombre completo proporcionado.',
                'errors' => [
                    'nombre_completo' => ['Incluye al menos un nombre y un apellido.'],
                ],
            ], 422);
        }

        $user = User::create([
            'primer_nombre'       => $nameParts['primer_nombre'],
            'segundo_nombre'      => $nameParts['segundo_nombre'],
            'primer_apellido'     => $nameParts['primer_apellido'],
            'segundo_apellido'    => $nameParts['segundo_apellido'],
            'ocupacion'           => $data['ocupacion'],
            'telefono'            => self::DEFAULT_PHONE,
            'tipo_documento'      => self::DEFAULT_DOCUMENT_TYPE,
            'documento_identidad' => $data['documento_identidad'],
            'password'            => Hash::make($data['documento_identidad']),
            'email'               => $data['email'] ?? null,
            'email_verified_at'   => !empty($data['email']) ? now() : null,
            'must_change_password'=> false,
            'normalized_full_name'=> User::normalizeNameStatic($data['nombre_completo']),
            'api_token'           => $this->generateUniqueUserToken(),
        ]);

        return response()->json([
            'message'           => 'Usuario registrado exitosamente',
            'nombre_completo'   => $user->full_name,
            'documento'         => $user->documento_identidad,
            'email'             => $user->email,
            'requiere_email'    => $user->email === null,
            'api_token'         => $user->api_token,
            'email_verified_at' => $user->email_verified_at,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $ipKey = sprintf('login:ip:%s', $request->ip());
        if (RateLimiter::tooManyAttempts($ipKey, self::IP_LOGIN_LIMIT)) {
            return response()->json([
                'message' => 'Demasiados intentos desde esta dirección IP. Intenta nuevamente más tarde.',
            ], 429);
        }

        $docKey = sprintf('login:doc:%s', $data['documento_identidad']);
        if (RateLimiter::tooManyAttempts($docKey, self::DOC_LOGIN_LIMIT)) {
            return response()->json([
                'message' => 'El número de intentos para este documento fue excedido. Intenta en unos minutos.',
            ], 429);
        }

        RateLimiter::hit($ipKey, self::IP_LOGIN_DECAY_SECONDS);
        RateLimiter::hit($docKey, self::DOC_LOGIN_DECAY_SECONDS);

        /** @var User|null $user */
        $user = User::where('documento_identidad', $data['documento_identidad'])->first();

        if ($user && method_exists($user, 'isLocked') && $user->isLocked()) {
            return response()->json([
                'message' => 'La cuenta está temporalmente bloqueada por intentos fallidos. Reintenta más tarde.',
                'locked_until' => optional($user->locked_until)->toIso8601String(),
            ], 423);
        }

        if (!$user || !Hash::check($data['documento_identidad'], $user->password)) {
            if ($user && method_exists($user, 'registerFailedLogin')) {
                $user->registerFailedLogin(self::DOC_LOGIN_LIMIT, (int) (self::DOC_LOGIN_DECAY_SECONDS / 60));
            }

            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], 422);
        }

        if (!$this->namesMatch($data['nombre_completo'], $user)) {
            if (method_exists($user, 'registerFailedLogin')) {
                $user->registerFailedLogin(self::DOC_LOGIN_LIMIT, (int) (self::DOC_LOGIN_DECAY_SECONDS / 60));
            }

            return response()->json([
                'message' => 'El nombre completo no coincide con nuestros registros.',
            ], 422);
        }

        RateLimiter::clear($ipKey);
        RateLimiter::clear($docKey);
        if (method_exists($user, 'resetLoginAttempts')) {
            $user->resetLoginAttempts();
        }

        if (Hash::check($user->documento_identidad, $user->password) && !($user->must_change_password ?? false)) {
            $user->forceFill(['must_change_password' => true])->save();
        }

        if ($user->email && $user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $token = $user->createToken('agroco')->plainTextToken;

        return response()->json([
            'message'         => 'Login correcto',
            'token'           => $token,
            'nombre_completo' => $user->full_name,
            'documento'       => $user->documento_mascara ?? $user->documento_identidad,
            'email'           => $user->email,
            'requiere_email'  => $user->email === null,
            'must_change_password' => (bool) ($user->must_change_password ?? false),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout'], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'                => $user->id,
            'nombre_completo'   => $user->full_name,
            'primer_nombre'     => $user->primer_nombre,
            'segundo_nombre'    => $user->segundo_nombre,
            'primer_apellido'   => $user->primer_apellido,
            'segundo_apellido'  => $user->segundo_apellido,
            'ocupacion'         => $user->ocupacion,
            'telefono'          => $user->telefono,
            'tipo_documento'    => $user->tipo_documento,
            'documento_mascara' => $user->documento_mascara ?? null,
            'email'             => $user->email,
            'avatar_url'        => $user->avatar_path ? $request->getSchemeAndHttpHost().'/api/v1/avatar/'.$user->id.'?v='.(Storage::disk('public')->exists($user->avatar_path) ? Storage::disk('public')->lastModified($user->avatar_path) : time()) : null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'email'            => ['nullable','email','max:255','unique:users,email,'.$user->id],
            'nombre_completo'  => ['nullable','string','min:4','max:255'],
            'ocupacion'        => ['nullable','string','max:120'],
            'telefono'         => ['nullable','string','max:30','regex:/^[0-9+()\-\s]{7,30}$/'],
        ]);

        $updates = [];
        if (array_key_exists('email', $validated)) {
            $updates['email'] = $validated['email'] ?? null;
            $updates['email_verified_at'] = ($validated['email'] ?? null) ? now() : null;
        }
        if (!empty($validated['ocupacion']) || $request->has('ocupacion')) {
            $updates['ocupacion'] = $validated['ocupacion'] ?? null;
        }
        if (!empty($validated['telefono']) || $request->has('telefono')) {
            $updates['telefono'] = $validated['telefono'] ?? null;
        }

        // Si viene nombre completo, dividir en partes
        if (!empty($validated['nombre_completo'])) {
            $parts = $this->splitFullName($validated['nombre_completo']);
            // Permitir que el segundo apellido sea opcional en edición
            if ($parts['primer_nombre'] === '' || $parts['primer_apellido'] === '') {
                return response()->json([
                    'message' => 'No se pudo interpretar el nombre. Incluye al menos nombre y primer apellido.',
                ], 422);
            }
            $updates = array_merge($updates, [
                'primer_nombre'    => $parts['primer_nombre'],
                'segundo_nombre'   => $parts['segundo_nombre'],
                'primer_apellido'  => $parts['primer_apellido'],
                'segundo_apellido' => $parts['segundo_apellido'],
            ]);
        }

        if (!empty($updates)) {
            $user->forceFill($updates)->save();
        }

        return response()->json([
            'message' => 'Perfil actualizado',
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'photo' => ['required','image','max:4096'], // hasta 4MB
        ]);

        $file = $data['photo'];
        $ext = $file->getClientOriginalExtension();
        $path = $file->storeAs('avatars', 'user-'.$user->id.'.'.$ext, 'public');

        $user->forceFill(['avatar_path' => $path])->save();

        return response()->json([
            'message'    => 'Foto actualizada',
            'avatar_url' => $request->getSchemeAndHttpHost().'/api/v1/avatar/'.$user->id.'?v='.(Storage::disk('public')->lastModified($path) ?? time()),
        ]);
    }

    public function avatar(Request $request, User $user)
    {
        $path = $user->avatar_path;
        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->noContent(404);
        }
        $headers = [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Cross-Origin-Resource-Policy' => 'cross-origin',
        ];
        return Storage::disk('public')->response($path, null, $headers);
    }

    public function changePassword(ChangePasswordRequest $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual no es correcta.',
            ], 422);
        }

        if ($data['new_password'] === $user->documento_identidad) {
            return response()->json([
                'message' => 'La nueva contraseña no puede ser idéntica a tu número de documento.',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($data['new_password']),
            'must_change_password' => false,
        ])->save();

        if (method_exists($user, 'resetLoginAttempts')) {
            $user->resetLoginAttempts();
        }

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    private function splitFullName(string $fullName): array
    {
        $clean = preg_replace('/\s+/u', ' ', trim($fullName));
        $parts = array_values(array_filter(explode(' ', $clean)));

        $primerNombre = $segundoNombre = $primerApellido = $segundoApellido = null;

        if (!empty($parts)) {
            $primerNombre = array_shift($parts);
        }

        $count = count($parts);

        if ($count === 1) {
            // Ej: "Cristian Tafur" => primer apellido = Tafur
            $primerApellido = $parts[0];
        } elseif ($count >= 2) {
            // Ej: "Cristian David Tafur Lopez" => Tafur (primer), Lopez (segundo)
            $segundoApellido = array_pop($parts);
            $primerApellido = array_pop($parts);
            $segundoNombre = $parts ? implode(' ', $parts) : null;
        }

        return [
            'primer_nombre'    => $primerNombre ?? '',
            'segundo_nombre'   => $segundoNombre ?: null,
            'primer_apellido'  => $primerApellido ?? '',
            'segundo_apellido' => $segundoApellido ?: null,
        ];
    }

    private function namesMatch(string $provided, User $user): bool
    {
        $providedNormalized = User::normalizeNameStatic($provided);
        $storedNormalized = $user->normalized_full_name ?: User::normalizeNameStatic($user->full_name ?? '');
        return $providedNormalized === $storedNormalized;
    }

    private function generateUniqueUserToken(): string
    {
        do {
            $token = Str::random(60);
        } while (User::where('api_token', $token)->exists());
        return $token;
    }
}
