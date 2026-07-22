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
      <div class="dashboard-header">
        <div>
          <h2>Welcome back, {{ authService.getUsername() }}! 👋</h2>
          <p class="subtitle">Overview of system analytics and business performance metrics.</p>
        </div>

        <button *ngIf="isAdmin" mat-raised-button color="primary" (click)="loadStats()" [disabled]="loading">
          <mat-icon>refresh</mat-icon> Refresh Stats
        </button>
      </div>

      <!-- Spinner for Admin Stats Loading -->
      <div *ngIf="loading" class="spinner-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Admin Stat Cards Grid -->
      <div *ngIf="isAdmin && !loading && stats" class="stats-grid">
        <!-- Revenue Card -->
        <mat-card class="stat-card revenue-card">
          <mat-card-header>
            <div class="stat-icon-bg revenue-bg">
              <mat-icon class="stat-icon">attach_money</mat-icon>
            </div>
            <div>
              <mat-card-subtitle>Total Revenue</mat-card-subtitle>
              <mat-card-title class="stat-value">\${{ stats.totalRevenue | number:'1.2-2' }}</mat-card-title>
            </div>
          </mat-card-header>
        </mat-card>

        <!-- Orders Card -->
        <mat-card class="stat-card orders-card">
          <mat-card-header>
            <div class="stat-icon-bg orders-bg">
              <mat-icon class="stat-icon">shopping_bag</mat-icon>
            </div>
            <div>
              <mat-card-subtitle>Total Orders</mat-card-subtitle>
              <mat-card-title class="stat-value">{{ stats.totalOrders }}</mat-card-title>
            </div>
          </mat-card-header>
        </mat-card>

        <!-- Pending Card -->
        <mat-card class="stat-card pending-card">
          <mat-card-header>
            <div class="stat-icon-bg pending-bg">
              <mat-icon class="stat-icon">pending_actions</mat-icon>
            </div>
            <div>
              <mat-card-subtitle>Pending Orders</mat-card-subtitle>
              <mat-card-title class="stat-value">{{ stats.pendingOrders }}</mat-card-title>
            </div>
          </mat-card-header>
        </mat-card>

        <!-- Completed Card -->
        <mat-card class="stat-card completed-card">
          <mat-card-header>
            <div class="stat-icon-bg completed-bg">
              <mat-icon class="stat-icon">check_circle</mat-icon>
            </div>
            <div>
              <mat-card-subtitle>Delivered Orders</mat-card-subtitle>
              <mat-card-title class="stat-value">{{ stats.completedOrders }}</mat-card-title>
            </div>
          </mat-card-header>
        </mat-card>

        <!-- Products Card -->
        <mat-card class="stat-card products-card">
          <mat-card-header>
            <div class="stat-icon-bg products-bg">
              <mat-icon class="stat-icon">inventory_2</mat-icon>
            </div>
            <div>
              <mat-card-subtitle>Active Products</mat-card-subtitle>
              <mat-card-title class="stat-value">{{ stats.totalProducts }}</mat-card-title>
            </div>
          </mat-card-header>
        </mat-card>

        <!-- Customers Card -->
        <mat-card class="stat-card customers-card">
          <mat-card-header>
            <div class="stat-icon-bg customers-bg">
              <mat-icon class="stat-icon">people_alt</mat-icon>
            </div>
            <div>
              <mat-card-subtitle>Total Customers</mat-card-subtitle>
              <mat-card-title class="stat-value">{{ stats.totalCustomers }}</mat-card-title>
            </div>
          </mat-card-header>
        </mat-card>
      </div>

      <!-- Quick Action Modules -->
      <h3 class="section-title">Quick Actions & Navigation</h3>
      <div class="action-cards">
        <mat-card class="action-card" routerLink="/products">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">storefront</mat-icon>
            <mat-card-title>Product Catalog</mat-card-title>
            <mat-card-subtitle>Browse & manage items</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View complete product list, filter by category, and create new products.</p>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="isAdmin" class="action-card" routerLink="/admin/orders">
          <mat-card-header>
            <mat-icon mat-card-avatar color="accent">receipt_long</mat-icon>
            <mat-card-title>Admin Orders</mat-card-title>
            <mat-card-subtitle>Manage customer orders</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Filter customer orders by status and update order state transitions.</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card" routerLink="/cart">
          <mat-card-header>
            <mat-icon mat-card-avatar style="color: #9c27b0;">shopping_cart</mat-icon>
            <mat-card-title>Shopping Cart</mat-card-title>
            <mat-card-subtitle>Current cart session</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View cart items, modify quantities, and proceed to checkout.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .dashboard-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1a237e;
    }
    .subtitle {
      margin: 4px 0 0 0;
      color: #666;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
    .stat-icon-bg {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }
    .revenue-bg { background-color: #e8f5e9; color: #2e7d32; }
    .orders-bg { background-color: #e3f2fd; color: #1565c0; }
    .pending-bg { background-color: #fff3e0; color: #ef6c00; }
    .completed-bg { background-color: #e0f2f1; color: #00695c; }
    .products-bg { background-color: #f3e5f5; color: #6a1b9a; }
    .customers-bg { background-color: #e0f7fa; color: #00838f; }
    .stat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-top: 4px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }
    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .action-card {
      cursor: pointer;
      border-radius: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .action-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {}

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
