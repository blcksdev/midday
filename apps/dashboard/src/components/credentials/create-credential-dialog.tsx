"use client";

import { useState, useEffect } from "react";
import { Button } from "@midday/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";
import { CredentialEncryption, type Credential, type CredentialType } from "./credentials-view";

interface CreateCredentialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  masterKey: CryptoKey | null;
}

export function CreateCredentialDialog({ isOpen, onClose, masterKey: providedMasterKey }: CreateCredentialDialogProps) {
  const [step, setStep] = useState<"passphrase" | "details">("passphrase");
  const [passphrase, setPassphrase] = useState("");
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [type, setType] = useState<CredentialType>("api_key");
  const [username, setUsername] = useState("");
  const [value, setValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // If masterKey is provided (vault already unlocked), skip to details step
  useEffect(() => {
    if (providedMasterKey && isOpen) {
      setMasterKey(providedMasterKey);
      setStep("details");
    } else if (!isOpen) {
      // Reset when dialog closes
      setStep("passphrase");
      setMasterKey(null);
    }
  }, [providedMasterKey, isOpen]);

  const handleUnlock = async () => {
    if (!passphrase) {
      setError("Please enter your master passphrase");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const key = await CredentialEncryption.generateKey(passphrase);
      setMasterKey(key);
      setStep("details");
      setPassphrase("");
    } catch (err) {
      setError("Failed to unlock. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!name || !service || !value || !masterKey) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Encrypt the credential value
      const { encrypted, iv } = await CredentialEncryption.encrypt(value, masterKey);

      // Create the credential object
      const credential: Credential = {
        id: crypto.randomUUID(),
        name,
        service,
        type,
        username: username || undefined,
        encryptedValue: encrypted,
        iv,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags,
      };

      // Load existing credentials and add the new one
      const existing = CredentialEncryption.loadCredentials();
      const updated = [...existing, credential];
      CredentialEncryption.saveCredentials(updated);

      // Reset form and close
      handleClose();
      
      // Reload the page to show the new credential
      window.location.reload();
    } catch (err) {
      setError("Failed to save credential. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("passphrase");
    setPassphrase("");
    setMasterKey(null);
    setName("");
    setService("");
    setType("api_key");
    setUsername("");
    setValue("");
    setTags([]);
    setTagInput("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl overflow-hidden">
        <div className="p-6">
          {step === "passphrase" ? (
            <>
              <DialogHeader>
                <DialogTitle>Unlock Vault</DialogTitle>
                <DialogDescription>
                  Enter your master passphrase to add a new credential
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-passphrase">Master Passphrase</Label>
                  <Input
                    id="create-passphrase"
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

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-md">
                  <Icons.InfoOutline size={14} />
                  <span>
                    If this is your first credential, this will be your new master passphrase.
                    Remember it carefully - it cannot be recovered!
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleUnlock} disabled={isLoading || !passphrase}>
                  {isLoading ? "Unlocking..." : "Continue"}
                </Button>
              </DialogFooter>
            </>
          ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
              <DialogDescription>
                All information will be encrypted before storage
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production API"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">
                    Service <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="service"
                    placeholder="e.g., OpenAI"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Credential Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as CredentialType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="token">Token</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username / Email (Optional)</Label>
                <Input
                  id="username"
                  placeholder="e.g., user@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Credential Value <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="password"
                  placeholder="Enter the secret value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  This will be encrypted and can only be decrypted with your master passphrase
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <Icons.Close size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <Icons.Error size={16} />
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !name || !service || !value}>
                {isLoading ? "Saving..." : "Save Credential"}
              </Button>
            </DialogFooter>
          </>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
