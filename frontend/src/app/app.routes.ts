import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // User Storefront Routes (Immersive 3D Glassmorphism Theme)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      }
    ]
  },

  // Admin Command Center Routes (Dark Slate Glass Portal)
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'products/new',
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'admin/orders',
        loadComponent: () => import('./features/admin/orders/admin-order-list/admin-order-list.component').then(m => m.AdminOrderListComponent)
      }
    ]
  },

  // Auth Routes
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
