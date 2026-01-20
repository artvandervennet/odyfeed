# Security Policy

## Supported Versions

We release patches for security vulnerabilities. The following versions are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The OdyFeed team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by email to the project maintainers. Include as much information as possible to help us understand the nature and scope of the issue.

### What to Include in Your Report

To help us better understand and resolve the issue, please include the following information:

- **Type of vulnerability** (e.g., XSS, CSRF, injection, authentication bypass)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it
- **Any potential mitigations** you've identified

### What to Expect

After you submit a report, you can expect:

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Assessment**: We will assess the vulnerability and determine its severity
3. **Updates**: We will keep you informed about our progress
4. **Resolution**: We will work to fix confirmed vulnerabilities as quickly as possible
5. **Disclosure**: We will coordinate with you on the disclosure timeline

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity and complexity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

## Security Best Practices

When using OdyFeed, we recommend following these security best practices:

### For Users

- **Keep dependencies updated**: Regularly update to the latest version
- **Use HTTPS**: Always access OdyFeed over HTTPS
- **Secure your Solid Pod**: Follow Solid Pod security best practices
- **Strong authentication**: Use strong passwords and enable two-factor authentication where available
- **Review permissions**: Carefully review app permissions before granting access

### For Developers

- **Input validation**: Always validate and sanitize user input
- **Output encoding**: Properly encode output to prevent XSS
- **Authentication**: Use secure authentication mechanisms
- **Authorization**: Implement proper access controls
- **Dependencies**: Keep dependencies up to date and scan for vulnerabilities
- **Secrets management**: Never commit secrets or credentials to the repository
- **HTTPS only**: Use HTTPS for all external communications
- **HTTP signatures**: Verify HTTP signatures for ActivityPub federation
- **Content Security Policy**: Implement appropriate CSP headers

## Known Security Considerations

### ActivityPub Federation

- HTTP signature verification is required for all incoming ActivityPub activities
- Actor dereferencing may expose your server to SSRF attacks if not properly validated
- Carefully validate all external URLs before fetching

### Solid Pod Integration

- WebID authentication must be properly validated
- Access control lists (ACL) must be respected
- Never expose private pod data without proper authorization

### Authentication

- OIDC authentication flow must use secure state parameters
- Session cookies must have appropriate security flags (httpOnly, secure, sameSite)
- Token validation must be performed on every request

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be announced through:

- GitHub Security Advisories
- Release notes
- Project README

## Bug Bounty Program

We currently do not have a bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities to us.

## Scope

The following are **in scope** for security reports:

- Authentication and authorization issues
- XSS, CSRF, and injection vulnerabilities
- Information disclosure
- Security misconfigurations
- Cryptographic vulnerabilities
- ActivityPub federation security issues
- Solid Pod integration security issues

The following are **out of scope**:

- Denial of Service (DoS) attacks
- Social engineering attacks
- Physical attacks
- Issues in third-party dependencies (report to upstream)
- Issues requiring physical access to a user's device

## Attribution

We believe in giving credit where credit is due. With your permission, we will:

- Acknowledge your contribution in the security advisory
- Add you to our security hall of fame (if you wish)
- Publicly thank you after the issue is resolved

## Legal

- We will not take legal action against you if you:
  - Make a good faith effort to avoid privacy violations and service disruptions
  - Only interact with accounts you own or have explicit permission to access
  - Do not exploit a security issue beyond what is necessary to demonstrate it
  - Comply with this policy

## Questions

If you have questions about this security policy, please contact the project maintainers.

---

Last updated: January 20, 2026
