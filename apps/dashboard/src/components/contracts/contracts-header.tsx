"use client";

import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { SearchField } from "@/components/search-field";

interface ContractsHeaderProps {
  view: "list" | "details";
  onBack: () => void;
}

export function ContractsHeader({ view, onBack }: ContractsHeaderProps) {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view === "details" && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <Icons.ArrowBack />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-medium">
              {view === "details" ? "Contract Details" : "Contracts"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {view === "details" 
                ? "View and sign your contract" 
                : "Manage and sign your legal documents"}
            </p>
          </div>
        </div>

        {view === "list" && (
          <div className="flex items-center gap-2">
            <Button className="gap-2">
              <Icons.Add size={16} />
              New Contract
            </Button>
          </div>
        )}
      </div>

      {view === "list" && (
        <div className="flex items-center justify-between">
          <SearchField placeholder="Search contracts..." />
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Icons.Filter size={16} />
              Filter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
