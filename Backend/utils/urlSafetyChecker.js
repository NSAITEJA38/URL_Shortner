// Helper to check if an IP address falls into private/reserved/loopback blocks
const isPrivateOrReservedIP = (ip) => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [p0, p1] = parts;

  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;

  // 10.0.0.0/8 (Private)
  if (p0 === 10) return true;

  // 172.16.0.0/12 (Private)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (p0 === 192 && p1 === 168) return true;

  // 169.254.0.0/16 (Link-local & Cloud Metadata e.g. 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;

  // 0.0.0.0/8
  if (p0 === 0) return true;

  // 100.64.0.0/10 (Carrier grade NAT)
  if (p0 === 100 && p1 >= 64 && p1 <= 127) return true;

  return false;
};

// Restricted non-web ports often targeted in SSRF/exploitation
const RESTRICTED_PORTS = new Set([
  21, 22, 23, 25, 53, 69, 110, 135, 137, 138, 139, 143, 445,
  1433, 1521, 3306, 3389, 5432, 5900, 6379, 8086, 9200, 11211, 27017
]);

// Known high-risk or commonly abused TLDs
const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".pw", ".tk", ".ml", ".ga", ".cf", ".gq", ".zip", ".mov",
  ".cam", ".click", ".link", ".stream", ".download", ".racing", ".party",
  ".bid", ".date", ".trade", ".accountant", ".loan", ".cricket", ".work",
  ".review", ".country", ".kim", ".science"
];

// Legitimate root domains for high-value targets
const LEGITIMATE_BRAND_DOMAINS = {
  paypal: "paypal.com",
  apple: "apple.com",
  microsoft: "microsoft.com",
  google: "google.com",
  amazon: "amazon.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
  netflix: "netflix.com",
  chase: "chase.com",
  wellsfargo: "wellsfargo.com",
  binance: "binance.com",
  coinbase: "coinbase.com",
  metamask: "metamask.io",
  whatsapp: "whatsapp.com",
  telegram: "telegram.org"
};

// Phishing path & query keywords
const SUSPICIOUS_PATH_PATTERNS = [
  "verify_account", "update_billing", "confirm_identity", "login_reset",
  "recovery_phrase", "seed_phrase", "claim_reward", "free_crypto",
  "airdrop_claim", "wallet-connect", "secure-login", "auth-check",
  "verify-identity", "account-alert", "session-expired"
];

export const checkUrlSafety = (urlStr) => {
  const reasons = [];
  let isBlocked = false;

  if (!urlStr || typeof urlStr !== "string") {
    return {
      isSafe: false,
      isBlocked: true,
      riskLevel: "critical",
      reasons: ["URL is missing or invalid"]
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(urlStr.trim());
  } catch {
    return {
      isSafe: false,
      isBlocked: true,
      riskLevel: "critical",
      reasons: ["Malformed URL structure"]
    };
  }

  const protocol = parsedUrl.protocol.toLowerCase();
  const hostname = parsedUrl.hostname.toLowerCase();
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : null;
  const fullPath = (parsedUrl.pathname + parsedUrl.search).toLowerCase();

  // 1. Strict Protocol Check (Only http and https permitted)
  if (protocol !== "http:" && protocol !== "https:") {
    return {
      isSafe: false,
      isBlocked: true,
      riskLevel: "critical",
      reasons: [`Dangerous or disallowed protocol: "${protocol}"`]
    };
  }

  // 2. Localhost, Loopback, & Metadata hostname check (SSRF vector)
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost") ||
    hostname.includes("metadata.google.internal")
  ) {
    return {
      isSafe: false,
      isBlocked: true,
      riskLevel: "critical",
      reasons: ["Loopback or cloud metadata destination is strictly blocked (SSRF security)"]
    };
  }

  // 3. Port Restriction check
  if (port && RESTRICTED_PORTS.has(port)) {
    return {
      isSafe: false,
      isBlocked: true,
      riskLevel: "critical",
      reasons: [`Target connects to restricted or non-web port ${port}`]
    };
  }

  // 4. IPv4 Address check (Private IP vs Public IP)
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    if (isPrivateOrReservedIP(hostname)) {
      return {
        isSafe: false,
        isBlocked: true,
        riskLevel: "critical",
        reasons: [`Target IP address ${hostname} points to an internal or reserved network`]
      };
    }
    // Public raw IP address - suspicious for phishing
    reasons.push("Target uses a raw IP address instead of a verified domain name");
  }

  // 5. Homograph / Punycode check
  if (hostname.startsWith("xn--") || hostname.includes(".xn--")) {
    reasons.push("Internationalized domain name (Punycode / xn--) detected, which may mimic legitimate characters");
  }

  // 6. Suspicious TLD Check
  for (const tld of SUSPICIOUS_TLDS) {
    if (hostname.endsWith(tld)) {
      reasons.push(`Uses high-risk top-level domain extension "${tld}" commonly associated with spam or malware`);
      break;
    }
  }

  // 7. Brand Impersonation & Spoofing
  for (const [brand, legitDomain] of Object.entries(LEGITIMATE_BRAND_DOMAINS)) {
    if (hostname.includes(brand)) {
      const parts = hostname.split(".");
      const rootDomain = parts.slice(-2).join(".");
      if (rootDomain !== legitDomain && !hostname.endsWith("." + legitDomain)) {
        reasons.push(`Possible impersonation of "${brand}" (domain does not match official ${legitDomain})`);
        break;
      }
    }
  }

  // 8. Phishing Keywords in Path or Query
  for (const pattern of SUSPICIOUS_PATH_PATTERNS) {
    if (fullPath.includes(pattern)) {
      reasons.push(`URL path or parameters contain suspicious pattern "${pattern}"`);
      break;
    }
  }

  // 9. Excessive Subdomain Nesting or Length
  if (hostname.split(".").length > 4 || hostname.length > 60) {
    reasons.push("Unusually long domain name or excessive subdomain nesting");
  }

  const isSafe = reasons.length === 0;
  const riskLevel = isBlocked ? "critical" : isSafe ? "safe" : "suspicious";

  return {
    isSafe,
    isBlocked,
    riskLevel,
    reasons
  };
};
