import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";

const Sidebar = ({
  mainItems = [],
  orgSettingsItems = [],
  userSettingsItems = [],
  activeItem,
  onItemClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-64 bg-white h-screen fixed left-0 top-0 border-r flex flex-col",
        className
      )}
    >
      <div className="p-4 flex-1">
        <h1 className="text-xl font-bold mb-6">Nirikshan Portal</h1>

        {/* Main Navigation */}
        <nav className="space-y-2 mb-6">
          {mainItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeItem === item.id}
              onClick={onItemClick}
            />
          ))}
        </nav>

        {/* Organization Settings Section */}
        {orgSettingsItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Organization
            </h3>
            <nav className="space-y-2">
              {orgSettingsItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeItem === item.id}
                  onClick={onItemClick}
                />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* User Settings Section at Bottom */}
      {userSettingsItems.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            User
          </h3>
          <nav className="space-y-2">
            {userSettingsItems.map((item) => (
              <SidebarItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeItem === item.id}
                onClick={onItemClick}
              />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
