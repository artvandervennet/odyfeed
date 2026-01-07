# GitHub Secrets Setup Guide

## Overview
GitHub Secrets are encrypted environment variables used in CI/CD workflows. They're securely stored and only exposed to workflows that need them.

## Adding Secrets to Your Repository

### Steps:
1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. In the left sidebar, go to **Secrets and variables** > **Actions**
4. Click **New repository secret**
5. Add each secret with the name and value
6. Click **Add secret**

## Required Secrets for This Deployment

You need to configure these three secrets:

### 1. `SSH_PRIVATE_KEY`
Your private SSH key for authentication to the Plesk server.

**How to obtain:**
- Use an existing SSH key or generate a new one: `ssh-keygen -t ed25519 -f plesk-deploy`
- Copy the **private key** content (the file without `.pub`)
- Add it as a secret value (keep it on one line or preserve newlines)

**Note:** Make sure the corresponding public key is authorized on your Plesk server.

### 2. `SSH_USERNAME`
Your SSH username for the Plesk server (e.g., `deploy`, `admin`, etc.)

**Example value:**
```
deploy-user
```

### 3. `PLESK_DIRECTORY`
The absolute path on the Plesk server where you want to deploy the files.

**Example value:**
```
/home/username/public_html
```

## How Secrets Work in Workflows

### Referencing Secrets
In the workflow file, reference secrets using the syntax:
```yaml
${{ secrets.SECRET_NAME }}
```

### Security Features
- Secrets are encrypted using AES-256
- Only exposed to workflow runs that have access
- Cannot be accessed by pull requests from forks (by default)
- Logs never display secret values - they're automatically masked

### Example Usage in Workflow
```yaml
- name: Deploy
  run: |
    ssh -i ~/.ssh/id_rsa ${{ secrets.SSH_USERNAME }}@example.com
```

When the workflow runs, `${{ secrets.SSH_USERNAME }}` is replaced with the actual value, but it won't appear in logs.

## Best Practices

1. **Use separate keys for different purposes** - Create a dedicated deploy key instead of using a personal SSH key
2. **Limit key permissions** - If possible, restrict what the deploy key can do on the server
3. **Rotate keys periodically** - Change keys every 6-12 months or after team changes
4. **Never commit secrets** - They should never be in version control
5. **Organize secret names** - Use clear, descriptive names (e.g., `DEPLOY_SSH_PRIVATE_KEY` instead of `KEY`)

## Testing the Deployment

### Manual Trigger (Optional)
To enable manual deployment runs, add this to your workflow:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # Add this to allow manual trigger
```

Then go to **Actions** tab > select workflow > **Run workflow**

### Checking Logs
1. Go to **Actions** tab in your repository
2. Click on a workflow run
3. Expand the job to see logs
4. Secret values will show as `***` (masked)

## Troubleshooting

### SSH Connection Failed
- Verify SSH credentials are correct
- Check if your public key is authorized on the Plesk server
- Ensure the server's firewall allows SSH connections

### Permission Denied Errors
- Check file/directory permissions on the Plesk server
- Ensure the SSH user has write permissions to `PLESK_DIRECTORY`

### Build Fails
- Check Node.js and pnpm versions match your local environment
- Review build logs in the Actions tab
- Ensure all required environment variables are set (e.g., `OPENAI_API_KEY`)

## Environment Variables vs Secrets

**Environment Variables** (in repo or workflow):
- Visible in logs
- Good for non-sensitive config

**Secrets** (in GitHub settings):
- Encrypted and masked
- Good for API keys, tokens, credentials
- Only exposed when explicitly referenced

## Example: Adding API Keys

If your app needs environment variables like `OPENAI_API_KEY`, you can:

1. Create a secret: `OPENAI_API_KEY`
2. Reference it in your workflow:
```yaml
- name: Build project
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: pnpm build
```

This passes the secret value to the build process safely.

