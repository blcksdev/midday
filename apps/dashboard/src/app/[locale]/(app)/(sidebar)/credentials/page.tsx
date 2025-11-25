"use client";

import { CredentialsHeader } from "@/components/credentials/credentials-header";
import { CredentialsView } from "@/components/credentials/credentials-view";
import { useState } from "react";

export default function Page() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <CredentialsHeader isUnlocked={isUnlocked} masterKey={masterKey} />
      <CredentialsView 
        isUnlocked={isUnlocked}
        masterKey={masterKey}
        onUnlock={(key) => {
          setMasterKey(key);
          setIsUnlocked(true);
        }}
        onLock={() => {
          setMasterKey(null);
          setIsUnlocked(false);
        }}
      />
    </div>
  );
}
