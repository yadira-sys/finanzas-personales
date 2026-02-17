#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de envío de emails para Tu Dinero Claro
Utiliza Resend API para envío de licencias
"""

import os
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self):
        self.resend_api_key = os.getenv('RESEND_API_KEY', '')
        self.sender_email = os.getenv('SENDER_EMAIL', 'hola@tuadministrativa.es')
        self.sender_name = os.getenv('SENDER_NAME', 'Tu Administrativa')
        self.app_url = 'https://finanzas.tuadministrativa.es'
        self.resend_url = 'https://api.resend.com/emails'
        
    def send_license_email(self, to_email, buyer_name, license_key):
        if not self.resend_api_key:
            logger.error("RESEND_API_KEY no configurada")
            return False
            
        html_body = self._create_email_body(buyer_name, license_key)
        text_body = self._create_text_body(buyer_name, license_key)
        
        payload = {
            'from': f"{self.sender_name} <{self.sender_email}>",
            'to': [to_email],
            'subject': '🎉 Tu licencia de Tu Dinero Claro está lista',
            'html': html_body,
            'text': text_body
        }
        
        headers = {
            'Authorization': f'Bearer {self.resend_api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Enviando email a {to_email}")
        
        try:
            response = requests.post(self.resend_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                logger.info(f"✅ Email enviado exitosamente a {to_email}")
                return True
            else:
                logger.error(f"❌ Error enviando email: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"❌ Excepción enviando email: {str(e)}")
            return False
    
    def _create_email_body(self, buyer_name, license_key):
        current_year = datetime.now().year
        return f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🎉 ¡Bienvenido a Tu Dinero Claro!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Saludo personalizado -->
                    <tr>
                        <td style="padding: 30px 30px 20px;">
                            <p style="margin: 0 0 20px; color: #1f2937; font-size: 18px; line-height: 1.6;">
                                Hola <strong>{buyer_name}</strong>,
                            </p>
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                ¡Gracias por tu compra! Tu aplicación está lista para usar. Aquí está tu licencia personal:
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Licencia -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                    Tu Clave de Licencia
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px; word-break: break-all;">
                                    {license_key}
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Instrucciones -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 20px;">
                                📝 Cómo activar tu licencia:
                            </h2>
                            <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                                <li>Accede a la aplicación usando el botón de abajo</li>
                                <li>Introduce tu clave de licencia en el campo correspondiente</li>
                                <li>Haz clic en "Activar Licencia"</li>
                                <li>¡Empieza a gestionar tus finanzas!</li>
                            </ol>
                        </td>
                    </tr>
                    
                    <!-- Botón CTA -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <a href="{self.app_url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
                                🚀 Acceder a Tu Dinero Claro
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Características -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed;">
                                <p style="margin: 0 0 10px; color: #1f2937; font-size: 16px; font-weight: 600;">
                                    ✨ Lo que puedes hacer:
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                    <li>Registrar ingresos y gastos</li>
                                    <li>Visualizar estadísticas en tiempo real</li>
                                    <li>Exportar tus datos a CSV</li>
                                    <li>Acceso sin conexión a internet</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                ¿Necesitas ayuda? Responde a este email
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © {current_year} {self.sender_name}. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    def _create_text_body(self, buyer_name, license_key):
        current_year = datetime.now().year
        return f"""
🎉 ¡Bienvenido a Tu Dinero Claro!

Hola {buyer_name},

¡Gracias por tu compra! Tu aplicación está lista para usar.

Tu Clave de Licencia:
{license_key}

📝 Cómo activar tu licencia:
1. Accede a: {self.app_url}
2. Introduce tu clave de licencia
3. Haz clic en "Activar Licencia"
4. ¡Empieza a gestionar tus finanzas!

✨ Lo que puedes hacer:
• Registrar ingresos y gastos
• Visualizar estadísticas en tiempo real
• Exportar tus datos a CSV
• Acceso sin conexión a internet

¿Necesitas ayuda? Responde a este email.

© {current_year} {self.sender_name}. Todos los derechos reservados.
"""

# Test básico
if __name__ == "__main__":
    sender = EmailSender()
    print(f"Configuración:")
    print(f"  Sender Email: {sender.sender_email}")
    print(f"  Sender Name: {sender.sender_name}")
    print(f"  App URL: {sender.app_url}")
