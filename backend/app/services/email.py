"""
Email Service
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.models.quote import Quote


class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
    
    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        text_content: str | None = None
    ) -> bool:
        """Send an email"""
        if not self.user or not self.password:
            print("Email not configured, skipping send")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["From"] = f"Maldonado Repuestos <{self.user}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            if text_content:
                message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))
            
            await aiosmtplib.send(
                message,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                start_tls=True,
            )
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    async def send_quote_notification(self, quote: Quote) -> bool:
        """Send notification about new quote to admin"""
        subject = f"Nueva Cotización - {quote.name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #A51C30; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #666; }}
                .value {{ margin-top: 5px; }}
                .message {{ background: white; padding: 15px; border-left: 4px solid #A51C30; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Nueva Solicitud de Cotización</h1>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">Nombre:</div>
                        <div class="value">{quote.name}</div>
                    </div>
                    <div class="field">
                        <div class="label">Email:</div>
                        <div class="value">{quote.email}</div>
                    </div>
                    <div class="field">
                        <div class="label">Teléfono:</div>
                        <div class="value">{quote.phone}</div>
                    </div>
                    <div class="field">
                        <div class="label">Vehículo:</div>
                        <div class="value">{quote.vehicle_info or 'No especificado'}</div>
                    </div>
                    <div class="field">
                        <div class="label">Mensaje:</div>
                        <div class="message">{quote.message}</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(
            to_email=settings.NOTIFICATION_EMAIL or self.user,
            subject=subject,
            html_content=html_content,
        )
    
    async def send_quote_confirmation(self, quote: Quote) -> bool:
        """Send confirmation to customer that quote was received"""
        subject = "Recibimos tu solicitud de cotización - Maldonado Repuestos"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #A51C30; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>MALDONADO REPUESTOS</h1>
                </div>
                <div class="content">
                    <h2>¡Hola {quote.name}!</h2>
                    <p>Recibimos tu solicitud de cotización y la estamos procesando.</p>
                    <p>Nuestro equipo se pondrá en contacto contigo a la brevedad para brindarte toda la información que necesitás.</p>
                    <p><strong>Resumen de tu consulta:</strong></p>
                    <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #A51C30;">
                        {quote.message}
                    </blockquote>
                    <p>Si tenés alguna consulta urgente, no dudes en contactarnos:</p>
                    <ul>
                        <li>Teléfono: +54 11 1234-5678</li>
                        <li>WhatsApp: +54 11 1234-5678</li>
                    </ul>
                    <p>¡Gracias por elegirnos!</p>
                </div>
                <div class="footer">
                    <p>Maldonado Repuestos - Especialistas en Semirremolques y Acoplados</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(
            to_email=quote.email,
            subject=subject,
            html_content=html_content,
        )


# Singleton instance
email_service = EmailService()

