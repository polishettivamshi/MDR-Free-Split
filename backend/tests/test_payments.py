import pytest
from decimal import Decimal
from pydantic import ValidationError
from app.schemas import CreateSplitPlanRequest, MerchantQRParseRequest
from app.providers import MockUPIProvider

def test_vpa_validation():
    # Valid VPAs
    req = CreateSplitPlanRequest(
        merchant_name="Store",
        merchant_vpa="store@okaxis",
        total_amount=Decimal("1000.00"),
        number_of_payments=2,
        custom_amounts=[Decimal("500.00"), Decimal("500.00")]
    )
    assert req.merchant_vpa == "store@okaxis"

    # Invalid VPA format
    with pytest.raises(ValidationError):
        CreateSplitPlanRequest(
            merchant_name="Store",
            merchant_vpa="invalid-vpa-without-at",
            total_amount=Decimal("1000.00"),
            number_of_payments=2
        )

def test_split_sum_guarantee():
    # Sum strictly equals total
    req = CreateSplitPlanRequest(
        merchant_name="Store",
        merchant_vpa="store@icici",
        total_amount=Decimal("5000.00"),
        number_of_payments=3,
        custom_amounts=[Decimal("1999.00"), Decimal("1999.00"), Decimal("1002.00")]
    )
    assert sum(req.custom_amounts) == Decimal("5000.00")

    # Sum does not match total -> Must raise ValidationError
    with pytest.raises(ValidationError):
        CreateSplitPlanRequest(
            merchant_name="Store",
            merchant_vpa="store@icici",
            total_amount=Decimal("5000.00"),
            number_of_payments=3,
            custom_amounts=[Decimal("2000.00"), Decimal("2000.00"), Decimal("1001.00")]
        )

@pytest.mark.asyncio
async def test_mock_provider_deep_link():
    provider = MockUPIProvider()
    res = await provider.create_payment_request(
        payee_vpa="abc@icici",
        payee_name="ABC Store",
        amount=Decimal("1999.00"),
        transaction_ref="TR12345",
        note="Payment 1 of 3"
    )
    assert "upi://pay?" in res.deep_link
    assert "pa=abc%40icici" in res.deep_link or "pa=abc@icici" in res.deep_link
    assert "am=1999.00" in res.deep_link
    assert "cu=INR" in res.deep_link

@pytest.mark.asyncio
async def test_webhook_signature_verification():
    provider = MockUPIProvider(webhook_secret="test_secret_key")
    payload = b'{"event":"payment.success","id":"evt_123"}'
    
    import hmac, hashlib
    valid_sig = hmac.new(b"test_secret_key", payload, hashlib.sha256).hexdigest()
    
    assert await provider.verify_webhook_signature(payload, valid_sig) is True
    assert await provider.verify_webhook_signature(payload, "invalid_tampered_signature") is False
