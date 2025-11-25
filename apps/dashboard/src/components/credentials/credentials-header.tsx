"use client";

import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { useState } from "react";
import { CreateCredentialDialog } from "./create-credential-dialog";
import { SearchField } from "../search-field";

interface CredentialsHeaderProps {
  isUnlocked: boolean;
  masterKey: CryptoKey | null;
}

export function CredentialsHeader({ isUnlocked, masterKey }: CredentialsHeaderProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-3xl font-medium">Credentials</h1>
        </div>

        {isUnlocked && (
          <div className="hidden sm:block">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2"
            >
              <Icons.Add size={16} />
              Add Credential
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <SearchField placeholder="Search credentials" />
      </div>

      <CreateCredentialDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        masterKey={masterKey}
      />
    </>
  );
}
