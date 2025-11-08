import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animated-bg" aria-hidden>
      <div *ngFor="let leaf of leaves()" class="leaf" [ngStyle]="{
        left: leaf.left + '%',
        top: leaf.top + '%',
        width: leaf.size + 'px',
        height: leaf.size + 'px',
        animationDuration: leaf.duration + 's',
        animationDelay: leaf.delay + 's',
        transform: 'rotate(' + leaf.rotate + 'deg)'
      }"></div>
      <div *ngFor="let bubble of bubbles()" class="bubble" [ngStyle]="{
        left: bubble.left + '%',
        bottom: bubble.bottom + 'px',
        width: bubble.size + 'px',
        height: bubble.size + 'px',
        animationDuration: bubble.duration + 's',
        animationDelay: bubble.delay + 's'
      }"></div>
    </div>
  `
})
export class AnimatedBackgroundComponent implements OnInit, OnDestroy {
  leaves = signal<{left:number;top:number;size:number;duration:number;delay:number;rotate:number}[]>([]);
  bubbles = signal<{left:number;bottom:number;size:number;duration:number;delay:number}[]>([]);
  private onResize = () => this.compute();

  ngOnInit() {
    this.compute();
    window.addEventListener('resize', this.onResize);
  }
  ngOnDestroy() { window.removeEventListener('resize', this.onResize); }

  private compute() {
    const w = window.innerWidth;
    const leafCount = Math.max(6, Math.min(10, Math.floor(w / 200)));
    const leaves = Array.from({ length: leafCount }).map((_, i) => ({
      left: (i / leafCount) * 100 + (Math.random() * 6 - 3),
      top: 20 + Math.random() * 60,
      size: 120 + Math.random() * 60,
      duration: 18 + Math.random() * 10,
      delay: Math.random() * 6,
      rotate: Math.random() * 16 - 8,
    }));
    const bubbles = Array.from({ length: 16 }).map(() => ({
      left: Math.random() * 100,
      bottom: -40 - Math.random() * 60,
      size: 10 + Math.random() * 10,
      duration: 12 + Math.random() * 10,
      delay: Math.random() * 10,
    }));
    this.leaves.set(leaves);
    this.bubbles.set(bubbles);
  }
}
