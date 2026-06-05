import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Lock,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Star,
  RotateCcw,
} from "lucide-react";
import { CampaignStatus } from "@/types/campaign.types";
import { BidStatus } from "@/types/bid.types";
import { EscrowStatus } from "@/types/payment.types";
import { CollabRoomStatus } from "@/types/collab.types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// ── Campaign ──────────────────────────────────────────────────────────────────

export const CAMPAIGN_STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; style: string }
> = {
  [CampaignStatus.DRAFT]: {
    label: "Draft",
    style: "bg-muted text-muted-foreground border-border",
  },
  [CampaignStatus.ACTIVE]: {
    label: "Active",
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  [CampaignStatus.CLOSED]: {
    label: "Closed",
    style: "bg-muted text-muted-foreground border-border",
  },
  [CampaignStatus.IN_PROGRESS]: {
    label: "In Progress",
    style: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  [CampaignStatus.COMPLETED]: {
    label: "Completed",
    style: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  },
};

// ── Bid ───────────────────────────────────────────────────────────────────────

export const BID_STATUS_CONFIG: Record<
  BidStatus,
  {
    label: string;
    style: string;
    variant: BadgeVariant;
    Icon: LucideIcon;
    iconClass: string;
    color: string;
  }
> = {
  [BidStatus.SUBMITTED]: {
    label: "Submitted",
    style: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    variant: "secondary",
    Icon: Clock,
    iconClass: "size-3",
    color: "text-amber-500",
  },
  [BidStatus.SHORTLISTED]: {
    label: "Shortlisted",
    style: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    variant: "default",
    Icon: Star,
    iconClass: "size-3",
    color: "text-blue-500",
  },
  [BidStatus.ACCEPTED]: {
    label: "Accepted",
    style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    variant: "default",
    Icon: CheckCircle2,
    iconClass: "size-3",
    color: "text-emerald-500",
  },
  [BidStatus.DECLINED]: {
    label: "Declined",
    style: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    variant: "destructive",
    Icon: XCircle,
    iconClass: "size-3",
    color: "text-destructive",
  },
  [BidStatus.WITHDRAWN]: {
    label: "Withdrawn",
    style: "bg-muted text-muted-foreground border-border",
    variant: "outline",
    Icon: RotateCcw,
    iconClass: "size-3",
    color: "text-muted-foreground",
  },
};

export const ACTIVE_BID_STATUSES: BidStatus[] = [
  BidStatus.SUBMITTED,
  BidStatus.SHORTLISTED,
  BidStatus.ACCEPTED,
];

export const CLOSED_BID_STATUSES: BidStatus[] = [
  BidStatus.DECLINED,
  BidStatus.WITHDRAWN,
];

// ── Escrow (brand view) ───────────────────────────────────────────────────────

export const BRAND_ESCROW_STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; variant: BadgeVariant; Icon: LucideIcon; iconClass: string }
> = {
  [EscrowStatus.AWAITING_PAYMENT]: {
    label: "Awaiting Payment",
    variant: "secondary",
    Icon: Clock,
    iconClass: "size-3",
  },
  [EscrowStatus.FUNDED]: {
    label: "Funded",
    variant: "default",
    Icon: CheckCircle2,
    iconClass: "size-3",
  },
  [EscrowStatus.RELEASED]: {
    label: "Released",
    variant: "default",
    Icon: CheckCircle2,
    iconClass: "size-3",
  },
  [EscrowStatus.REFUNDED]: {
    label: "Refunded",
    variant: "outline",
    Icon: RefreshCw,
    iconClass: "size-3",
  },
  [EscrowStatus.CANCELLED]: {
    label: "Cancelled",
    variant: "secondary",
    Icon: XCircle,
    iconClass: "size-3",
  },
  [EscrowStatus.DISPUTED]: {
    label: "Disputed",
    variant: "destructive",
    Icon: AlertCircle,
    iconClass: "size-3",
  },
};

// ── Escrow (creator view) ─────────────────────────────────────────────────────

export const CREATOR_ESCROW_STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; variant: BadgeVariant; Icon: LucideIcon; iconClass: string }
> = {
  [EscrowStatus.AWAITING_PAYMENT]: {
    label: "Awaiting Brand Payment",
    variant: "secondary",
    Icon: Clock,
    iconClass: "size-3",
  },
  [EscrowStatus.FUNDED]: {
    label: "In Escrow",
    variant: "default",
    Icon: Lock,
    iconClass: "size-3",
  },
  [EscrowStatus.RELEASED]: {
    label: "Paid Out",
    variant: "default",
    Icon: CheckCircle2,
    iconClass: "size-3",
  },
  [EscrowStatus.REFUNDED]: {
    label: "Refunded to Brand",
    variant: "outline",
    Icon: ArrowUpRight,
    iconClass: "size-3",
  },
  [EscrowStatus.CANCELLED]: {
    label: "Cancelled",
    variant: "secondary",
    Icon: ArrowUpRight,
    iconClass: "size-3",
  },
  [EscrowStatus.DISPUTED]: {
    label: "Disputed",
    variant: "destructive",
    Icon: ArrowUpRight,
    iconClass: "size-3",
  },
};

