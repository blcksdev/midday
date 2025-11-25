"use client";

import { useState, useEffect } from "react";
import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { cn } from "@midday/ui/cn";

// Types for credentials
export type CredentialType = "api_key" | "password" | "token" | "oauth" | "other";

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  service: string;
  username?: string;
  encryptedValue: string;
  iv: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Encryption utilities using Web Crypto API
class CredentialEncryption {
  private static STORAGE_KEY = "credentials_vault";
  private static MASTER_KEY_STORAGE = "master_key_hash";

  // Generate a master key from user's passphrase
  static async generateKey(passphrase: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("midday-credentials-salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt a credential value
  static async encrypt(
    value: string,
    key: CryptoKey
  ): Promise<{ encrypted: string; iv: string }> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(value)
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  }

  // Decrypt a credential value
  static async decrypt(
    encryptedValue: string,
    iv: string,
    key: CryptoKey
  ): Promise<string> {
    const encrypted = Uint8Array.from(atob(encryptedValue), (c) =>
      c.charCodeAt(0)
    );
    const ivArray = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Store credentials in localStorage
  static saveCredentials(credentials: Credential[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
  }

  // Load credentials from localStorage
  static loadCredentials(): Credential[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Hash passphrase for verification (not stored, just for comparison)
  static async hashPassphrase(passphrase: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(passphrase);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }
}

interface CredentialsViewProps {
  isUnlocked: boolean;
  masterKey: CryptoKey | null;
  onUnlock: (key: CryptoKey) => void;
  onLock: () => void;
}

export function CredentialsView({ isUnlocked, masterKey, onUnlock, onLock }: CredentialsViewProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = CredentialEncryption.loadCredentials();
    setCredentials(stored);
  }, []);

  const handleUnlock = async () => {
    if (!passphrase) {
      setError("Please enter your master passphrase");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const key = await CredentialEncryption.generateKey(passphrase);
      onUnlock(key);
      setPassphrase("");
    } catch (err) {
      setError("Failed to unlock vault. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLock = () => {
    onLock();
    setPassphrase("");
    setRevealedValue(null);
    setSelectedCredential(null);
  };

  const handleReveal = async (credential: Credential) => {
    if (!masterKey) return;

    try {
      const decrypted = await CredentialEncryption.decrypt(
        credential.encryptedValue,
        credential.iv,
        masterKey
      );
      setRevealedValue(decrypted);
      setSelectedCredential(credential);
    } catch (err) {
      setError("Failed to decrypt credential");
    }
  };

  const handleCopy = async (credential: Credential) => {
    if (!masterKey) return;

    try {
      const decrypted = await CredentialEncryption.decrypt(
        credential.encryptedValue,
        credential.iv,
        masterKey
      );
      await navigator.clipboard.writeText(decrypted);
      setCopiedId(credential.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError("Failed to copy credential");
    }
  };

  const handleDelete = (id: string) => {
    const updated = credentials.filter((c) => c.id !== id);
    setCredentials(updated);
    CredentialEncryption.saveCredentials(updated);
    setSelectedCredential(null);
    setRevealedValue(null);
  };

  const filteredCredentials = credentials.filter(
    (cred) =>
      cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type: CredentialType) => {
    switch (type) {
      case "api_key":
        return <Icons.Vault size={16} />;
      case "password":
        return <Icons.Vault size={16} />;
      case "token":
        return <Icons.Vault size={16} />;
      case "oauth":
        return <Icons.Link size={16} />;
      default:
        return <Icons.Vault size={16} />;
    }
  };

  const getTypeBadgeColor = (type: CredentialType) => {
    switch (type) {
      case "api_key":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "password":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "token":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "oauth":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icons.Vault size={32} className="text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Unlock Credentials Vault</h2>
              <p className="text-sm text-muted-foreground">
                Enter your master passphrase to access your encrypted credentials
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passphrase">Master Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  placeholder="Enter your master passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnlock();
                    }
                  }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <Icons.Error size={16} />
                  {error}
                </div>
              )}

              <Button
                onClick={handleUnlock}
                disabled={isLoading || !passphrase}
                className="w-full"
              >
                {isLoading ? "Unlocking..." : "Unlock Vault"}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  <Icons.InfoOutline size={14} className="inline mr-1" />
                  Your credentials are encrypted client-side. The admin cannot see your actual credentials.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Vault Unlocked
          </Badge>
          <span className="text-sm text-muted-foreground">
            {credentials.length} credential{credentials.length !== 1 ? "s" : ""} stored
          </span>
        </div>
        <Button variant="outline" onClick={handleLock} className="gap-2">
          <Icons.Vault size={16} />
          Lock Vault
        </Button>
      </div>

      {credentials.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Icons.Vault size={32} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No credentials yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Start by adding your first credential. All data is encrypted client-side for maximum security.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCredentials.map((credential) => (
            <Card
              key={credential.id}
              className={cn(
                "p-6 hover:shadow-md transition-shadow cursor-pointer",
                selectedCredential?.id === credential.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedCredential(credential)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(credential.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{credential.name}</h3>
                      <p className="text-sm text-muted-foreground">{credential.service}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("text-xs", getTypeBadgeColor(credential.type))}>
                    {credential.type.replace("_", " ")}
                  </Badge>
                  {credential.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {credential.username && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Username: </span>
                    <span className="font-mono">{credential.username}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(credential);
                    }}
                    className="flex-1 gap-2"
                  >
                    {copiedId === credential.id ? (
                      <>
                        <Icons.Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Icons.Copy size={14} />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReveal(credential);
                    }}
                    className="flex-1 gap-2"
                  >
                    <Icons.Visibility size={14} />
                    Reveal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(credential.id);
                    }}
                    className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Icons.Delete size={14} />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated {new Date(credential.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reveal Dialog */}
      <Dialog
        open={!!selectedCredential && !!revealedValue}
        onOpenChange={(open) => {
          if (!open) {
            setRevealedValue(null);
            setSelectedCredential(null);
          }
        }}
      >
        <DialogContent className="overflow-hidden">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>{selectedCredential?.name}</DialogTitle>
              <DialogDescription>
                {selectedCredential?.service}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Decrypted Value</Label>
                <div className="relative">
                  <Input
                    value={revealedValue || ""}
                    readOnly
                    className="font-mono pr-10"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      if (revealedValue) {
                        navigator.clipboard.writeText(revealedValue);
                      }
                    }}
                  >
                    <Icons.Copy size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
                <Icons.InfoOutline size={14} />
                <span>This value is temporarily decrypted. Close this dialog to re-encrypt.</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRevealedValue(null);
                  setSelectedCredential(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export the encryption class for use in other components
export { CredentialEncryption };
