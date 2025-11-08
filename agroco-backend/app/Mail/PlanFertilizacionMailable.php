<?php

namespace App\Mail;

use App\Models\Lot;
use App\Models\SoilAnalysis;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlanFertilizacionMailable extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Lot $lot,
        public SoilAnalysis $soil,
        public array $planData,
        public string $pdfFullPath
    ) {}

    public function build()
    {
        return $this->subject('Plan de fertilización - Lote '.$this->lot->id)
            ->view('emails.plan_fertilizacion')
            ->attach($this->pdfFullPath, [
                'as'   => 'plan_fertilizacion.pdf',
                'mime' => 'application/pdf',
            ])
            ->with([
                'lot'  => $this->lot,
                'soil' => $this->soil,
                'data' => $this->planData,
            ]);
    }
}