import { cn } from "@/lib/utils";
import { Button } from "./button";

const Sidebar = ({ items, activeItem, onItemClick, className }) => {
  return (
    <div className={cn("w-64 bg-white h-screen fixed left-0 top-0 border-r", className)}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">Nirikshan Portal</h1>
        <nav className="space-y-2">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => onItemClick(item.id)}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;