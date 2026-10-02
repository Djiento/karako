import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const labels: Record<string, string> = {
  CAPTURED: "Capturée",
  UNDERSTANDING: "Compréhension",
  EXPLORING: "Exploration",
  RESEARCHING: "Recherche",
  VALIDATING: "Validation",
  BUILDING: "Construction",
  LAUNCHED: "Lancées",
  ARCHIVED: "Archivée",
  INBOX: "Inbox",
  PROCESSED: "Traitée",
  DISMISSED: "Ignorée",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="font-medium"
    >
      {labels[status] ?? status}
    </Badge>
  );
}