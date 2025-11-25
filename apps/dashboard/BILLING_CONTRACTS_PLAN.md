# Billing & Contracts Implementation Plan

## Overview
This document outlines the implementation of two new customer portal sections: **Billing** and **Contracts**.

---

## 1. BILLING SECTION

### Purpose
Provide customers with complete visibility and control over their billing, invoices, subscriptions, and payment methods using the existing Polar.sh integration.

### Features

#### A. Invoices Tab (Default)
- **Invoice List**: Display all invoices from Polar.sh orders
  - Invoice number/ID
  - Date issued
  - Amount and currency
  - Payment status (Paid, Pending, Overdue)
  - Product/service name
  - Download PDF button
- **Filtering**: By status, date range
- **Search**: By invoice number or product name
- **Actions**:
  - Download PDF (uses existing `billing.getInvoice` tRPC endpoint)
  - View details
  - Pay now (for pending invoices)

#### B. Subscription Tab
- **Current Plan**: Display active subscription details
  - Plan name and tier
  - Billing cycle (monthly/yearly)
  - Next billing date
  - Amount
  - Status (Active, Cancelled, Past Due)
- **Usage/Limits**: If applicable
- **Actions**:
  - Upgrade/Downgrade plan
  - Cancel subscription
  - Reactivate subscription
- **Billing History**: Quick view of recent charges

#### C. Payment Method Tab
- **Current Payment Method**: Display saved payment method
  - Card type and last 4 digits
  - Expiration date
  - Billing address
- **Actions**:
  - Update payment method
  - Add new payment method
  - Remove payment method
  - Set default payment method

### Technical Implementation

#### Backend (Already Exists!)
- ✅ `billing.orders` - Fetches orders/invoices from Polar
- ✅ `billing.getInvoice` - Generates and downloads invoice PDF
- ✅ `billing.checkInvoiceStatus` - Checks if invoice is ready

#### Frontend Components
```
/billing
├── page.tsx                    # Main billing page
└── components/
    ├── billing-header.tsx      # Header with tabs
    ├── billing-view.tsx        # Main view with tab content
    ├── invoices-tab.tsx        # Invoices list and filters
    ├── subscription-tab.tsx    # Subscription management
    ├── payment-tab.tsx         # Payment method management
    ├── invoice-card.tsx        # Individual invoice card
    └── subscription-card.tsx   # Subscription details card
```

#### Polar.sh Integration
- Use existing Polar SDK (`@polar-sh/sdk`)
- Customer Portal URL: Can redirect to Polar's hosted portal for payment updates
- Webhooks: Already set up at `/api/webhook/polar`

### UI/UX Design
- **Card-based layout** for invoices (similar to credentials)
- **Status badges** with color coding:
  - Green: Paid
  - Yellow: Pending
  - Red: Overdue/Failed
- **Tabs** for navigation between Invoices, Subscription, Payment
- **Download buttons** with loading states
- **Empty states** for no invoices/subscription

---

## 2. CONTRACTS SECTION

### Purpose
Enable customers to view, sign, download, and upload contracts with digital signature capabilities.

### Features

#### A. Contract List
- **All Contracts**: Display all contracts
  - Contract name/title
  - Type (Service Agreement, NDA, etc.)
  - Status (Draft, Pending Signature, Signed, Expired)
  - Created date
  - Signed date (if applicable)
  - Parties involved
- **Filtering**: By status, type, date
- **Search**: By contract name
- **Actions**:
  - View contract
  - Download PDF
  - Sign (if pending)
  - Upload signed copy

#### B. Contract Details View
- **Document Viewer**: PDF preview
- **Metadata**:
  - Contract ID
  - Created by
  - Created date
  - Status
  - Signatories and their status
- **Signature Section**:
  - Digital signature pad
  - Type name option
  - Upload signed document option
- **History/Audit Trail**:
  - Who viewed when
  - Who signed when
  - Document versions

#### C. Digital Signature Options

