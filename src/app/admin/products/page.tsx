import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { AdminGuard } from "@/components/shared/admin-guard";

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <AdminProductsManager />
    </AdminGuard>
  );
}
