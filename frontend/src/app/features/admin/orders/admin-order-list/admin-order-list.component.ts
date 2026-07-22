import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="admin-orders-container">
      <mat-card class="orders-card">
        <mat-card-header>
          <mat-card-title>
            <div class="header-title">
              <h2>
                <mat-icon color="primary">receipt_long</mat-icon>
                Admin Order Management
              </h2>
              <button mat-icon-button color="primary" (click)="loadOrders()" matTooltip="Refresh orders list">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Filter Controls Bar -->
          <div class="filter-bar">
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Filter by Order Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onStatusFilterChange()">
                <mat-option value="ALL">All Statuses</mat-option>
                <mat-option value="PENDING">PENDING</mat-option>
                <mat-option value="CONFIRMED">CONFIRMED</mat-option>
                <mat-option value="PROCESSING">PROCESSING</mat-option>
                <mat-option value="SHIPPED">SHIPPED</mat-option>
                <mat-option value="DELIVERED">DELIVERED</mat-option>
                <mat-option value="CANCELLED">CANCELLED</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="loading" class="spinner-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Orders Table -->
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="orders" class="orders-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef> Order ID </th>
                <td mat-cell *matCellDef="let order"> #{{ order.id }} </td>
              </ng-container>

              <!-- Customer Email Column -->
              <ng-container matColumnDef="userEmail">
                <th mat-header-cell *matHeaderCellDef> Customer </th>
                <td mat-cell *matCellDef="let order"> {{ order.userEmail }} </td>
              </ng-container>

              <!-- Created At Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef> Date </th>
                <td mat-cell *matCellDef="let order"> {{ order.createdAt | date:'medium' }} </td>
              </ng-container>

              <!-- Total Amount Column -->
              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef> Total ($) </th>
                <td mat-cell *matCellDef="let order" class="amount-cell">
                  \${{ order.totalAmount | number:'1.2-2' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let order">
                  <mat-chip-option [ngClass]="getStatusChipClass(order.status)" selected readonly>
                    {{ order.status }}
                  </mat-chip-option>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let order">
                  <button mat-stroked-button color="primary" size="small" (click)="openUpdateModal(order)">
                    <mat-icon>edit</mat-icon> Update Status
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Empty State -->
            <div *ngIf="orders.length === 0" class="empty-state">
              <mat-icon class="empty-icon">inbox</mat-icon>
              <p>No orders found matching the filter criteria.</p>
            </div>
          </div>

          <!-- Pagination -->
          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>

          <!-- Update Order Status Inline Modal / Form -->
          <div *ngIf="selectedOrder" class="update-modal-backdrop">
            <mat-card class="update-card">
              <mat-card-header>
                <mat-card-title>
                  <h3>Update Order #{{ selectedOrder.id }} Status</h3>
                </mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <p><strong>Customer:</strong> {{ selectedOrder.userEmail }}</p>
                <p><strong>Current Status:</strong> {{ selectedOrder.status }}</p>

                <form [formGroup]="updateForm" (ngSubmit)="onSaveStatusUpdate()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Order Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option *ngFor="let targetStatus of getAllowedTransitions(selectedOrder.status)" [value]="targetStatus">
                        {{ targetStatus }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Note (Optional)</mat-label>
                    <textarea matInput formControlName="note" rows="2" placeholder="e.g. Shipped via FedEx tracking #123"></textarea>
                  </mat-form-field>

                  <div class="modal-actions">
                    <button mat-button type="button" (click)="closeUpdateModal()">Cancel</button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="updateForm.invalid || updating">
                      <mat-spinner *ngIf="updating" diameter="20"></mat-spinner>
                      <span *ngIf="!updating">Save Changes</span>
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-orders-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .header-title h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }
    .filter-bar {
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .status-filter {
      min-width: 250px;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .table-container {
      overflow-x: auto;
    }
    .orders-table {
      width: 100%;
    }
    .amount-cell {
      font-weight: 600;
      color: #2e7d32;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #757575;
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .update-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .update-card {
      width: 450px;
      max-width: 90vw;
    }
    .full-width {
      width: 100%;
      margin-bottom: 12px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
    .chip-pending {
      background-color: #ff9800 !important;
      color: white !important;
    }
    .chip-confirmed, .chip-processing {
      background-color: #2196f3 !important;
      color: white !important;
    }
    .chip-shipped {
      background-color: #9c27b0 !important;
      color: white !important;
    }
    .chip-delivered {
      background-color: #4caf50 !important;
      color: white !important;
    }
    .chip-cancelled {
      background-color: #f44336 !important;
      color: white !important;
    }
  `]
})
export class AdminOrderListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'userEmail', 'createdAt', 'totalAmount', 'status', 'actions'];
  orders: Order[] = [];
  selectedStatus: string = 'ALL';
  loading = false;
  updating = false;

  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  selectedOrder: Order | null = null;
  updateForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private adminOrderService: AdminOrderService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.updateForm = this.fb.group({
      status: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminOrderService.getAdminOrders(this.selectedStatus, this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success && response.data) {
            this.orders = response.data.content;
            this.totalElements = response.data.totalElements;
          }
        },
        error: (err) => {
          this.loading = false;
          this.notificationService.error(err.error?.message || 'Failed to load admin orders');
        }
      });
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  getStatusChipClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'chip-pending';
      case 'CONFIRMED':
      case 'PROCESSING': return 'chip-confirmed';
      case 'SHIPPED': return 'chip-shipped';
      case 'DELIVERED': return 'chip-delivered';
      case 'CANCELLED': return 'chip-cancelled';
      default: return '';
    }
  }

  getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
    switch (currentStatus) {
      case 'PENDING': return ['PENDING', 'CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED': return ['CONFIRMED', 'PROCESSING', 'CANCELLED'];
      case 'PROCESSING': return ['PROCESSING', 'SHIPPED', 'CANCELLED'];
      case 'SHIPPED': return ['SHIPPED', 'DELIVERED'];
      case 'DELIVERED': return ['DELIVERED'];
      case 'CANCELLED': return ['CANCELLED'];
      default: return [];
    }
  }

  openUpdateModal(order: Order): void {
    this.selectedOrder = order;
    this.updateForm.patchValue({
      status: order.status,
      note: order.note || ''
    });
  }

  closeUpdateModal(): void {
    this.selectedOrder = null;
    this.updateForm.reset();
  }

  onSaveStatusUpdate(): void {
    if (this.updateForm.invalid || !this.selectedOrder) {
      return;
    }

    this.updating = true;
    const { status, note } = this.updateForm.value;

    this.adminOrderService.updateOrderStatus(this.selectedOrder.id, status, note)
      .subscribe({
        next: (response) => {
          this.updating = false;
          if (response.success) {
            this.notificationService.success(`Order #${this.selectedOrder?.id} status updated to ${status}`);
            this.closeUpdateModal();
            this.loadOrders();
          }
        },
        error: (err) => {
          this.updating = false;
          this.notificationService.error(err.error?.message || 'Failed to update order status');
        }
      });
  }
}
