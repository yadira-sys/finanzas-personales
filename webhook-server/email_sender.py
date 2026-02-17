#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de envío de emails para Tu Dinero Claro
"""

import os
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self):
        self.resend_api_key = os.environ.get('RESEND_API_KEY', '')
        self.sender_email = os.environ.get('SENDER_EMAIL', 'hola@tuadministrativa.es')
        self.sender_name = os.environ.get('SENDER_NAME', 'Tu Administrativa')
        self.app_url = 'https://finanzas.tuadministrativa.es'
        self.resend_url = 'https://api.resend.com/emails'
        
    def send_license_email(self, to_email, buyer_name, license_key):
        try:
            if not self.resend_api_key:
                logger.error("RESEND_API_KEY no configurada")
                return False
            
            html_body = self._create_email_body(buyer_name, license_key)
            text_body = self._create_text_body(buyer_name, license_key)
            
            payload = {
                'from': f'{self.sender_name} <{self.sender_email}>',
                'to': [to_email],
                'subject': 'Tu licencia de Tu Dinero Claro',
                'html': html_body,
                'text': text_body
            }
            
            headers = {
                'Authorization': f'Bearer {self.resend_api_key}',
                'Content-Type': 'application/json'
            }
            
            logger.info(f"Enviando email a {to_email}")
            
            response = requests.post(self.resend_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                logger.info(f"Email enviado a {to_email}")
                return True
            else:
                logger.error(f"Error enviando email: {response.status_code}")
                return False
            
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
            return False
    
    def _create_email_body(self, buyer_name, license_key):
        return f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h1>Bienvenido a Tu Dinero Claro</h1>
    <p>Hola {buyer_name},</p>
    <p>Tu licencia personal:</p>
    <h2 style="background: #7c3aed; color: white; padding: 20px; border-radius: 8px; text-align: center;">{license_key}</h2>
    <p>Accede a la aplicación: <a href="{self.app_url}">{self.app_url}</a></p>
    <p>Gracias por tu compra!</p>
</body>
</html>
"""
    
    def _create_text_body(self, buyer_name, license_key):
        return f"""
Bienvenido a Tu Dinero Claro

Hola {buyer_name},

Tu licencia personal: {license_key}

Accede a: {self.app_url}

Gracias por tu compra!
"""
