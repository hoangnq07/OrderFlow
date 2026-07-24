import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThreeBgComponent } from '../../shared/components/three-bg/three-bg.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    ThreeBgComponent
  ],
  template: `
    <!-- Interactive 3D Canvas Background -->
    <app-three-bg></app-three-bg>

    <div class="user-layout-wrapper">
      <!-- Floating Glass Navbar -->
      <header class="glass-navbar">
        <div class="nav-container">
          <!-- Brand Logo -->
          <a routerLink="/products" class="brand-logo">
            <div class="logo-icon"><mat-icon>layers</mat-icon></div>
            <div class="logo-brand-wrap">
              <span class="logo-text">OrderFlow</span>
              <span class="logo-subtext">Engine</span>
            </div>
          </a>

          <!-- Nav Links -->
          <nav class="nav-links">
            <a *ngIf="authService.getRole() === 'ADMIN'" routerLink="/admin/dashboard" routerLinkActive="active-link" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a routerLink="/products" routerLinkActive="active-link" class="nav-item">
              <mat-icon>storefront</mat-icon>
              <span>Storefront</span>
            </a>
            <a routerLink="/cart" routerLinkActive="active-link" class="nav-item">
              <mat-icon [matBadge]="cartCount$ | async" [matBadgeHidden]="(cartCount$ | async) === 0" matBadgeColor="accent">shopping_cart</mat-icon>
              <span>Cart</span>
            </a>
            <a routerLink="/orders" routerLinkActive="active-link" class="nav-item">
              <mat-icon>receipt_long</mat-icon>
              <span>My Orders</span>
            </a>
            <a *ngIf="authService.getRole() === 'ADMIN'" routerLink="/admin/orders" routerLinkActive="active-link" class="nav-item admin-badge-link">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin Portal</span>
            </a>
          </nav>

          <!-- User Profile & Actions -->
          <div class="user-controls">
            <a mat-icon-button routerLink="/cart" class="cart-btn" title="View Cart">
              <mat-icon [matBadge]="cartCount$ | async" [matBadgeHidden]="(cartCount$ | async) === 0" matBadgeColor="warn">shopping_bag</mat-icon>
            </a>

            <div class="user-profile-menu" [matMenuTriggerFor]="userMenu">
              <div class="avatar-ring">
                <span class="avatar-initial">{{ (authService.getUsername() || 'U')[0].toUpperCase() }}</span>
              </div>
              <div class="user-info-brief">
                <span class="user-name">{{ authService.getUsername() }}</span>
                <span class="user-role-tag">{{ authService.getRole() }}</span>
              </div>
              <mat-icon class="dropdown-icon">expand_more</mat-icon>
            </div>

            <mat-menu #userMenu="matMenu" class="glass-menu">
              <div class="menu-header">
                <div class="menu-user-title">{{ authService.getUsername() }}</div>
                <div class="menu-user-role badge-pill badge-confirmed">{{ authService.getRole() }}</div>
              </div>
              <button mat-menu-item routerLink="/products">
                <mat-icon>storefront</mat-icon>
                <span>Browse Products</span>
              </button>
              <button mat-menu-item routerLink="/cart">
                <mat-icon>shopping_cart</mat-icon>
                <span>My Cart</span>
              </button>
              <button mat-menu-item routerLink="/orders">
                <mat-icon>receipt_long</mat-icon>
                <span>My Orders</span>
              </button>
              <button *ngIf="authService.getRole() === 'ADMIN'" mat-menu-item routerLink="/admin/dashboard">
                <mat-icon>dashboard_customize</mat-icon>
                <span>Admin Dashboard</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="authService.logout()" class="logout-menu-item">
                <mat-icon color="warn">logout</mat-icon>
                <span style="color: #ef4444;">Sign Out</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </header>

      <!-- Main Page Content -->
      <main class="page-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Clean Enterprise Footer -->
      <footer class="glass-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <span>&copy; 2026 OrderFlow Platform Inc. All rights reserved.</span>
          </div>
          <div class="footer-links">
            <a routerLink="/products">Catalog</a>
            <span>•</span>
            <a routerLink="/cart">Cart</a>
            <span>•</span>
            <a *ngIf="authService.getRole() === 'ADMIN'" routerLink="/admin/dashboard">Admin Portal</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .user-layout-wrapper {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Glass Navbar */
    .glass-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
      padding: 0 24px;
    }

    .nav-container {
      max-width: 1280px;
      height: 70px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
    }

    .logo-brand-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }

    .logo-subtext {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6366f1;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: #4f46e5;
      background: rgba(99, 102, 241, 0.08);
    }

    .active-link {
      color: #4f46e5 !important;
      background: rgba(99, 102, 241, 0.12) !important;
      font-weight: 700;
    }

    .admin-badge-link {
      color: #7c3aed !important;
      background: rgba(124, 58, 237, 0.08);
    }

    .user-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cart-btn {
      color: #334155;
    }

    .user-profile-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 12px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .user-profile-menu:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    .avatar-ring {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 0.85rem;
    }

    .user-info-brief {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-name {
      font-weight: 700;
      font-size: 0.85rem;
      color: #0f172a;
    }

    .user-role-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .dropdown-icon {
      color: #94a3b8;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .menu-header {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .menu-user-title {
      font-weight: 700;
      margin-bottom: 4px;
      color: #0f172a;
    }

    .page-content {
      flex: 1;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
      box-sizing: border-box;
    }

    .glass-footer {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-top: 1px solid #e2e8f0;
      padding: 20px 24px;
      margin-top: 40px;
    }

    .footer-content {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      color: #64748b;
      font-size: 0.85rem;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .footer-links a {
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: #4f46e5;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  cartCount$: Observable<number>;

  constructor(
    public authService: AuthService,
    private cartService: CartService
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      error: () => {}
    });
  }
}
