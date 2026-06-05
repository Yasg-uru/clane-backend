import type { ReactElement } from "react";
import { FaInstagram } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/config/roles.config";
import { getInitials, formatFollowers } from "@/lib/formatters";
import { UserRole, type SafeBrand, type SafeCreator, type SafeUser } from "@/types";

type ProfileIdentityHeaderProps = { user: SafeUser };

export function ProfileIdentityHeader({ user }: ProfileIdentityHeaderProps): ReactElement {
  const isBrand = user.role === UserRole.BRAND;
  const brand = isBrand ? (user as SafeBrand) : null;
  const creator = !isBrand ? (user as SafeCreator) : null;
  const avatarUrl =
    "instagramProfilePicUrl" in user ? user.instagramProfilePicUrl : undefined;

  return (
    <div className="flex items-center gap-4 pb-5">
      <div className="ring-gradient-ig rounded-full p-[2px]">
        <Avatar className="size-16">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={user.fullName} />}
          <AvatarFallback className="bg-muted text-lg font-bold">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {isBrand ? brand?.brandName : user.fullName}
          </p>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {ROLE_LABELS[user.role]}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        {creator && creator.instagramHandle && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <FaInstagram className="size-3" />
            <span className="truncate">{creator.instagramHandle}</span>
            {creator.instagramFollowers > 0 && (
              <span>· {formatFollowers(creator.instagramFollowers)} followers</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
