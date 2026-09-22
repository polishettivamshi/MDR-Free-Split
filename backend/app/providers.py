import hmac
import hashlib
import urllib.parse
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel

class UPIPaymentResponse(BaseModel):
    provider_payment_id: str
    deep_link: str
    status: str
    qr_data: Optional[str] = None

class UPIPaymentStatus(BaseModel):
    provider_payment_id: str
    status: str  # SUCCESS, FAILED, PENDING
    transaction_reference: str
    amount: Decimal
    bank_reference: Optional[str] = None
    failure_reason: Optional[str] = None

class UPIPaymentProvider(ABC):
    @abstractmethod
    async def create_payment_request(
        self,
        payee_vpa: str,
        payee_name: str,
        amount: Decimal,
        transaction_ref: str,
        note: str,
        upi_app: Optional[str] = None
    ) -> UPIPaymentResponse:
        pass

    @abstractmethod
    async def check_payment_status(self, provider_payment_id: str) -> UPIPaymentStatus:
        pass

    @abstractmethod
    async def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        pass

class MockUPIProvider(UPIPaymentProvider):
    """
    Mock UPI provider for development and testing.
    Never used in real financial transaction processing.
    """
    def __init__(self, webhook_secret: str = "mock_secret_key_123"):
        self.webhook_secret = webhook_secret
        self.simulated_mode = "AUTO_SUCCESS"  # AUTO_SUCCESS, INSTANT_SUCCESS, SIMULATE_FAILURE, BANK_DOWNTIME

    async def create_payment_request(
        self,
        payee_vpa: str,
        payee_name: str,
        amount: Decimal,
        transaction_ref: str,
        note: str,
        upi_app: Optional[str] = None
    ) -> UPIPaymentResponse:
        params = {
            "pa": payee_vpa,
            "pn": payee_name,
            "am": f"{amount:.2f}",
            "cu": "INR",
            "tr": transaction_ref,
            "tn": note
        }
        query_string = urllib.parse.urlencode(params)
        deep_link = f"upi://pay?{query_string}"

        return UPIPaymentResponse(
            provider_payment_id=f"mock_prv_{transaction_ref}",
            deep_link=deep_link,
            status="PENDING",
            qr_data=deep_link
        )

    async def check_payment_status(self, provider_payment_id: str) -> UPIPaymentStatus:
        # Evaluate simulated mode
        if self.simulated_mode == "SIMULATE_FAILURE":
            return UPIPaymentStatus(
                provider_payment_id=provider_payment_id,
                status="FAILED",
                transaction_reference=provider_payment_id.replace("mock_prv_", ""),
                amount=Decimal("0.00"),
                failure_reason="User cancelled payment or bank authorization declined"
            )
        elif self.simulated_mode == "BANK_DOWNTIME":
            return UPIPaymentStatus(
                provider_payment_id=provider_payment_id,
                status="PENDING",
                transaction_reference=provider_payment_id.replace("mock_prv_", ""),
                amount=Decimal("0.00"),
                failure_reason="Bank NPCI switch timeout - retry pending"
            )
        else:
            return UPIPaymentStatus(
                provider_payment_id=provider_payment_id,
                status="SUCCESS",
                transaction_reference=provider_payment_id.replace("mock_prv_", ""),
                amount=Decimal("0.00"),
                bank_reference=f"NPCI{abs(hash(provider_payment_id)) % 100000000:08d}"
            )

    async def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        expected = hmac.new(self.webhook_secret.encode(), payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
