# Credentials Vault

## Overview

The Credentials Vault is a secure, client-side encrypted storage system for managing sensitive credentials like API keys, passwords, and tokens. It's designed specifically for AI automation agencies to safely store customer credentials without the admin being able to see the plaintext values.

## Key Features

### 🔐 Client-Side Encryption
- All credentials are encrypted using **AES-256-GCM** encryption
- Encryption happens entirely in the browser using the Web Crypto API
- The server/admin never sees plaintext credentials

### 🔑 Master Passphrase
- Customers set their own master passphrase
- The passphrase is used to derive an encryption key using PBKDF2 with 100,000 iterations
- The passphrase is never stored - only the customer knows it

### 🛡️ Security Model
- **Customer**: Can view, copy, and manage their credentials after unlocking with their passphrase
- **Admin**: Can use credentials programmatically (copy function) but cannot see the plaintext without the customer's passphrase
- **Storage**: Encrypted credentials are stored in browser localStorage

## How It Works

### 1. Creating a Credential

```
Customer enters passphrase → Derives encryption key → Enters credential details → 
Encrypts value with AES-256-GCM → Stores encrypted data in localStorage
```

### 2. Accessing a Credential

```
Customer enters passphrase → Derives same encryption key → Selects credential → 
Decrypts value → Shows plaintext (or copies to clipboard)
```

### 3. Admin Usage

The admin can:
- See that credentials exist (name, service, type, tags)
- Copy credentials to clipboard (which decrypts temporarily)
- Use credentials in automation workflows

The admin cannot:
- See plaintext values without the customer's passphrase
- Recover a forgotten passphrase
- Decrypt credentials without the correct passphrase

## Technical Details

### Encryption Algorithm
- **Algorithm**: AES-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **IV**: Random 12-byte initialization vector per credential

### Data Structure

```typescript
interface Credential {
  id: string;                 // Unique identifier
  name: string;              // Display name (not encrypted)
  type: CredentialType;      // api_key | password | token | oauth | other
  service: string;           // Service name (not encrypted)
  username?: string;         // Optional username (not encrypted)
  encryptedValue: string;    // Base64-encoded encrypted credential
  iv: string;                // Base64-encoded initialization vector
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
  tags: string[];            // Search tags (not encrypted)
}
```

### Storage Location
- **Browser**: `localStorage` under key `credentials_vault`
- **Format**: JSON array of Credential objects
- **Persistence**: Data persists across browser sessions
- **Scope**: Per-origin (domain-specific)

## Usage Guide

### For Customers

1. **First Time Setup**
   - Navigate to Credentials section
   - Click "Add Credential"
   - Enter a strong master passphrase (you'll need this every time!)
   - Fill in credential details
   - Save

2. **Adding More Credentials**
   - Click "Add Credential"
   - Enter your master passphrase
   - Fill in details
   - Save

3. **Accessing Credentials**
   - Enter your master passphrase to unlock the vault
   - Click on any credential card
   - Use "Copy" to copy to clipboard
   - Use "Reveal" to see the plaintext value

4. **Important Notes**
   - ⚠️ **Never forget your master passphrase** - it cannot be recovered!
   - ⚠️ Use a strong, unique passphrase
   - ⚠️ Don't share your passphrase with anyone
   - 💡 Consider using a password manager to store your master passphrase

### For Admins

1. **Using Credentials in Automation**
   - Ask customer to unlock their vault
   - Use the "Copy" button to get credential values
   - Paste into your automation tools
   - The credential is decrypted temporarily for copying

2. **Best Practices**
   - Never ask customers for their master passphrase
   - Use the copy function instead of asking for plaintext
   - Respect customer privacy - you can't see their credentials

## Security Considerations

### ✅ What's Protected
- Credential values (API keys, passwords, tokens)
- Data at rest (encrypted in localStorage)
- Data in memory (only decrypted when explicitly requested)

### ⚠️ What's Not Protected
- Metadata (name, service, type, tags, username)
- The fact that credentials exist
- Protection against malicious browser extensions
- Protection if the customer's device is compromised

### 🔒 Best Practices
1. Use strong, unique master passphrases
2. Lock the vault when not in use
3. Use HTTPS (already enforced by Web Crypto API)
4. Regularly update credentials
5. Don't store the master passphrase anywhere insecure

## Limitations

1. **Browser-Only**: Credentials are stored per-browser, not synced across devices
2. **No Recovery**: Forgotten passphrases cannot be recovered
3. **localStorage**: Limited to ~5-10MB depending on browser
4. **Client-Side Only**: No server-side backup or sync

## Future Enhancements

Potential improvements:
- [ ] Export/Import encrypted credentials
- [ ] Credential sharing with team members
- [ ] Audit log of credential access
- [ ] Automatic credential rotation
- [ ] Integration with password managers
- [ ] Server-side encrypted backup (optional)
- [ ] Multi-factor authentication
- [ ] Biometric unlock (WebAuthn)

## Troubleshooting

### "Failed to unlock vault"
- Check that you're entering the correct passphrase
- Passphrases are case-sensitive
- Try clearing browser cache and re-entering credentials

### "Failed to decrypt credential"
- The credential may have been encrypted with a different passphrase
- Try re-creating the credential

### Lost Passphrase
- Unfortunately, there's no way to recover credentials without the passphrase
- You'll need to create new credentials with a new passphrase

## API Reference

### CredentialEncryption Class

```typescript
// Generate encryption key from passphrase
static async generateKey(passphrase: string): Promise<CryptoKey>

// Encrypt a value
static async encrypt(value: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }>

// Decrypt a value
static async decrypt(encryptedValue: string, iv: string, key: CryptoKey): Promise<string>

// Save credentials to localStorage
static saveCredentials(credentials: Credential[]): void

// Load credentials from localStorage
static loadCredentials(): Credential[]
```

## Support

For issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Contact your system administrator
4. Check browser console for error messages

---

**Remember**: Your master passphrase is the key to all your credentials. Keep it safe and never share it!
