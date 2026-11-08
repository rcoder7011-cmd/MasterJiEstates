import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      default: '',
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'property_approved',
        'property_rejected',
        'property_changes_requested',
        'property_status_changed',
        'property_updated',
        'company_property_created',
        'company_property_updated',
        'user_status_changed',
        'enquiry_status_updated',
        'site_visit_status_updated',
        'deal_created',
        'deal_status_updated',
        'deal_updated',
        'commission_agreement_updated',
        'commission_payment_recorded',
        'commission_payment_reversed',
        'property_expense_created',
        'property_expense_reversed',
        'company_sale_recorded',
        'business_expense_created',
        'business_expense_reversed',
        'financial_report_exported',
        'content_updated',
        'contact_message_updated',
      ],
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: [
        'property',
        'user',
        'enquiry',
        'site_visit',
        'deal',
        'commission_payment',
        'property_expense',
        'company_sale',
        'business_expense',
        'financial_report',
        'site_content',
        'contact_message',
      ],
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetTitle: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // creates createdAt, updatedAt
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

