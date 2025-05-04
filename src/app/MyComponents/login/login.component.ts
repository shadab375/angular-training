import { Component, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  
  // Cursor and wave effect properties
  private customCursor: HTMLElement | null = null;
  private customCursorTrail: HTMLElement | null = null;
  private customCursorRing: HTMLElement | null = null;
  private cursorVisible: boolean = true;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private waveBg: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private boundMouseMove: any = null;
  private boundMouseDown: any = null;
  private boundMouseUp: any = null;
  private boundMouseEnter: any = null;
  private boundMouseLeave: any = null;
  private boundWaveEffect: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngAfterViewInit(): void {
    // Initialize custom cursor and wave effects
    setTimeout(() => {
      this.initCustomCursor();
      this.initWaveEffect();
      this.addCursorHoverEffects();
    }, 500);
  }
  
  ngOnDestroy(): void {
    // Cancel animation when component is destroyed
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    if (this.boundMouseMove) document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundMouseDown) document.removeEventListener('mousedown', this.boundMouseDown);
    if (this.boundMouseUp) document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.boundMouseEnter) document.removeEventListener('mouseenter', this.boundMouseEnter);
    if (this.boundMouseLeave) document.removeEventListener('mouseleave', this.boundMouseLeave);
    if (this.boundWaveEffect) document.removeEventListener('mousemove', this.boundWaveEffect);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
        this.isSubmitting = false;
      }
    });
  }
  
  // Initialize wave effect that responds to cursor movement
  private initWaveEffect(): void {
    this.waveBg = document.querySelector('.wave-bg');
    if (!this.waveBg) {
      // Create wave background if it doesn't exist
      this.waveBg = this.renderer.createElement('div');
      this.renderer.addClass(this.waveBg, 'wave-bg');
      this.renderer.setStyle(this.waveBg, 'position', 'fixed');
      this.renderer.setStyle(this.waveBg, 'top', '0');
      this.renderer.setStyle(this.waveBg, 'left', '0');
      this.renderer.setStyle(this.waveBg, 'width', '100%');
      this.renderer.setStyle(this.waveBg, 'height', '100%');
      this.renderer.setStyle(this.waveBg, 'pointer-events', 'none');
      this.renderer.setStyle(this.waveBg, 'z-index', '0');
      this.renderer.appendChild(document.body, this.waveBg);

      // Create wave elements
      for (let i = 0; i < 3; i++) {
        const wave = this.renderer.createElement('div');
        this.renderer.addClass(wave, 'wave');
        this.renderer.addClass(wave, `wave-${i+1}`);
        this.renderer.setStyle(wave, 'position', 'absolute');
        this.renderer.setStyle(wave, 'top', '0');
        this.renderer.setStyle(wave, 'left', '0');
        this.renderer.setStyle(wave, 'width', '100%');
        this.renderer.setStyle(wave, 'height', '100%');
        this.renderer.setStyle(wave, 'background', 'radial-gradient(circle at var(--x) var(--y), rgba(138, 43, 226, 0.05) 0%, transparent 50%)');
        this.renderer.setStyle(wave, 'opacity', '0.6');
        this.renderer.setStyle(wave, 'transform', 'translate(0, 0)');
        this.renderer.setStyle(wave, 'transition', 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)');
        this.renderer.appendChild(this.waveBg, wave);
      }
    }

    // Update wave position based on cursor
    this.boundWaveEffect = (e: MouseEvent) => {
      if (!this.waveBg) return;
      
      const waves = this.waveBg.querySelectorAll('.wave');
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      waves.forEach((wave: Element, index: number) => {
        const delay = index * 0.2;
        
        // Update wave position with gentle parallax effect
        setTimeout(() => {
          this.renderer.setStyle(wave, '--x', `${x}%`);
          this.renderer.setStyle(wave, '--y', `${y}%`);
          
          // Subtle movement based on cursor
          const translateX = (x - 50) * ((index + 1) * 0.05);
          const translateY = (y - 50) * ((index + 1) * 0.05);
          this.renderer.setStyle(wave, 'transform', `translate(${translateX}px, ${translateY}px)`);
          
          // Change opacity slightly based on movement
          const opacity = 0.4 + (index * 0.1);
          this.renderer.setStyle(wave, 'opacity', opacity.toString());
        }, delay * 1000);
      });
    };

    // Add event listener for wave effect
    document.addEventListener('mousemove', this.boundWaveEffect);
  }

  // Custom cursor initialization
  private initCustomCursor(): void {
    // Create custom cursor elements if they don't exist
    if (!document.querySelector('.cursor-dot')) {
      // Main cursor dot
      this.customCursor = this.renderer.createElement('div');
      this.renderer.addClass(this.customCursor, 'cursor-dot');
      this.renderer.appendChild(document.body, this.customCursor);
      
      // Cursor trail
      this.customCursorTrail = this.renderer.createElement('div');
      this.renderer.addClass(this.customCursorTrail, 'cursor-trail');
      this.renderer.appendChild(document.body, this.customCursorTrail);
      
      // Cursor ring
      this.customCursorRing = this.renderer.createElement('div');
      this.renderer.addClass(this.customCursorRing, 'cursor-ring');
      this.renderer.appendChild(document.body, this.customCursorRing);
    } else {
      // Get references if they already exist
      this.customCursor = document.querySelector('.cursor-dot');
      this.customCursorTrail = document.querySelector('.cursor-trail');
      this.customCursorRing = document.querySelector('.cursor-ring');
    }
    
    // Set initial position
    this.updateCursorPosition({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as MouseEvent);
    
    // Define bound event handlers to allow proper removal
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundMouseEnter = this.onMouseEnter.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    
    // Add event listeners
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('mouseenter', this.boundMouseEnter);
    document.addEventListener('mouseleave', this.boundMouseLeave);
    
    // Hide system cursor
    document.body.style.cursor = 'none';
    
    // Start animation loop
    this.animateCursor();
  }
  
  private onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.updateCursorVisibility();
  }
  
  private onMouseDown(e: MouseEvent): void {
    this.updateCursorScale(true);
  }
  
  private onMouseUp(e: MouseEvent): void {
    this.updateCursorScale(false);
  }
  
  private onMouseEnter(e: MouseEvent): void {
    this.cursorVisible = true;
    this.updateCursorVisibility();
  }
  
  private onMouseLeave(e: MouseEvent): void {
    this.cursorVisible = false;
    this.updateCursorVisibility();
  }
  
  private updateCursorPosition(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }
  
  private updateCursorVisibility(): void {
    if (this.customCursor && this.customCursorTrail && this.customCursorRing) {
      if (this.cursorVisible) {
        this.renderer.setStyle(this.customCursor, 'opacity', '1');
        this.renderer.setStyle(this.customCursorTrail, 'opacity', '1');
        this.renderer.setStyle(this.customCursorRing, 'opacity', '1');
      } else {
        this.renderer.setStyle(this.customCursor, 'opacity', '0');
        this.renderer.setStyle(this.customCursorTrail, 'opacity', '0');
        this.renderer.setStyle(this.customCursorRing, 'opacity', '0');
      }
    }
  }
  
  private updateCursorScale(isDown: boolean): void {
    if (this.customCursor && this.customCursorTrail && this.customCursorRing) {
      if (isDown) {
        // Click effect - scale down dot, scale up ring
        this.renderer.setStyle(this.customCursor, 'transform', `translate(-50%, -50%) scale(0.7)`);
        this.renderer.setStyle(this.customCursorRing, 'transform', `translate(-50%, -50%) scale(1.4)`);
        this.renderer.setStyle(this.customCursorTrail, 'transform', `translate(-50%, -50%) scale(1.4)`);
      } else {
        // Release effect
        this.renderer.setStyle(this.customCursor, 'transform', `translate(-50%, -50%) scale(1)`);
        this.renderer.setStyle(this.customCursorRing, 'transform', `translate(-50%, -50%) scale(1)`);
        this.renderer.setStyle(this.customCursorTrail, 'transform', `translate(-50%, -50%) scale(1)`);
      }
    }
  }
  
  private addCursorHoverEffects(): void {
    // Collect all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        if (this.customCursorRing) {
          this.renderer.setStyle(this.customCursorRing, 'transform', 'translate(-50%, -50%) scale(1.5)');
          this.renderer.setStyle(this.customCursorRing, 'background-color', 'rgba(139, 92, 246, 0.15)');
          this.renderer.setStyle(this.customCursorRing, 'backdrop-filter', 'blur(4px)');
        }
      });
      
      element.addEventListener('mouseleave', () => {
        if (this.customCursorRing) {
          this.renderer.setStyle(this.customCursorRing, 'transform', 'translate(-50%, -50%) scale(1)');
          this.renderer.setStyle(this.customCursorRing, 'background-color', 'rgba(139, 92, 246, 0.08)');
          this.renderer.setStyle(this.customCursorRing, 'backdrop-filter', 'blur(0)');
        }
      });
    });
  }
  
  private animateCursor(): void {
    if (this.customCursor && this.customCursorTrail && this.customCursorRing) {
      // Animate main cursor dot exactly at mouse position
      this.renderer.setStyle(this.customCursor, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.customCursor, 'top', `${this.mouseY}px`);
      
      // Animated trail follows with slight delay (elastic effect)
      this.renderer.setStyle(this.customCursorTrail, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.customCursorTrail, 'top', `${this.mouseY}px`);
      
      // Ring follows with even more delay for a nice trail effect
      this.renderer.setStyle(this.customCursorRing, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.customCursorRing, 'top', `${this.mouseY}px`);
    }
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(() => this.animateCursor());
  }
} 