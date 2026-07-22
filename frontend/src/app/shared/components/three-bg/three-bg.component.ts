import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-three-bg',
  standalone: true,
  template: `
    <canvas #bgCanvas class="canvas-ambient"></canvas>
  `,
  styles: [`
    .canvas-ambient {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0.65;
    }
  `]
})
export class ThreeBgComponent implements OnInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private animId: number = 0;
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  private blobs: Array<{
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number;
    vy: number;
  }> = [];

  ngOnInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 60;
    this.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 60;
  }

  @HostListener('window:resize')
  onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Soft, sophisticated ambient color nodes
    this.blobs = [
      { x: canvas.width * 0.15, y: canvas.height * 0.2, radius: 450, color: 'rgba(99, 102, 241, 0.18)', vx: 0.2, vy: 0.15 },
      { x: canvas.width * 0.85, y: canvas.height * 0.3, radius: 500, color: 'rgba(56, 189, 248, 0.16)', vx: -0.15, vy: 0.2 },
      { x: canvas.width * 0.5, y: canvas.height * 0.8, radius: 480, color: 'rgba(168, 85, 247, 0.12)', vx: 0.1, vy: -0.2 }
    ];

    const animate = () => {
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.blobs.forEach((blob, idx) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < -100 || blob.x > canvas.width + 100) blob.vx *= -1;
        if (blob.y < -100 || blob.y > canvas.height + 100) blob.vy *= -1;

        const offsetX = this.mouseX * (idx + 1) * 0.3;
        const offsetY = this.mouseY * (idx + 1) * 0.3;

        const gradient = ctx.createRadialGradient(
          blob.x + offsetX,
          blob.y + offsetY,
          0,
          blob.x + offsetX,
          blob.y + offsetY,
          blob.radius
        );

        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x + offsetX, blob.y + offsetY, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      this.animId = requestAnimationFrame(animate);
    };

    animate();
  }
}
