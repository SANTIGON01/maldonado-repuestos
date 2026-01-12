"""
MercadoPago Integration Service
"""
import mercadopago
from decimal import Decimal
from app.config import settings
from app.models.order import Order


class MercadoPagoService:
    def __init__(self):
        self.sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    def create_preference(self, order: Order, items: list[dict]) -> dict:
        """Create a MercadoPago payment preference"""
        preference_data = {
            "items": [
                {
                    "id": str(item["product_id"]),
                    "title": item["name"],
                    "description": f"{item['brand']} - {item['code']}",
                    "quantity": item["quantity"],
                    "currency_id": "ARS",
                    "unit_price": float(item["price"]),
                }
                for item in items
            ],
            "payer": {
                "name": order.shipping_name or "",
                "phone": {"number": order.shipping_phone or ""},
            },
            "back_urls": {
                "success": f"{settings.FRONTEND_URL}/checkout/success?order={order.order_number}",
                "failure": f"{settings.FRONTEND_URL}/checkout/failure?order={order.order_number}",
                "pending": f"{settings.FRONTEND_URL}/checkout/pending?order={order.order_number}",
            },
            "auto_return": "approved",
            "external_reference": order.order_number,
            "notification_url": f"{settings.FRONTEND_URL}/api/payments/webhook",
            "statement_descriptor": "MALDONADO REPUESTOS",
        }
        
        # Add shipping if applicable
        if order.shipping_cost > 0:
            preference_data["shipments"] = {
                "cost": float(order.shipping_cost),
                "mode": "not_specified",
            }
        
        preference_response = self.sdk.preference().create(preference_data)
        
        if preference_response["status"] != 201:
            raise Exception(f"Error creating preference: {preference_response}")
        
        return preference_response["response"]
    
    def get_payment(self, payment_id: str) -> dict:
        """Get payment details from MercadoPago"""
        payment_response = self.sdk.payment().get(payment_id)
        
        if payment_response["status"] != 200:
            raise Exception(f"Error getting payment: {payment_response}")
        
        return payment_response["response"]
    
    def process_webhook(self, data: dict) -> dict | None:
        """Process MercadoPago webhook notification"""
        if data.get("type") == "payment":
            payment_id = data.get("data", {}).get("id")
            if payment_id:
                return self.get_payment(payment_id)
        return None


# Singleton instance
mercadopago_service = MercadoPagoService()