**Option 1: DocuSeal (Open Source)**
- Free, open-source e-signature solution
- Self-hosted or cloud
- API for creating, sending, signing documents
- Webhook support
- [GitHub](https://github.com/docusealco/docuseal)

**Option 2: Simple Custom Solution**
- Use `react-signature-canvas` for signature pad
- Store signatures as images
- Generate signed PDFs using `pdf-lib`
- Store in database/file storage
- Simpler but less legally robust

**Option 3: Hybrid Approach** (Recommended)
- Digital signature for quick signing
- Upload option for paper-signed documents
- Both stored with audit trail
- More flexible for customers

### Technical Implementation

#### Database Schema
```typescript
interface Contract {
  id: string;
  teamId: string;
  title: string;
  type: 'service_agreement' | 'nda' | 'sow' | 'other';
  status: 'draft' | 'pending_signature' | 'signed' | 'expired';
  documentUrl: string;  // Original PDF
  signedDocumentUrl?: string;  // Signed PDF
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  metadata: {
    createdBy: string;
    description?: string;
  };
}

interface ContractSignature {
  id: string;
  contractId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signatureType: 'digital' | 'uploaded';
  signatureData?: string;  // Base64 image for digital
  signedAt: string;
  ipAddress: string;
}

interface ContractAuditLog {
  id: string;
  contractId: string;
  action: 'created' | 'viewed' | 'signed' | 'downloaded' | 'uploaded';
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

#### Backend (New tRPC Router)
```typescript
contracts.list()          // Get all contracts for team
contracts.get(id)         // Get single contract
contracts.sign(id, data)  // Sign contract digitally
contracts.upload(id, file)// Upload signed document
contracts.download(id)    // Download contract PDF
contracts.auditLog(id)    // Get audit trail
```

#### Frontend Components
```
/contracts
├── page.tsx                      # Main contracts page
└── components/
    ├── contracts-header.tsx      # Header with filters
    ├── contracts-view.tsx        # Main view with list
    ├── contract-card.tsx         # Individual contract card
    ├── contract-details.tsx      # Contract detail view
    ├── signature-pad.tsx         # Digital signature component
    ├── upload-signed.tsx         # Upload signed document
    └── audit-trail.tsx           # Audit log display
```

#### File Storage
- **Option A**: Supabase Storage (already using Supabase)
- **Option B**: Local filesystem (simpler for MVP)
- **Option C**: S3-compatible storage

### UI/UX Design
- **Card-based layout** for contract list
- **Status badges** with color coding:
  - Gray: Draft
  - Yellow: Pending Signature
  - Green: Signed
  - Red: Expired
- **PDF Viewer**: Embedded PDF viewer
- **Signature Modal**: Full-screen modal for signing
- **Two-option signing**:
  1. Draw signature digitally
  2. Upload signed PDF
- **Audit trail timeline**: Visual timeline of contract events

---

## Implementation Priority

### Phase 1: Billing (Easier - Uses Existing Integration)
1. ✅ Add menu items
2. Create billing page structure
3. Implement invoices tab (uses existing tRPC)
4. Implement subscription tab (Polar API)
5. Implement payment tab (redirect to Polar portal)

### Phase 2: Contracts (More Complex - New Feature)
1. Design database schema
2. Set up file storage
3. Create tRPC router
4. Implement contract list view
5. Implement contract details view
6. Add digital signature capability
7. Add upload signed document feature
8. Implement audit trail

---

## Recommendations

### For Billing:
- ✅ Use existing Polar.sh integration
- ✅ Leverage Polar's customer portal for payment method updates
- ✅ Use existing tRPC endpoints for invoices
- Add subscription management using Polar SDK

### For Contracts:
- **Start Simple**: Build custom solution with signature pad + upload
- **Iterate**: Add DocuSeal integration later if needed
- **Storage**: Use Supabase Storage (already integrated)
- **Security**: Add encryption for sensitive contracts
- **Legal**: Add terms acceptance and audit logging

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Billing Implementation** - I'll create all components
3. **Contracts Implementation** - I'll create all components
4. **Testing** - Test with real Polar data
5. **Documentation** - Create user guides

Would you like me to proceed with creating all the components for both sections?
