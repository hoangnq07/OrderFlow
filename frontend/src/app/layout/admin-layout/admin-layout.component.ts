import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="admin-sidenav-container">
      <!-- Dark Slate Collapsible Sidebar -->
      <mat-sidenav mode="side" opened class="admin-sidenav">
        <div class="admin-sidebar-header">
          <div class="admin-badge-icon">
            <mat-icon>shield</mat-icon>
          </div>
          <div class="admin-brand-info">
            <h3 class="admin-brand-title">ORDERFLOW</h3>
            <span class="admin-role-pill">COMMAND CENTER</span>
          </div>
        </div>

        <div class="sidebar-divider"></div>

        <mat-nav-list class="admin-nav-list">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="admin-active-link">
            <mat-icon matListItemIcon>space_dashboard</mat-icon>
            <span matListItemTitle>Overview Dashboard</span>
          </a>
          <a mat-list-item routerLink="/admin/orders" routerLinkActive="admin-active-link">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Order Processing</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="admin-active-link">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Product Catalog</span>
          </a>
          <a mat-list-item routerLink="/products/new" routerLinkActive="admin-active-link">
            <mat-icon matListItemIcon>add_circle_outline</mat-icon>
            <span matListItemTitle>Create Product</span>
          </a>
          <a mat-list-item routerLink="/users" routerLinkActive="admin-active-link">
            <mat-icon matListItemIcon>manage_accounts</mat-icon>
            <span matListItemTitle>User Management</span>
          </a>
        </mat-nav-list>

        <div class="sidebar-footer">
          <button mat-button class="switch-storefront-btn" routerLink="/products">
            <mat-icon>storefront</mat-icon>
            <span>View Customer Store</span>
          </button>
        </div>
      </mat-sidenav>

      <!-- Admin Topbar & Content -->
      <mat-sidenav-content class="admin-content-area">
        <mat-toolbar class="admin-topbar">
          <div class="topbar-status">
            <span class="pulse-indicator"></span>
            <span class="status-text">System Status: <strong style="color: #34d399;">Operational</strong></span>
          </div>

          <span class="spacer"></span>

          <!-- Admin User Profile Info -->
          <div class="admin-user-tag">
            <mat-icon class="admin-icon">account_circle</mat-icon>
            <span class="admin-username">{{ authService.getUsername() }}</span>
            <span class="badge-pill badge-confirmed">ADMIN</span>
          </div>

          <button mat-icon-button (click)="authService.logout()" class="admin-logout-btn" title="Logout">
            <mat-icon>power_settings_new</mat-icon>
          </button>
        </mat-toolbar>

        <div class="admin-main-container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-sidenav-container {
      height: 100vh;
      background-color: var(--admin-bg);
      color: #f8fafc;
    }

    .admin-sidenav {
      width: 270px;
      background: var(--admin-card-bg);
      border-right: 1px solid var(--admin-border);
      display: flex;
      flex-direction: column;
    }

    .admin-sidebar-header {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .admin-badge-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #0f766e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 0 15px rgba(2, 132, 199, 0.4);
    }

    .admin-brand-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: 1px;
      color: #f8fafc;
    }

    .admin-role-pill {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: #38bdf8;
    }

    .sidebar-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 0 16px 16px 16px;
    }

    .admin-nav-list a {
      color: #94a3b8;
      border-left: 3px solid transparent;
      margin-bottom: 4px;
      transition: all 0.2s ease;
    }

    .admin-nav-list a:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.04);
    }

    .admin-active-link {
      color: #38bdf8 !important;
      background: rgba(56, 189, 248, 0.1) !important;
      border-left-color: #38bdf8 !important;
      font-weight: 700;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 16px;
      border-top: 1px solid var(--admin-border);
    }

    .switch-storefront-btn {
      width: 100%;
      color: var(--accent-cyan);
      border: 1px solid rgba(0, 242, 254, 0.3);
      border-radius: 8px;
    }

    .admin-content-area {
      background-color: #080c14;
    }

    .admin-topbar {
      background: rgba(18, 24, 38, 0.9) !important;
      border-bottom: 1px solid var(--admin-border);
      height: 64px;
      padding: 0 24px;
    }

    .topbar-status {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .pulse-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #34d399;
      box-shadow: 0 0 10px #34d399;
      animation: pulseGlow 2s infinite;
    }

    .admin-user-tag {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 16px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
    }

    .admin-icon {
      color: #38bdf8;
    }

    .admin-username {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .admin-logout-btn {
      color: #f87171;
    }

    .admin-main-container {
      padding: 28px 32px;
    }
  `]
})
export class AdminLayoutComponent {
  constructor(public authService: AuthService) {}
}
