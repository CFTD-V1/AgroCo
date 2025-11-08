<?php

namespace App\Policies;

use App\Models\SoilAnalysis;
use App\Models\User;

class SoilAnalysisPolicy
{
    public function view(User $user, SoilAnalysis $s): bool   { return $user->id === $s->lot->user_id; }
    public function update(User $user, SoilAnalysis $s): bool { return $user->id === $s->lot->user_id; }
    public function delete(User $user, SoilAnalysis $s): bool { return $user->id === $s->lot->user_id; }
    public function create(User $user): bool                  { return true; }
    public function viewAny(User $user): bool                 { return true; }
}