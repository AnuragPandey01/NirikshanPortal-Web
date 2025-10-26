import { Button } from "./button";
import { cn } from "@/lib/utils";

const SidebarItem = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
  className,
}) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn("w-full justify-start gap-2", className)}
      onClick={() => onClick(id)}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Button>
  );
};

export default SidebarItem;
