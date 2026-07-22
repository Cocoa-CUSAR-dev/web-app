import DashboardLayout from "@/modules/dashboard/DashboardLayout";
import DashboardMapModule from "@/modules/dashboard/route-map/DashboardMapModule";

function DashboardMap() {
  return (
    <DashboardLayout>
      <DashboardMapModule />
    </DashboardLayout>
  );
}

export default DashboardMap;
