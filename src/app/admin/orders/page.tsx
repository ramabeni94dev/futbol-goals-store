import { AdminOrdersManager } from "@/components/admin/admin-orders-manager";
import { AdminGuard } from "@/components/shared/admin-guard";

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <AdminOrdersManager />
    </AdminGuard>
  );
}
