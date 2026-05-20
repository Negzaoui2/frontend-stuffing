import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountRequest, AccountRequestStatus } from '../../../core/models/account-request.model';
import { AccountRequestsService } from '../../../core/services/account-requests';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-account-requests-dashboard',
  standalone: true,
  imports: [CommonModule, NotificationBellComponent],
  templateUrl: './account-requests-dashboard.component.html',
  styleUrls: ['./account-requests-dashboard.component.css'],
})
export class AccountRequestsDashboardComponent implements OnInit {
  isLoading = true;
  errorMessage = '';

  // Données affichées (page actuelle si pagination)
  requests: AccountRequest[] = [];

  // Filtre courant (null => toutes)
  filterStatus: AccountRequestStatus | null = null;

  // (Optionnel) pagination si tu veux l’utiliser ensuite
  page = 0;
  size = 10;
  total = 0;
  sort = 'createdAt,DESC';

  constructor(private accountRequestsService: AccountRequestsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.accountRequestsService
      .getAll({
        // NB: on ne filtre pas côté API car le backend peut ne pas supporter
        // le paramètre ?status=... (sinon la liste devient vide au clic).
        page: this.page,
        size: this.size,
        sort: this.sort,
      })
      .subscribe({
        next: (res: { items: AccountRequest[]; total: number; page: number; size: number }) => {
          this.requests = res.items ?? [];
          this.total = res.total ?? 0;
          this.page = res.page ?? this.page;
          this.size = res.size ?? this.size;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          console.error('Erreur chargement demandes:', err);
          this.errorMessage = 'Impossible de charger les demandes.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ✅ Compteurs (sur la liste affichée)
  get pendingCount(): number {
    return this.requests.filter(r => r.status === AccountRequestStatus.PENDING).length;
  }
  get approvedCount(): number {
    return this.requests.filter(r => r.status === AccountRequestStatus.APPROVED).length;
  }
  get rejectedCount(): number {
    return this.requests.filter(r => r.status === AccountRequestStatus.REJECTED).length;
  }

  // ✅ Pour compat HTML existant
  get filteredRequests(): AccountRequest[] {
    if (this.filterStatus == null) return this.requests;
    return this.requests.filter((r) => r.status === this.filterStatus);
  }

  // ✅ Filtre côté back
  filterByStatus(status: string | null): void {
    if (status === null) {
      this.filterStatus = null;
    } else if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
      this.filterStatus = status as AccountRequestStatus;
    } else {
      this.filterStatus = null;
    }
    // Filtrage côté front: pas de rechargement nécessaire.
  }

  // Libellé
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      APPROVED: 'Approuvée',
      REJECTED: 'Rejetée',
    };
    return labels[status] || status;
  }

  // --- Actions

  openApproveModal(request: AccountRequest): void {
    const role = prompt('Choisir le rôle:\n1. COLLABORATEUR\n2. MANAGER\n3. ADMIN', '1');

    let selectedRole = 'COLLABORATEUR';
    if (role === '2') selectedRole = 'MANAGER';
    else if (role === '3') selectedRole = 'ADMIN';

    const temporaryPassword = prompt('Mot de passe temporaire (laisser vide pour auto-génération) :', '') || undefined;

    this.approveRequest(request.id, { role: selectedRole, temporaryPassword });
  }

  private approveRequest(id: string | number, data: { role: string; temporaryPassword?: string }): void {
    this.isLoading = true;
    this.accountRequestsService.approveRequest(Number(id), data).subscribe({
      next: () => {
        alert('Demande approuvée avec succès');
        this.isLoading = false;
        this.load(); // 🔁 recharge avec filtre courant
      },
      error: (err: unknown) => {
        console.error('Erreur approbation:', err);
        this.isLoading = false;
        alert('Erreur lors de l\'approbation de la demande');
      }
    });
  }

  openRejectModal(request: AccountRequest): void {
    const reason = prompt('Raison du rejet (optionnel):') || undefined;
    this.rejectRequest(request.id, reason);
  }

  private rejectRequest(id: string | number, reason?: string): void {
    this.isLoading = true;
    this.accountRequestsService.rejectRequest(Number(id), { reason }).subscribe({
      next: () => {
        alert('Demande rejetée avec succès');
        this.isLoading = false;
        this.load(); // 🔁 recharge avec filtre courant
      },
      error: (err: unknown) => {
        console.error('Erreur rejet:', err);
        this.isLoading = false;
        alert('Erreur lors du rejet de la demande');
      }
    });
  }
}
