# Credentials Vault - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Navigate to Credentials
1. Open your dashboard at `localhost:3001`
2. Look for **"Credentials"** in the left sidebar menu (between Customers and Vault)
3. Click on it

### Step 2: Create Your First Credential

#### A. Unlock the Vault
- You'll see an unlock screen
- Enter a **master passphrase** (this is NEW - you're creating it now!)
- ⚠️ **IMPORTANT**: Remember this passphrase - it cannot be recovered!
- Click "Unlock Vault"

#### B. Add Credential Details
- **Name**: Give it a friendly name (e.g., "OpenAI Production API")
- **Service**: The service name (e.g., "OpenAI")
- **Type**: Choose from API Key, Password, Token, OAuth, or Other
- **Username** (optional): Email or username if applicable
- **Credential Value**: The actual API key, password, or token
- **Tags** (optional): Add tags like "production", "ai", etc.
- Click "Save Credential"

### Step 3: Use Your Credentials

#### To Copy a Credential:
1. Make sure vault is unlocked
2. Find your credential card
3. Click the **"Copy"** button
4. The value is copied to your clipboard (decrypted temporarily)
5. Paste it wherever you need it

#### To View a Credential:
1. Click the **"Reveal"** button
2. A dialog shows the decrypted value
3. You can copy it from there
4. Close the dialog to re-encrypt

#### To Lock the Vault:
- Click **"Lock Vault"** button in the top right
- This clears the encryption key from memory
- You'll need to enter your passphrase again to access

## 💡 Pro Tips

### For Customers:
1. **Use a strong passphrase**: At least 12 characters with mixed case, numbers, and symbols
2. **Write it down safely**: Store your master passphrase in a secure location
3. **Lock when done**: Always lock the vault when you're finished
4. **Use tags**: Organize credentials with tags like "production", "staging", "personal"

### For Admins:
1. **Never ask for passphrases**: You don't need them!
2. **Use the Copy button**: This lets you use credentials without seeing them
3. **Respect privacy**: The system is designed so you CAN'T see plaintext
4. **Guide customers**: Help them set up strong passphrases

## 🎯 Common Use Cases

### Use Case 1: Store API Keys
```
Name: OpenAI Production
Service: OpenAI
Type: API Key
Value: sk-proj-xxxxxxxxxxxxx
Tags: production, ai
```

### Use Case 2: Store Database Credentials
```
Name: Production Database
Service: PostgreSQL
Type: Password
Username: admin@company.com
Value: SuperSecurePassword123!
Tags: production, database
```

### Use Case 3: Store OAuth Tokens
```
Name: Google OAuth
Service: Google Cloud
Type: OAuth
Value: ya29.xxxxxxxxxxxxx
Tags: oauth, google, production
```

## 🔐 Security Checklist

- ✅ Use HTTPS (required for Web Crypto API)
- ✅ Use a unique master passphrase (not used elsewhere)
- ✅ Don't share your master passphrase
- ✅ Lock vault when not in use
- ✅ Use strong passphrases (12+ characters)
- ✅ Keep a secure backup of your master passphrase
- ✅ Regularly update old credentials

## ❓ FAQ

### Q: What if I forget my master passphrase?
**A**: Unfortunately, there's no recovery option. You'll need to create new credentials with a new passphrase.

### Q: Can the admin see my credentials?
**A**: No! The admin can copy them (which temporarily decrypts) but cannot view the plaintext in the UI without your passphrase.

### Q: Are my credentials synced across devices?
**A**: No, they're stored locally in your browser. You'll need to add them separately on each device.

### Q: How secure is this?
**A**: Very secure! It uses AES-256-GCM encryption (same as banks) with PBKDF2 key derivation (100,000 iterations).

### Q: Can I export my credentials?
**A**: Not yet, but this feature could be added in the future.

### Q: What happens if I clear my browser data?
**A**: Your credentials will be deleted. Make sure to back them up elsewhere if needed.

## 🆘 Troubleshooting

### Problem: "Failed to unlock vault"
- **Solution**: Check your passphrase is correct (case-sensitive)
- Try clearing browser cache and re-entering

### Problem: Can't see the Credentials menu
- **Solution**: Refresh the page
- Check you're logged in
- Verify the menu item was added correctly

### Problem: Credentials not saving
- **Solution**: Check browser localStorage is enabled
- Try a different browser
- Check browser console for errors

## 📞 Need Help?

1. Check the full documentation: `/components/credentials/README.md`
2. Review the implementation guide: `CREDENTIALS_IMPLEMENTATION.md`
3. Check browser console for error messages
4. Contact your system administrator

## 🎉 You're All Set!

You now have a secure, encrypted credentials vault that:
- Protects your sensitive data
- Gives you full control
- Allows admin usage without compromising privacy
- Is easy to use

**Start adding your credentials now!**

---

**Remember**: Your master passphrase is the key to everything. Keep it safe! 🔐
