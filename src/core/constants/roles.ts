import type { UserRole } from "@/core/types";

// How each role is named in the UI, in the order roles are listed.
const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  researcher: "Researcher",
  farmer: "Farmer",
  hub_collector: "Hub collector",
  processor: "Processor",
};

export { roleLabels };
