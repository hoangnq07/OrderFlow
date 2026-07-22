import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
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
    MatButtonModule,
    MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <h3>OrderFlow</h3>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active">
            <mat-icon matListItemIcon>storefront</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/cart" routerLinkActive="active">
            <mat-icon matListItemIcon [matBadge]="cartCount$ | async" [matBadgeHidden]="(cartCount$ | async) === 0" matBadgeColor="accent">shopping_cart</mat-icon>
            <span matListItemTitle>Shopping Cart</span>
          </a>
          <a mat-list-item *ngIf="authService.getRole() === 'ADMIN'" routerLink="/users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
          <a mat-list-item *ngIf="authService.getRole() === 'ADMIN'" routerLink="/admin/orders" routerLinkActive="active">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Admin Orders</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span class="spacer"></span>

          <!-- Cart Quick Icon -->
          <a mat-icon-button routerLink="/cart" title="Shopping Cart" style="margin-right: 12px;">
            <mat-icon [matBadge]="cartCount$ | async" [matBadgeHidden]="(cartCount$ | async) === 0" matBadgeColor="accent">shopping_cart</mat-icon>
          </a>

          <span style="margin-right: 16px;">{{ authService.getUsername() }}</span>
          <button mat-icon-button (click)="authService.logout()" title="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; }
    .sidenav-header { padding: 16px; text-align: center; border-bottom: 1px solid #e0e0e0; }
    .sidenav-header h3 { margin: 0; font-weight: 700; color: #3f51b5; }
    .content { padding: 24px; }
    .spacer { flex: 1 1 auto; }
    .active { background-color: rgba(0, 0, 0, 0.04); }
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
      error: () => {} // Silent fail if unauthenticated or error
    });
  }
}
