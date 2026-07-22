import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Enterprise Hero Header -->
      <div class="hero-banner glass-card">
        <div class="hero-main">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span>SYSTEM ONLINE • {{ authService.getRole() }} PORTAL</span>
          </div>
          <h1 class="hero-title">Welcome back, {{ authService.getUsername() }}</h1>
          <p class="hero-subtitle">
            OrderFlow Engine — High-performance order processing platform with pessimistic inventory locks & real-time async event pipeline.
          </p>

          <div class="hero-tags">
            <span class="tech-tag"><mat-icon class="tag-icon">lock</mat-icon> Pessimistic Stock Lock</span>
            <span class="tech-tag"><mat-icon class="tag-icon">bolt</mat-icon> Redis Cart Hash</span>
            <span class="tech-tag"><mat-icon class="tag-icon">alt_route</mat-icon> RabbitMQ Event Bus</span>
            <span class="tech-tag"><mat-icon class="tag-icon">verified_user</mat-icon> JWT Authorization</span>
          </div>
        </div>

        <div class="hero-actions" *ngIf="isAdmin">
          <button mat-flat-button class="refresh-btn" (click)="loadStats()" [disabled]="loading">
            <mat-icon [class.spinning]="loading">refresh</mat-icon>
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      <!-- Admin Stat Metrics Grid -->
      <div *ngIf="isAdmin" class="stats-section">
        <div class="section-header">
          <h3 class="section-title">
            <mat-icon class="sec-icon">analytics</mat-icon> Executive Analytics & Performance
          </h3>
          <span class="section-sub">Live updates from PostgreSQL & Redis caches</span>
        </div>

        <div *ngIf="loading" class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && stats" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap revenue-bg">
              <mat-icon>attach_money</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-label">Total Revenue</span>
              <div class="stat-val-row">
                <span class="stat-value">\${{ stats.totalRevenue | number:'1.2-2' }}</span>
                <span class="trend-badge positive">+14.2%</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap orders-bg">
              <mat-icon>shopping_bag</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-label">Total Orders</span>
              <div class="stat-val-row">
                <span class="stat-value">{{ stats.totalOrders }}</span>
                <span class="trend-badge neutral">Active</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap pending-bg">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-label">Pending Orders</span>
              <div class="stat-val-row">
                <span class="stat-value">{{ stats.pendingOrders }}</span>
                <span class="trend-badge warning">Queue</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap completed-bg">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-label">Delivered Orders</span>
              <div class="stat-val-row">
                <span class="stat-value">{{ stats.completedOrders }}</span>
                <span class="trend-badge positive">99.8% Success</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap products-bg">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-label">Active Catalog</span>
              <div class="stat-val-row">
                <span class="stat-value">{{ stats.totalProducts }}</span>
                <span class="trend-badge neutral">Products</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap customers-bg">
              <mat-icon>group</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-label">Registered Accounts</span>
              <div class="stat-val-row">
                <span class="stat-value">{{ stats.totalCustomers }}</span>
                <span class="trend-badge positive">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Overview Cards (For Non-Admin Users) -->
      <div *ngIf="!isAdmin" class="user-quick-stats">
        <div class="user-stat-card">
          <div class="u-stat-icon"><mat-icon>shopping_cart</mat-icon></div>
          <div class="u-stat-info">
            <span class="u-stat-num">{{ (cartCount$ | async) || 0 }}</span>
            <span class="u-stat-label">Items in Cart</span>
          </div>
          <a routerLink="/cart" class="u-stat-link">View Cart &rarr;</a>
        </div>

        <div class="user-stat-card">
          <div class="u-stat-icon catalog-ic"><mat-icon>storefront</mat-icon></div>
          <div class="u-stat-info">
            <span class="u-stat-num">Available</span>
            <span class="u-stat-label">Product Catalog</span>
          </div>
          <a routerLink="/products" class="u-stat-link">Explore Items &rarr;</a>
        </div>

        <div class="user-stat-card">
          <div class="u-stat-icon security-ic"><mat-icon>verified</mat-icon></div>
          <div class="u-stat-info">
            <span class="u-stat-num">Authorized</span>
            <span class="u-stat-label">Session Status</span>
          </div>
          <span class="u-stat-link text-emerald">Active Token</span>
        </div>
      </div>

      <!-- Core Modules & Quick Navigation -->
      <div class="modules-section">
        <div class="section-header">
          <h3 class="section-title">
            <mat-icon class="sec-icon">apps</mat-icon> Quick Navigation & Store Services
          </h3>
        </div>

        <div class="action-grid">
          <div class="action-card" routerLink="/products">
            <div class="card-top">
              <div class="card-icon-avatar blue-ic">
                <mat-icon>storefront</mat-icon>
              </div>
              <span class="card-badge">Catalog</span>
            </div>
            <h4 class="card-title">Storefront & Products</h4>
            <p class="card-desc">
              Discover active items, search by category, inspect pricing and real-time inventory availability.
            </p>
            <div class="card-footer-link">
              <span>Browse Catalog</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </div>

          <div class="action-card" routerLink="/cart">
            <div class="card-top">
              <div class="card-icon-avatar purple-ic">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <span class="card-badge">Redis Session</span>
            </div>
            <h4 class="card-title">Shopping Cart & Checkout</h4>
            <p class="card-desc">
              Manage your active cart items, update quantities, and submit orders with backend stock verification.
            </p>
            <div class="card-footer-link">
              <span>Go to Cart</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </div>

          <div *ngIf="isAdmin" class="action-card admin-action-card" routerLink="/admin/orders">
            <div class="card-top">
              <div class="card-icon-avatar indigo-ic">
                <mat-icon>receipt_long</mat-icon>
              </div>
              <span class="card-badge admin-tag">Admin Management</span>
            </div>
            <h4 class="card-title">Order Processing Engine</h4>
            <p class="card-desc">
              Review customer transactions, inspect order lifecycle states, and execute status transitions safely.
            </p>
            <div class="card-footer-link">
              <span>Manage Orders</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture Pipeline Card -->
      <div class="pipeline-card glass-card">
        <div class="pipeline-header">
          <mat-icon class="pipe-icon">account_tree</mat-icon>
          <div>
            <h4>Order Processing Pipeline</h4>
            <p>End-to-end transactional lifecycle enforced by OrderFlow backend</p>
          </div>
        </div>
        <div class="pipeline-steps">
          <div class="step">
            <span class="step-num">1</span>
            <span class="step-title">Cart Redis Session</span>
            <span class="step-sub">7-Day Hash TTL</span>
          </div>
          <div class="step-arrow">&rarr;</div>
          <div class="step">
            <span class="step-num">2</span>
            <span class="step-title">Pessimistic Lock</span>
            <span class="step-sub">PESSIMISTIC_WRITE</span>
          </div>
          <div class="step-arrow">&rarr;</div>
          <div class="step">
            <span class="step-num">3</span>
            <span class="step-title">Stock Reduction</span>
            <span class="step-sub">Transactional DB</span>
          </div>
          <div class="step-arrow">&rarr;</div>
          <div class="step">
            <span class="step-num">4</span>
            <span class="step-title">RabbitMQ Event</span>
            <span class="step-sub">Async MailHog Email</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Glass Card Base */
    .glass-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.25);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(99, 102, 241, 0.25);
      border: 1px solid rgba(129, 140, 248, 0.4);
      color: #818cf8;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
    }

    .hero-title {
      margin: 0 0 8px 0;
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .hero-subtitle {
      margin: 0 0 20px 0;
      color: #94a3b8;
      font-size: 0.95rem;
      max-width: 720px;
      line-height: 1.5;
    }

    .hero-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .tech-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .tag-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #38bdf8;
    }

    .refresh-btn {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #ffffff !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      padding: 8px 18px !important;
      backdrop-filter: blur(8px);
    }

    .refresh-btn:hover {
      background: rgba(255, 255, 255, 0.25) !important;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 16px;
    }

    .section-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sec-icon {
      color: #4f46e5;
    }

    .section-sub {
      font-size: 0.82rem;
      color: #64748b;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
    }

    .stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .revenue-bg { background: #ecfdf5; color: #059669; }
    .orders-bg { background: #eff6ff; color: #2563eb; }
    .pending-bg { background: #fff7ed; color: #ea580c; }
    .completed-bg { background: #f0fdf4; color: #16a34a; }
    .products-bg { background: #faf5ff; color: #9333ea; }
    .customers-bg { background: #f0f9ff; color: #0284c7; }

    .stat-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }

    .stat-val-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
    }

    .stat-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
    }

    .trend-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .trend-badge.positive { background: #dcfce7; color: #15803d; }
    .trend-badge.neutral { background: #f1f5f9; color: #475569; }
    .trend-badge.warning { background: #ffedd5; color: #c2410c; }

    /* Customer Quick Stats */
    .user-quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .user-stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
    }

    .u-stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .catalog-ic { background: rgba(14, 165, 233, 0.1); color: #0284c7; }
    .security-ic { background: rgba(16, 185, 129, 0.1); color: #059669; }

    .u-stat-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .u-stat-num {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }

    .u-stat-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }

    .u-stat-link {
      font-size: 0.85rem;
      font-weight: 700;
      color: #4f46e5;
      text-decoration: none;
    }

    .text-emerald { color: #059669; }

    /* Action Grid */
    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s ease;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
    }

    .action-card:hover {
      border-color: #6366f1;
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -4px rgba(99, 102, 241, 0.12);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-icon-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blue-ic { background: #e0f2fe; color: #0284c7; }
    .purple-ic { background: #f3e8ff; color: #9333ea; }
    .indigo-ic { background: #e0e7ff; color: #4338ca; }

    .card-badge {
      font-size: 0.72rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .admin-tag {
      background: #f3e8ff;
      color: #7e22ce;
    }

    .card-title {
      margin: 0 0 8px 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .card-desc {
      margin: 0 0 20px 0;
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.5;
    }

    .card-footer-link {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      font-weight: 700;
      color: #4f46e5;
    }

    /* Architecture Pipeline Card */
    .pipeline-card {
      background: #f8fafc;
    }

    .pipeline-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .pipe-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #4f46e5;
    }

    .pipeline-header h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    .pipeline-header p {
      margin: 2px 0 0 0;
      font-size: 0.82rem;
      color: #64748b;
    }

    .pipeline-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .step {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 180px;
    }

    .step-num {
      font-size: 0.7rem;
      font-weight: 800;
      color: #4f46e5;
      background: rgba(99, 102, 241, 0.1);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .step-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
    }

    .step-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    .step-arrow {
      color: #cbd5e1;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 30px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  isAdmin = false;
  cartCount$: Observable<number>;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private cartService: CartService
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    if (this.isAdmin) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