// ── Collab ────────────────────────────────────────────────────────────────────

export const COLLAB_STATUS_CONFIG: Record<
  CollabRoomStatus,
  {
    label: string;
    variant: BadgeVariant;
    Icon: LucideIcon;
    iconClass: string;
    color: string;
    description: string;
  }
> = {
  [CollabRoomStatus.PENDING_CHAT]: {
    label: "Pending Chat",
    variant: "secondary",
    Icon: Clock,
    iconClass: "size-3.5",
    color: "text-amber-500",
    description: "Waiting for the brand to initiate the collaboration.",
  },
  [CollabRoomStatus.ACTIVE]: {
    label: "Active",
    variant: "default",
    Icon: CheckCircle2,
    iconClass: "size-3.5",
    color: "text-emerald-500",
    description: "Your collab is active! Start creating content.",
  },
  [CollabRoomStatus.CONTENT_SUBMITTED]: {
    label: "Content Submitted",
    variant: "outline",
    Icon: FileText,
    iconClass: "size-3.5",
    color: "text-blue-500",
    description: "Content submitted and awaiting brand review.",
  },
  [CollabRoomStatus.UNDER_REVIEW]: {
    label: "Under Review",
    variant: "outline",
    Icon: Eye,
    iconClass: "size-3.5",
    color: "text-violet-500",
    description: "Brand is reviewing your submission.",
  },
  [CollabRoomStatus.REVISION_REQUESTED]: {
    label: "Revision Requested",
    variant: "outline",
    Icon: RefreshCw,
    iconClass: "size-3.5",
    color: "text-orange-500",
    description: "Brand requested changes. Please revise and resubmit.",
  },
  [CollabRoomStatus.APPROVED]: {
    label: "Approved",
    variant: "default",
    Icon: CheckCircle2,
    iconClass: "size-3.5",
    color: "text-emerald-500",
    description: "Your content was approved. Payment release is pending.",
  },
  [CollabRoomStatus.COMPLETED]: {
    label: "Completed",
    variant: "secondary",
    Icon: CheckCircle2,
    iconClass: "size-3.5",
    color: "text-muted-foreground",
    description: "Collaboration completed and payment released.",
  },
  [CollabRoomStatus.DISPUTED]: {
    label: "Disputed",
    variant: "destructive",
    Icon: AlertCircle,
    iconClass: "size-3.5",
    color: "text-destructive",
    description: "This collab is under dispute. Contact support.",
  },
};

export const ACTIVE_COLLAB_STATUSES: CollabRoomStatus[] = [
  CollabRoomStatus.PENDING_CHAT,
  CollabRoomStatus.ACTIVE,
  CollabRoomStatus.CONTENT_SUBMITTED,
  CollabRoomStatus.UNDER_REVIEW,
  CollabRoomStatus.REVISION_REQUESTED,
  CollabRoomStatus.APPROVED,
];

export const COMPLETED_COLLAB_STATUSES: CollabRoomStatus[] = [
  CollabRoomStatus.COMPLETED,
  CollabRoomStatus.DISPUTED,
];
