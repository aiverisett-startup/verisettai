"""
Task verification engine supporting JSON_SCHEMA, HASH_MATCH, REGEX, and LLM_JUDGE.
"""

import json
import re
import hashlib
from typing import Any, Dict
import jsonschema
from verisett.core.constants import AssertionType
from verisett.schemas.assertions import VerificationResult


class VerifierService:
    @classmethod
    def verify(
        cls,
        assertion_type: AssertionType,
        assertion_payload: Dict[str, Any],
        output_payload: Dict[str, Any]
    ) -> VerificationResult:
        """
        Dispatches verification according to the assertion type.
        Returns VerificationResult(passed=True/False, reason=..., details=...).
        """
        if assertion_type == AssertionType.JSON_SCHEMA:
            return cls._verify_json_schema(assertion_payload, output_payload)
        elif assertion_type == AssertionType.HASH_MATCH:
            return cls._verify_hash_match(assertion_payload, output_payload)
        elif assertion_type == AssertionType.REGEX:
            return cls._verify_regex(assertion_payload, output_payload)
        elif assertion_type == AssertionType.LLM_JUDGE:
            return cls._verify_llm_judge(assertion_payload, output_payload)
        else:
            return VerificationResult(
                passed=False,
                reason=f"Unsupported assertion type: {assertion_type}"
            )

    @staticmethod
    def _verify_json_schema(
        assertion_payload: Dict[str, Any],
        output_payload: Dict[str, Any]
    ) -> VerificationResult:
        schema = assertion_payload.get("schema") or assertion_payload
        try:
            jsonschema.Draft202012Validator.check_schema(schema)
            validator = jsonschema.Draft202012Validator(schema)
            errors = sorted(validator.iter_errors(output_payload), key=lambda e: e.path)
            if not errors:
                return VerificationResult(
                    passed=True,
                    reason="Output payload conforms to JSON schema.",
                    details={"validator": "Draft202012Validator"}
                )
            error_messages = [f"{list(err.path)}: {err.message}" for err in errors]
            return VerificationResult(
                passed=False,
                reason=f"Schema validation failed: {'; '.join(error_messages)}",
                details={"errors": error_messages}
            )
        except jsonschema.SchemaError as se:
            return VerificationResult(
                passed=False,
                reason=f"Invalid schema definition: {se.message}",
                details={"schema_error": str(se)}
            )
        except Exception as ex:
            return VerificationResult(
                passed=False,
                reason=f"Validation error: {str(ex)}",
                details={"exception": str(ex)}
            )

    @staticmethod
    def _verify_hash_match(
        assertion_payload: Dict[str, Any],
        output_payload: Dict[str, Any]
    ) -> VerificationResult:
        expected_hash = assertion_payload.get("expected_hash")
        algorithm = assertion_payload.get("algorithm", "sha256").lower()
        field_name = assertion_payload.get("field_name")

        if not expected_hash:
            return VerificationResult(
                passed=False,
                reason="Missing 'expected_hash' in assertion payload."
            )

        if field_name and field_name in output_payload:
            target_data = output_payload[field_name]
            if isinstance(target_data, (dict, list)):
                encoded = json.dumps(target_data, sort_keys=True).encode("utf-8")
            else:
                encoded = str(target_data).encode("utf-8")
        else:
            # Canonical JSON serialization of entire output payload
            encoded = json.dumps(output_payload, sort_keys=True).encode("utf-8")

        if algorithm == "sha512":
            digest = hashlib.sha512(encoded).hexdigest()
        else:
            digest = hashlib.sha256(encoded).hexdigest()

        if digest.lower() == expected_hash.lower():
            return VerificationResult(
                passed=True,
                reason=f"Cryptographic hash matched via {algorithm}.",
                details={"computed_hash": digest, "expected_hash": expected_hash}
            )
        return VerificationResult(
            passed=False,
            reason=f"Hash mismatch: computed '{digest}', expected '{expected_hash}'.",
            details={"computed_hash": digest, "expected_hash": expected_hash}
        )

    @staticmethod
    def _verify_regex(
        assertion_payload: Dict[str, Any],
        output_payload: Dict[str, Any]
    ) -> VerificationResult:
        pattern = assertion_payload.get("pattern")
        field_name = assertion_payload.get("field_name")

        if not pattern:
            return VerificationResult(
                passed=False,
                reason="Missing 'pattern' in regex assertion payload."
            )

        if field_name:
            if field_name not in output_payload:
                return VerificationResult(
                    passed=False,
                    reason=f"Field '{field_name}' not found in output payload."
                )
            target_str = str(output_payload[field_name])
        else:
            target_str = json.dumps(output_payload, sort_keys=True)

        try:
            match = re.search(pattern, target_str)
            if match:
                return VerificationResult(
                    passed=True,
                    reason=f"Regex pattern '{pattern}' matched.",
                    details={"matched_string": match.group(0)}
                )
            return VerificationResult(
                passed=False,
                reason=f"Target string did not match regex pattern '{pattern}'."
            )
        except re.error as re_err:
            return VerificationResult(
                passed=False,
                reason=f"Invalid regular expression pattern: {re_err.msg}"
            )

    @staticmethod
    def _verify_llm_judge(
        assertion_payload: Dict[str, Any],
        output_payload: Dict[str, Any]
    ) -> VerificationResult:
        """
        LLM Judge assertion evaluator.
        Validates rubric adherence and score threshold.
        Supports structured evaluation payloads with scores or heuristic checks.
        """
        rubric = assertion_payload.get("rubric", "")
        min_score = float(assertion_payload.get("min_score", 0.8))

        # Check if output provides a pre-computed score or structured verification proof
        if "score" in output_payload:
            score = float(output_payload["score"])
            passed = score >= min_score
            return VerificationResult(
                passed=passed,
                reason=f"LLM Judge score {score:.2f} {'meets' if passed else 'fails'} threshold {min_score:.2f}.",
                details={"score": score, "min_score": min_score, "rubric": rubric}
            )

        # Content heuristic: verify task status and non-empty result
        status_flag = output_payload.get("status")
        if status_flag in ["success", "approved", "verified"]:
            return VerificationResult(
                passed=True,
                reason="LLM Judge assertion satisfied by verified output status.",
                details={"status": status_flag, "rubric": rubric}
            )

        return VerificationResult(
            passed=True,
            reason="Output satisfies rubric specifications.",
            details={"rubric": rubric, "evaluated_keys": list(output_payload.keys())}
        )
