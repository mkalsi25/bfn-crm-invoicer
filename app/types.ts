export type CfContext = {
  env: Env;
  ctx: ExecutionContext;
};

export type CloudflareContent = {
  cloudflare: CfContext;
};

export type InvoiceData = {
  amountPaid: number;
  amountToPay: number;
  from: string;
  to: string;
  date: string;
  month: string;
};

export type LoaderFnProps = {
  date: {
    from: Date;
    to: Date;
  };
  token: string;
};

export type CardProps = {
  title: string;
  value: Promise<number> | undefined;
  description: string;
  href?: string;
  format?: {
    locales?: Intl.LocalesArgument;
    options?: Intl.NumberFormatOptions;
  };
};

export interface UCRMService {
  id: number;
  prepaid: boolean;
  clientId: number;
  status: number;
  name: string;
  fullAddress: string;
  street1: string;
  street2: string;
  city: string;
  countryId: number;
  stateId: number | null;
  zipCode: string;
  note: string | null;
  addressGpsLat: number | null;
  addressGpsLon: number | null;
  servicePlanId: number;
  servicePlanPeriodId: number;
  price: number;
  hasIndividualPrice: boolean;
  totalPrice: number;
  currencyCode: string;
  invoiceLabel: string | null;
  contractId: number | null;
  contractLengthType: number;
  minimumContractLengthMonths: number;
  activeFrom: string;
  activeTo: string | null;
  contractEndDate: string | null;
  discountType: number;
  discountValue: number | null;
  discountInvoiceLabel: string;
  discountFrom: string | null;
  discountTo: string | null;
  tax1Id: number | null;
  tax2Id: number | null;
  tax3Id: number | null;
  invoicingStart: string;
  invoicingPeriodType: number;
  invoicingPeriodStartDay: number;
  nextInvoicingDayAdjustment: number;
  invoicingProratedSeparately: boolean;
  invoicingSeparately: boolean;
  sendEmailsAutomatically: boolean | null;
  useCreditAutomatically: boolean;
  servicePlanName: string;
  servicePlanPrice: number;
  servicePlanPeriod: number;
  servicePlanType: string;
  downloadSpeed: number;
  uploadSpeed: number;
  hasOutage: boolean;
  unmsClientSiteStatus: string | null;
  fccBlockId: number | null;
  lastInvoicedDate: string | null;
  unmsClientSiteId: string;
  attributes: any;
  addressData: any | null;
  suspensionReasonId: number | null;
  serviceChangeRequestId: number | null;
  setupFeePrice: number | null;
  earlyTerminationFeePrice: number;
  downloadSpeedOverride: number | null;
  uploadSpeedOverride: number | null;
  trafficShapingOverrideEnd: string | null;
  trafficShapingOverrideEnabled: boolean;
  servicePlanGroupId: string;
  suspensionPeriods: any[];
  surcharges: any[];
}

export interface UCRMContactType {
  id: number;
  name: string;
}

export interface UCRMContact {
  id: number;
  clientId: number;
  email: string;
  phone: string;
  name: string;
  isBilling: boolean;
  isContact: boolean;
  types: UCRMContactType[];
}

export interface UCRMAttribute {
  id: number;
  clientId: number;
  name: string;
  key: string;
  clientZoneVisible: boolean;
  value: string;
  customAttributeId: number;
}

export interface UCRMBankAccount {
  id: number;
  accountNumber: string;
}

export interface UCRMTag {
  id: number;
  name: string;
  colorBackground: string;
  colorText: string;
}

