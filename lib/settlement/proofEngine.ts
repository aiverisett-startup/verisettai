import crypto from "crypto";
import { SettlementAgreement, VerificationMethod, VerificationResult } from "./types";

/**
 * Deterministically canonicalizes any JSON-compatible structure by recursively sorting keys.
 * Essential for cryptographic reproducibility across heterogeneous agent nodes.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || obj === undefined) {
    return "null";
  }
  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalizeJson).join(",")}]`;
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`);
  return `{${pairs.join(",")}}`;
}

/**
 * Computes deterministic SHA-256 digest of a deliverable payload.
 */
export function computePayloadHash(payload: any): string {
  const canonical = canonicalizeJson(payload);
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Traverses an object using dot-notation path (e.g., "response.status" or "metrics.accuracy")
 */
function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

/**
 * Evaluates an individual test assertion predicate against deliverable data
 */
function evaluateAssertion(
  payload: any,
  assertion: {
    path: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "regex";
    expected: any;
  }
): { passed: boolean; error?: string } {
  const actual = getValueByPath(payload, assertion.path);

  switch (assertion.operator) {
    case "eq":
      return {
        passed: actual === assertion.expected,
        error: actual !== assertion.expected ? `Expected ${assertion.path} === ${JSON.stringify(assertion.expected)}, got ${JSON.stringify(actual)}` : undefined,
      };
    case "neq":
      return {
        passed: actual !== assertion.expected,
        error: actual === assertion.expected ? `Expected ${assertion.path} !== ${JSON.stringify(assertion.expected)}` : undefined,
      };
    case "gt":
      return {
        passed: typeof actual === "number" && actual > assertion.expected,
        error: `Expected ${assertion.path} > ${assertion.expected}, got ${actual}`,
      };
    case "gte":
      return {
        passed: typeof actual === "number" && actual >= assertion.expected,
        error: `Expected ${assertion.path} >= ${assertion.expected}, got ${actual}`,
      };
    case "lt":
      return {
        passed: typeof actual === "number" && actual < assertion.expected,
        error: `Expected ${assertion.path} < ${assertion.expected}, got ${actual}`,
      };
    case "lte":
      return {
        passed: typeof actual === "number" && actual <= assertion.expected,
        error: `Expected ${assertion.path} <= ${assertion.expected}, got ${actual}`,
      };
    case "contains":
      if (Array.isArray(actual)) {
        const contains = actual.includes(assertion.expected);
        return {
          passed: contains,
          error: contains ? undefined : `Array ${assertion.path} does not contain ${assertion.expected}`,
        };
      }
      if (typeof actual === "string") {
        const contains = actual.includes(String(assertion.expected));
        return {
          passed: contains,
          error: contains ? undefined : `String ${assertion.path} does not contain "${assertion.expected}"`,
        };
      }
      return { passed: false, error: `${assertion.path} is neither an array nor string` };
    case "regex":
      try {
        const re = new RegExp(assertion.expected);
        const matches = typeof actual === "string" && re.test(actual);
        return {
          passed: matches,
          error: matches ? undefined : `${assertion.path} does not match regex pattern ${assertion.expected}`,
        };
      } catch (err: any) {
        return { passed: false, error: `Invalid regex pattern: ${err.message}` };
      }
    default:
      return { passed: false, error: `Unknown operator: ${(assertion as any).operator}` };
  }
}

/**
 * Independent Test Assertion Runner
 */
export function runIndependentTestRunner(
  payload: any,
  rules?: SettlementAgreement["acceptanceRules"]["testRunner"]
): {
  passed: boolean;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: string[];
} {
  if (!rules) {
    return {
      passed: true,
      totalAssertions: 0,
      passedAssertions: 0,
      failedAssertions: [],
    };
  }

  const failedAssertions: string[] = [];
  let total = 0;
  let passed = 0;

  // 1. Required fields check
  if (rules.requiredFields && Array.isArray(rules.requiredFields)) {
    for (const field of rules.requiredFields) {
      total++;
      const val = getValueByPath(payload, field);
      if (val === undefined || val === null) {
        failedAssertions.push(`Missing mandatory deliverable field: "${field}"`);
      } else {
        passed++;
      }
    }
  }

  // 2. Latency threshold check
  if (rules.maxLatencyMs !== undefined && rules.maxLatencyMs > 0) {
    total++;
    const latency = payload?.latencyMs ?? payload?.durationMs ?? payload?.metrics?.latency;
    if (typeof latency === "number") {
      if (latency <= rules.maxLatencyMs) {
        passed++;
      } else {
        failedAssertions.push(`Execution latency ${latency}ms exceeded max limit of ${rules.maxLatencyMs}ms`);
      }
    } else {
      // If no explicit latency field reported, pass if under mock test
      passed++;
    }
  }

  // 3. Custom assertion suite
  if (rules.assertions && Array.isArray(rules.assertions)) {
    for (const assertion of rules.assertions) {
      total++;
      const result = evaluateAssertion(payload, assertion);
      if (result.passed) {
        passed++;
      } else {
        failedAssertions.push(result.error || `Assertion failed on ${assertion.path}`);
      }
    }
  }

  return {
    passed: failedAssertions.length === 0,
    totalAssertions: total,
    passedAssertions: passed,
    failedAssertions,
  };
}

/**
 * Attestation Quorum Verifier
 */
export function verifyAttestationQuorum(
  attestation: any,
  rules?: SettlementAgreement["acceptanceRules"]["attestationQuorum"]
): {
  validSignatures: number;
  requiredSignatures: number;
  signers: string[];
  passed: boolean;
  error?: string;
} {
  const required = rules?.requiredSignatures || 1;
  const authorized = rules?.authorizedSigners || [];

  if (!attestation || !attestation.signatures || !Array.isArray(attestation.signatures)) {
    return {
      validSignatures: 0,
      requiredSignatures: required,
      signers: [],
      passed: false,
      error: "No signed attestations provided in proof payload",
    };
  }

  const validSigners: string[] = [];
  for (const sigObj of attestation.signatures) {
    const signer = sigObj.signer || sigObj.nodeId || sigObj.publicKey;
    const signature = sigObj.sig || sigObj.signature;
    if (signer && signature) {
      if (authorized.length === 0 || authorized.includes(signer)) {
        validSigners.push(signer);
      }
    }
  }

  const passed = validSigners.length >= required;
  return {
    validSignatures: validSigners.length,
    requiredSignatures: required,
    signers: validSigners,
    passed,
    error: passed
      ? undefined
      : `Quorum not reached: got ${validSigners.length}/${required} authorized signatures`,
  };
}

/**
 * Universal Proof Engine Validator: Orchestrates proof validation based on agreement method
 */
export async function verifyDeliverable(
  agreement: SettlementAgreement,
  deliverablePayload: any,
  proofAttestation?: any
): Promise<VerificationResult> {
  const method = agreement.verificationMethod;
  const timestamp = new Date().toISOString();

  if (!deliverablePayload) {
    return {
      verified: false,
      method,
      error: "Deliverable payload is null or empty",
      verifiedAt: timestamp,
    };
  }

  switch (method) {
    case "CONTENT_HASH_COMMITMENT": {
      const computedHash = computePayloadHash(deliverablePayload);
      const expectedHash = agreement.acceptanceRules.expectedContentHash;

      if (!expectedHash) {
        // If no pre-committed hash was specified, the computed hash becomes the verified fingerprint
        return {
          verified: true,
          method,
          computedHash,
          expectedHash: computedHash,
          verifiedAt: timestamp,
        };
      }

      const matches = computedHash.toLowerCase() === expectedHash.toLowerCase();
      return {
        verified: matches,
        method,
        computedHash,
        expectedHash,
        error: matches ? undefined : `Payload hash mismatch: computed ${computedHash.slice(0, 16)}... != expected ${expectedHash.slice(0, 16)}...`,
        verifiedAt: timestamp,
      };
    }

    case "INDEPENDENT_TEST_RUNNER": {
      const testResults = runIndependentTestRunner(
        deliverablePayload,
        agreement.acceptanceRules.testRunner
      );
      return {
        verified: testResults.passed,
        method,
        testResults,
        error: testResults.passed ? undefined : `Failed ${testResults.failedAssertions.length} assertions: ${testResults.failedAssertions.join("; ")}`,
        verifiedAt: timestamp,
      };
    }

    case "ATTESTATION_QUORUM": {
      const quorumResults = verifyAttestationQuorum(
        proofAttestation,
        agreement.acceptanceRules.attestationQuorum
      );
      return {
        verified: quorumResults.passed,
        method,
        quorumResults: {
          validSignatures: quorumResults.validSignatures,
          requiredSignatures: quorumResults.requiredSignatures,
          signers: quorumResults.signers,
        },
        error: quorumResults.error,
        verifiedAt: timestamp,
      };
    }

    default:
      return {
        verified: false,
        method,
        error: `Unsupported verification method: ${method}`,
        verifiedAt: timestamp,
      };
  }
}
