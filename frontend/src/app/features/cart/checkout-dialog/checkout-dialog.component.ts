import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Cart } from '../../../core/models/cart.model';

export interface CheckoutDialogData {
  cart: Cart;
}

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title text-gradient-cyan">
      <mat-icon class="title-icon">local_shipping</mat-icon> Complete Your Order Checkout
    </h2>

    <mat-dialog-content class="dialog-content">
      <div class="checkout-summary-box glass-panel">
        <div class="summary-item">
          <span>Items to Purchase:</span>
          <strong>{{ data.cart.totalItems }} items</strong>
        </div>
        <div class="summary-item">
          <span>Total Payment Amount:</span>
          <strong class="total-amount text-gradient-cyan">{{ data.cart.totalAmount | currency:'USD':'symbol':'1.2-2' }}</strong>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="checkout-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Shipping Address</mat-label>
          <input matInput formControlName="shippingAddress" placeholder="e.g. 123 Main Street, Apt 4B, New York, NY" required />
          <mat-icon matSuffix>location_on</mat-icon>
          <mat-error *ngIf="form.get('shippingAddress')?.hasError('required')">
            Shipping address is required to dispatch your order
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Order Delivery Notes (Optional)</mat-label>
          <textarea matInput formControlName="note" rows="3" placeholder="e.g. Please leave package at front porch or call upon arrival"></textarea>
          <mat-icon matSuffix>note_add</mat-icon>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()" [disabled]="submitting">Cancel</button>
      <button 
        mat-raised-button 
        class="btn-glowing" 
        (click)="onSubmit()" 
        [disabled]="form.invalid || submitting">
        <mat-icon>shopping_bag</mat-icon> {{ submitting ? 'Processing Order...' : 'Confirm & Place Order' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      padding: 20px 24px 10px 24px;
    }
    .title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--accent-cyan);
    }
    .dialog-content {
      padding: 10px 24px 20px 24px;
    }
    .checkout-summary-box {
      padding: 16px;
      margin-bottom: 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .total-amount {
      font-size: 1.3rem;
      font-weight: 800;
    }
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .dialog-actions {
      padding: 16px 24px 20px 24px;
    }
  `]
})
export class CheckoutDialogComponent {
  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheckoutDialogData
  ) {
    this.form = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
      note: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
