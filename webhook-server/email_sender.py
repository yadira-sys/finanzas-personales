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
                'subject': '🎉 Tu licencia de Tu Dinero Claro está lista',
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
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #7c3aed;
            margin: 0;
            font-size: 28px;
        }}
        .license-box {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
        }}
        .license-key {{
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 3px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
        }}
        .button {{
            display: inline-block;
            background: #7c3aed;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }}
        .instructions {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .instructions ol {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .instructions li {{
            margin: 10px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 ¡Bienvenido/a a Tu Dinero Claro!</h1>
            <p>Hola <strong>{buyer_name}</strong>,</p>
            <p>Tu compra se ha procesado exitosamente. ¡Gracias por confiar en nosotros!</p>
        </div>
        
        <div class="license-box">
            <p style="margin: 0; font-size: 16px;">🔑 TU LICENCIA PERSONAL</p>
            <div class="license-key">{license_key}</div>
            <p style="margin: 0; font-size: 14px;">Guarda esta clave en un lugar seguro</p>
        </div>
        
        <div style="text-align: center;">
            <a href="{self.app_url}" class="button">🚀 Acceder a la Aplicación</a>
        </div>
        
        <div class="instructions">
            <h3 style="margin-top: 0;">📋 Cómo usar tu licencia:</h3>
            <ol>
                <li>Abre <strong><a href=<span class="cursor">█</span>
