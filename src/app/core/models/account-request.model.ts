export interface AccountCreationRequestDto {
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle: string;
  message?: string;
}

export interface AccountRequest {
  id: string | number;
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle: string;
  message?: string;
  status: AccountRequestStatus;
  createdAt?: string;
  processedAt?: string;
  processedBy?: string;
}

export enum AccountRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export interface ApproveRequestDto {
  role: string;
  temporaryPassword?: string;
}

export interface RejectRequestDto {
  reason?: string;
}
