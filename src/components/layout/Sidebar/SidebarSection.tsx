import SidebarItem from './SidebarItem'
import SidebarCollapsedItem from './SidebarCollapsedItem'

export default function SidebarSection({ section, collapsed }: any) {
    return (
        <div>
            {!collapsed && (
                <p className="text-[11px] font-semibold uppercase text-content-tertiary px-2 mb-2">
                    {section.title}
                </p>
            )}

            <div className="flex flex-col gap-1">
                {section.items.map((item: any) =>
                    collapsed ? (
                        <SidebarCollapsedItem key={item.label} item={item} />
                    ) : (
                        <SidebarItem key={item.label} item={item} />
                    )
                )}
            </div>
        </div>
    )
}