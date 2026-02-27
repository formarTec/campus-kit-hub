import { ReactNode } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
}

export default function PageHeader({
  title,
  description,
  icon,
  onAdd,
  addLabel = "Adicionar",
  searchValue,
  onSearch,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
      {onSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 bg-card/60"
          />
        </div>
      )}
    </div>
  );
}
