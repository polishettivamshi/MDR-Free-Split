import re
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

VPA_REGEX = re.compile(r'^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$')

class MerchantQRParseRequest(BaseModel):
    raw_payload: str = Field(..., description="Raw text decoded from merchant QR code or manual input")

class ParsedMerchantResponse(BaseModel):
    vpa: str
    merchant_name: str
    amount: Optional[Decimal] = None
    currency: str = "INR"
    transaction_ref: Optional[str] = None
    is_valid: bool
    validation_errors: List[str] = []

class CreateSplitPlanRequest(BaseModel):
    merchant_name: str = Field(..., min_length=1, max_length=255)
    merchant_vpa: str = Field(..., description="Payee UPI Virtual Payment Address")
    total_amount: Decimal = Field(..., gt=0, decimal_places=2, description="Total purchase amount in INR")
    number_of_payments: int = Field(..., ge=2, le=12, description="Number of installments")
    custom_amounts: Optional[List[Decimal]] = Field(None, description="Optional custom split amounts")
    qr_payload: Optional[str] = None

    @field_validator('merchant_vpa')
    @classmethod
    def validate_vpa(cls, v: str) -> str:
        v = v.strip().lower()
        if not VPA_REGEX.match(v):
            raise ValueError(f"Invalid UPI VPA format: '{v}'. Must be formatted like name@bank")
        return v

    @model_validator(mode='after')
    def validate_sum_equality(self) -> 'CreateSplitPlanRequest':
        if self.custom_amounts:
            if len(self.custom_amounts) != self.number_of_payments:
                raise ValueError("Length of custom_amounts must match number_of_payments")
            sum_amounts = sum(self.custom_amounts)
            if abs(sum_amounts - self.total_amount) != Decimal('0.00'):
                raise ValueError(
                    f"Sum of installment amounts ({sum_amounts}) must equal total amount ({self.total_amount}) exactly"
                )
        return self

class InitiatePaymentRequest(BaseModel):
    split_item_id: str = Field(..., description="ID of the split item to pay")
    upi_app: Optional[str] = Field("other", description="Selected UPI application (e.g. phonepe, gpay, paytm, bhim)")

class PaymentStatusResponse(BaseModel):
    payment_id: str
    public_id: str
    transaction_reference: str
    amount: Decimal
    currency: str
    status: str
    upi_app: Optional[str]
    failure_reason: Optional[str] = None
    deep_link: Optional[str] = None

class WebhookIngestRequest(BaseModel):
    event_id: str
    event_type: str
    provider_payment_id: str
    transaction_reference: str
    status: str # SUCCESS, FAILED
    amount: Decimal
    signature: str
    failure_reason: Optional[str] = None
