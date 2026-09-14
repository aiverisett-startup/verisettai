"""
Pydantic v2 schemas for task assertions and verification results.
"""

from typing import Any, Optional, Dict, Literal
from pydantic import BaseModel, Field


class JsonSchemaAssertionPayload(BaseModel):
    schema_definition: Dict[str, Any] = Field(
        ...,
        alias="schema",
        description="Valid JSON Schema specification against which the output payload is validated."
    )


class HashMatchAssertionPayload(BaseModel):
    algorithm: Literal["sha256", "sha512"] = Field(
        default="sha256",
        description="Cryptographic hashing algorithm (sha256 or sha512)."
    )
    expected_hash: str = Field(
        ...,
        description="Expected hexadecimal digest string."
    )
    field_name: Optional[str] = Field(
        default=None,
        description="Optional specific field key inside output_payload to hash. If omitted, hashes canonical JSON of output_payload."
    )


class RegexAssertionPayload(BaseModel):
    pattern: str = Field(
        ...,
        description="Regular expression pattern that must match the target string."
    )
    field_name: Optional[str] = Field(
        default=None,
        description="Optional field key inside output_payload to test. If omitted, tests serialized string of output_payload."
    )


class LlmJudgeAssertionPayload(BaseModel):
    rubric: str = Field(
        ...,
        description="Evaluation guidelines or criteria for LLM judge."
    )
    min_score: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Minimum score threshold between 0.0 and 1.0 required for pass."
    )


class VerificationResult(BaseModel):
    passed: bool
    reason: str
    details: Dict[str, Any] = Field(default_factory=dict)
