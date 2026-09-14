"""
Tests for VerifierService assertions: JSON_SCHEMA, HASH_MATCH, REGEX, LLM_JUDGE.
"""

import hashlib
import json
import pytest
from verisett.core.constants import AssertionType
from verisett.services.verifier_service import VerifierService


def test_json_schema_validation_success():
    schema = {
        "type": "object",
        "properties": {
            "summary": {"type": "string"},
            "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
            "tokens_used": {"type": "integer"}
        },
        "required": ["summary", "confidence"]
    }
    payload = {
        "summary": "Distributed consensus verified.",
        "confidence": 0.98,
        "tokens_used": 142
    }
    result = VerifierService.verify(
        assertion_type=AssertionType.JSON_SCHEMA,
        assertion_payload={"schema": schema},
        output_payload=payload
    )
    assert result.passed is True
    assert "conforms" in result.reason


def test_json_schema_validation_failure():
    schema = {
        "type": "object",
        "properties": {
            "summary": {"type": "string"},
            "confidence": {"type": "number", "minimum": 0.9}
        },
        "required": ["summary", "confidence"]
    }
    # Missing 'summary' and confidence < 0.9
    payload = {"confidence": 0.5}
    result = VerifierService.verify(
        assertion_type=AssertionType.JSON_SCHEMA,
        assertion_payload={"schema": schema},
        output_payload=payload
    )
    assert result.passed is False
    assert "Schema validation failed" in result.reason


def test_hash_match_canonical_sha256():
    payload = {"status": "completed", "block_number": 42000}
    canonical_json = json.dumps(payload, sort_keys=True).encode("utf-8")
    expected_hash = hashlib.sha256(canonical_json).hexdigest()

    result = VerifierService.verify(
        assertion_type=AssertionType.HASH_MATCH,
        assertion_payload={"algorithm": "sha256", "expected_hash": expected_hash},
        output_payload=payload
    )
    assert result.passed is True


def test_hash_match_field_sha512():
    payload = {"proof": "zk_snark_proof_bytes_12345", "extra": "ignored"}
    expected_hash = hashlib.sha512(b"zk_snark_proof_bytes_12345").hexdigest()

    result = VerifierService.verify(
        assertion_type=AssertionType.HASH_MATCH,
        assertion_payload={
            "algorithm": "sha512",
            "field_name": "proof",
            "expected_hash": expected_hash
        },
        output_payload=payload
    )
    assert result.passed is True


def test_regex_pattern_match():
    payload = {"commit_hash": "a1b2c3d4e5f67890abcdef1234567890abcdef12"}
    result = VerifierService.verify(
        assertion_type=AssertionType.REGEX,
        assertion_payload={
            "pattern": r"^[0-9a-f]{40}$",
            "field_name": "commit_hash"
        },
        output_payload=payload
    )
    assert result.passed is True


def test_regex_pattern_mismatch():
    payload = {"commit_hash": "invalid-sha-token"}
    result = VerifierService.verify(
        assertion_type=AssertionType.REGEX,
        assertion_payload={
            "pattern": r"^[0-9a-f]{40}$",
            "field_name": "commit_hash"
        },
        output_payload=payload
    )
    assert result.passed is False


def test_llm_judge_score_pass():
    payload = {"evaluation": "Output meets all constraints.", "score": 0.95}
    result = VerifierService.verify(
        assertion_type=AssertionType.LLM_JUDGE,
        assertion_payload={"rubric": "Code must have >90% code coverage.", "min_score": 0.90},
        output_payload=payload
    )
    assert result.passed is True


def test_llm_judge_score_fail():
    payload = {"evaluation": "Missing unit tests.", "score": 0.65}
    result = VerifierService.verify(
        assertion_type=AssertionType.LLM_JUDGE,
        assertion_payload={"rubric": "Code must have >90% code coverage.", "min_score": 0.90},
        output_payload=payload
    )
    assert result.passed is False
