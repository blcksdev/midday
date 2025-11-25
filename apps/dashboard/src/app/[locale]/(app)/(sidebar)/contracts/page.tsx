"use client";

import { ContractsHeader } from "@/components/contracts/contracts-header";
import { ContractsView } from "@/components/contracts/contracts-view";
import { useState } from "react";

export default function Page() {
  const [view, setView] = useState<"list" | "details">("list");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 h-full">
      <ContractsHeader 
        view={view} 
        onBack={() => {
          setView("list");
          setSelectedContractId(null);
        }} 
      />
      <ContractsView 
        view={view} 
        setView={setView} 
        selectedContractId={selectedContractId}
        setSelectedContractId={setSelectedContractId}
      />
    </div>
  );
}
