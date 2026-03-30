import { AccountOverview } from "@/components/account/account-overview";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountOverview />
    </AuthGuard>
  );
}
