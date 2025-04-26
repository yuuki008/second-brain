import { updateNodeVisibility } from "@/app/actions/node";
import { Button } from "@/components/ui/button";
import { Node } from "@prisma/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface SwitchVisibilityProps {
  node: Node;
}

export default function SwitchVisibility({ node }: SwitchVisibilityProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSwitchVisibility() {
    setIsSubmitting(true);
    try {
      await updateNodeVisibility(
        node.id,
        node.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"
      );
    } catch (error) {
      console.error("Failed to switch visibility:", error);
    }
    setIsSubmitting(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-light px-2"
      onClick={handleSwitchVisibility}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : node.visibility === "PUBLIC" ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
      {node.visibility === "PUBLIC" ? "みんな" : "自分だけ"}
    </Button>
  );
}
