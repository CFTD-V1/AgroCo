<?php

namespace App\Policies;

use App\Models\Lot;
use App\Models\User;

class LotPolicy
{
    /**
     * Listar lotes (p.ej. /api/lots) -> cada quien verá los suyos en el controlador,
     * pero a nivel de policy permitimos el acceso al listado.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Ver un lote específico.
     */
    public function view(User $user, Lot $lot): bool
    {
        return $user->id === $lot->user_id;
    }

    /**
     * Crear lotes.
     */
    public function create(User $user): bool
    {
        return true; // cualquier usuario autenticado puede crear su lote
    }

    /**
     * Actualizar un lote (solo dueño).
     */
    public function update(User $user, Lot $lot): bool
    {
        return $user->id === $lot->user_id;
    }

    /**
     * Eliminar un lote (solo dueño).
     */
    public function delete(User $user, Lot $lot): bool
    {
        return $user->id === $lot->user_id;
    }

    /**
     * Restaurar (si usas soft deletes). Mantén misma lógica de dueño.
     */
    public function restore(User $user, Lot $lot): bool
    {
        return $user->id === $lot->user_id;
    }

    /**
     * Eliminación forzada (solo dueño).
     */
    public function forceDelete(User $user, Lot $lot): bool
    {
        return $user->id === $lot->user_id;
    }
}