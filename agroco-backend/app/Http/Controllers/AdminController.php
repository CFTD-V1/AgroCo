<?php

namespace App\Http\Controllers;

use App\Models\FertilizerPlan;
use App\Models\SoilAnalysis;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function summary()
    {
        $now = now();
        $weekAgo = $now->copy()->subDays(7);
        $monthAgo = $now->copy()->subDays(30);

        return response()->json([
            'totals' => [
                'users'             => User::count(),
                'admins'            => User::where('is_admin', true)->count(),
                'soil_analyses'     => SoilAnalysis::count(),
                'fertilizer_plans'  => FertilizerPlan::count(),
            ],
            'recent' => [
                'users_week'             => User::where('created_at', '>=', $weekAgo)->count(),
                'soil_analyses_week'     => SoilAnalysis::where('created_at', '>=', $weekAgo)->count(),
                'fertilizer_plans_week'  => FertilizerPlan::where('created_at', '>=', $weekAgo)->count(),
                'soil_analyses_month'    => SoilAnalysis::where('created_at', '>=', $monthAgo)->count(),
                'fertilizer_plans_month' => FertilizerPlan::where('created_at', '>=', $monthAgo)->count(),
            ],
            'series' => [
                'users_last_14_days'    => $this->dailySeries(User::class, 14),
                'analyses_last_14_days' => $this->dailySeries(SoilAnalysis::class, 14),
                'plans_last_14_days'    => $this->dailySeries(FertilizerPlan::class, 14),
            ],
        ]);
    }

    public function users(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $perPage = max(5, min(100, (int) $request->query('per_page', 20)));

        $users = User::query()
            ->withCount(['lots', 'soilAnalyses'])
            ->when($q !== '', function ($query) use ($q) {
                $needle = User::normalizeNameStatic($q);
                $lc = mb_strtolower($q);
                $query->where(function ($q2) use ($needle, $lc) {
                    $q2->whereRaw('lower(normalized_full_name) like ?', ["%{$needle}%"])
                        ->orWhereRaw('lower(documento_identidad) like ?', ["%{$lc}%"])
                        ->orWhereRaw('lower(email) like ?', ["%{$lc}%"])
                        ->orWhereRaw('lower(username) like ?', ["%{$lc}%"]);
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($users);
    }

    public function storeUser(Request $request)
    {
        $data = $this->validateUserPayload($request);

        $user = User::create(array_merge($data, [
            'password'            => $data['password'] ?? $data['documento_identidad'],
            'must_change_password'=> $request->boolean('must_change_password', true),
            'api_token'           => $this->generateApiToken(),
        ]));

        return response()->json($user->fresh(['lots', 'soilAnalyses']), 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $this->validateUserPayload($request, $user->id);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->fill($data);
        $user->must_change_password = $request->boolean('must_change_password', $user->must_change_password);
        $user->save();

        return response()->json($user->fresh(['lots', 'soilAnalyses']));
    }

    public function destroyUser(Request $request, User $user)
    {
        if ($request->user()?->id === $user->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function soilAnalyses(Request $request)
    {
        $perPage = max(5, min(100, (int) $request->query('per_page', 20)));
        $analyses = SoilAnalysis::query()
            ->with(['lot.user', 'plan'])
            ->orderByDesc('sampled_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json($analyses);
    }

    public function fertilizerPlans(Request $request)
    {
        $perPage = max(5, min(100, (int) $request->query('per_page', 20)));
        $plans = FertilizerPlan::query()
            ->with(['soilAnalysis.lot.user'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($plans);
    }

    /**
     * @return array<int,array{date:string,count:int}>
     */
    private function dailySeries(string $modelClass, int $days): array
    {
        $start = now()->startOfDay()->subDays($days - 1);
        $rows = $modelClass::query()
            ->select([
                DB::raw('date(created_at) as day'),
                DB::raw('count(*) as total'),
            ])
            ->where('created_at', '>=', $start)
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy(DB::raw('date(created_at)'))
            ->get()
            ->keyBy('day');

        $out = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i)->toDateString();
            $out[] = [
                'date' => $day,
                'count' => (int) ($rows[$day]->total ?? 0),
            ];
        }

        return $out;
    }

    private function validateUserPayload(Request $request, ?int $userId = null): array
    {
        return $request->validate([
            'primer_nombre'       => ['required', 'string', 'max:100'],
            'segundo_nombre'      => ['nullable', 'string', 'max:100'],
            'primer_apellido'     => ['required', 'string', 'max:100'],
            'segundo_apellido'    => ['nullable', 'string', 'max:100'],
            'ocupacion'           => ['required', 'string', 'max:100'],
            'telefono'            => ['required', 'string', 'max:20'],
            'tipo_documento'      => ['required', 'string', 'in:CC,CE,TI,PAS,NIT'],
            'documento_identidad' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'documento_identidad')
                    ->where(fn ($q) => $q->where('tipo_documento', $request->input('tipo_documento')))
                    ->ignore($userId),
            ],
            'email'               => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'username'            => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'password'            => ['nullable', 'string', 'min:6'],
            'is_admin'            => ['boolean'],
        ]);
    }

    private function generateApiToken(): string
    {
        do {
            $token = Str::random(40);
        } while (User::where('api_token', $token)->exists());

        return $token;
    }
}