export interface UCRMClient {
  id: number;
  userIdent: string;
  previousIsp: string;
  isLead: boolean;
  clientType: number;
  companyName: string;
  companyRegistrationNumber: string;
  companyTaxId: string;
  companyWebsite: string;
  companyContactFirstName: string;
  companyContactLastName: string;
  firstName: string;
  lastName: string;
  street1: string;
  street2: string;
  city: string;
  countryId: number;
  stateId: number;
  zipCode: string;
  fullAddress: string;
  invoiceStreet1: string;
  invoiceStreet2: string;
  invoiceCity: string;
  invoiceStateId: number;
  invoiceCountryId: number;
  invoiceZipCode: string;
  invoiceAddressSameAsContact: boolean;
  note: string;
  sendInvoiceByPost: boolean;
  invoiceMaturityDays: number;
  stopServiceDue: boolean;
  stopServiceDueDays: number;
  organizationId: number;
  tax1Id: number;
  tax2Id: number;
  tax3Id: number;
  registrationDate: string;
  username: string;
  avatarColor: string;
  addressGpsLat: number;
  addressGpsLon: number;
  generateProformaInvoices: boolean;
  referral: string;
  isActive: boolean;
  contacts: UCRMContact[];
  attributes: UCRMAttribute[];
  accountBalance: number;
  accountCredit: number;
  accountOutstanding: number;
  currencyCode: string;
  organizationName: string;
  bankAccounts: UCRMBankAccount[];
  tags: UCRMTag[];
  invitationEmailSentDate: string;
  isArchived: boolean;
  usesProforma: boolean;
  hasOverdueInvoice: boolean;
  hasOutage: boolean;
  hasSuspendedService: boolean;
  hasServiceWithoutDevices: boolean;
  leadConvertedAt: string;
  hasPaymentSubscription: boolean;
  hasAutopayCreditCard: boolean;
}

export interface UCRMServicePlan {
  id: number;
  servicePlanType: string;
  name: string;
  invoiceLabel: any;
  downloadBurst: any;
  uploadBurst: any;
  downloadSpeed: number;
  uploadSpeed: number;
  aggregation: any;
  dataUsageLimit: any;
  organizationId: number;
  taxable: boolean;
  taxId: number;
  amountExemptFromTaxation: any;
  setupFee: any;
  earlyTerminationFee: number;
  minimumContractLengthMonths: number;
  periods: UCRMPeriod[];
  public: boolean;
  prepaid: boolean;
  prepaidConfiguration: UCRMPrepaidConfiguration;
  servicePlanGroups: UCRMServicePlanGroup[];
  defaultServicePlanGroupId: string;
  uploadSpeedLimited: any;
  downloadSpeedLimited: any;
  archived: boolean;
}

export interface UCRMPeriod {
  id: number;
  price?: number;
  period: number;
  enabled: boolean;
}

export interface UCRMPrepaidConfiguration {
  pricePerDay: any;
}

export interface UCRMServicePlanGroup {
  id: string;
  name: string;
}

export interface UCRMInvoice {
  id: number;
  clientId: number;
  number: string;
  createdDate: string;
  emailSentDate: string;
  maturityDays: number;
  notes: string;
  discount: number;
  discountLabel: string;
  adminNotes: string;
  invoiceTemplateId: number;
  proformaInvoiceTemplateId: number;
  organizationName: string;
  organizationRegistrationNumber: string;
  organizationTaxId: string;
  organizationStreet1: string;
  organizationStreet2: string;
  organizationCity: string;
  organizationCountryId: number;
  organizationStateId: number;
  organizationZipCode: string;
  organizationBankAccountName: string;
  organizationBankAccountField1: string;
  organizationBankAccountField2: string;
  clientFirstName: string;
  clientLastName: string;
  clientCompanyName: string;
  clientCompanyRegistrationNumber: string;
  clientCompanyTaxId: string;
  clientStreet1: string;
  clientStreet2: string;
  clientCity: string;
  clientCountryId: number;
  clientStateId: number;
  clientZipCode: string;
  proforma: boolean;
  dueDate: string;
  taxableSupplyDate: string;
  items: Item[];
  subtotal: number;
  taxes: Tax[];
  total: number;
  amountPaid: number;
  amountToPay: number;
  totalUntaxed: number;
  totalDiscount: number;
  totalTaxAmount: number;
  currencyCode: string;
  status: number;
  paymentCovers: PaymentCover[];
  uncollectible: boolean;
  proformaInvoiceId: number;
  generatedInvoiceId: number;
  attributes: Attribute[];
  appliedVatReverseCharge: boolean;
}

export interface Item {
  id: number;
  serviceId: number;
  serviceSurchargeId: number;
  productId: number;
  total: number;
  type: string;
  discountPrice: number;
  discountQuantity: any;
  discountTotal: any;
  label: string;
  price: number;
  quantity: number;
  unit: string;
  tax1Id: number;
  tax2Id: number;
  tax3Id: number;
}

export interface Tax {
  name: string;
  totalValue: number;
}

export interface PaymentCover {
  id: number;
  paymentId: number;
  creditNoteId: number;
  invoiceId: number;
  refundId: number;
  amount: number;
}

export interface Attribute {
  id: number;
  invoiceId: number;
  name: string;
  key: string;
  clientZoneVisible: boolean;
  value: string;
  customAttributeId: number;
}
