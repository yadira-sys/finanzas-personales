#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Webhook para Tu Dinero Claro
Recibe notificaciones de ventas de Gumroad y genera licencias automáticamente
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime
import logging
from license_gen import LicenseGenerator
from email_sender import EmailSender

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

app = Flask(__name__, static_folder=static_folder, static_url_path='')
CORS(app)

license_gen = LicenseGenerator()
email_sender = EmailSender()

LICENSES_FILE = 'licenses_issued.json'

def load_licenses():
    if os.path.exists(LICENSES_FILE):
        try:
            with open(LICENSES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error cargando licencias: {e}")
            return []
    return []

def save_license(license_data):
    try:
        licenses = load_licenses()
        licenses.append(license_data)
        with open(LICENSES_FILE, 'w', encoding='utf-8') as f:
            json.dump(licenses, f, indent=2, ensure_ascii=False)
        logger.info(f"Licencia guardada: {license_data['license_key']}")
        return True
    except Exception as e:
        logger.error(f"Error guardando licencia: {e}")
        return False

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/status', methods=['GET'])
def api_status():
    return jsonify({
        'service': 'Tu Dinero Claro - Webhook Server',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'webhook': '/webhook/gumroad',
            'health': '/health',
            'stats': '/admin/stats'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/webhook/gumroad', methods=['POST'])
def gumroad_webhook():
    try:
        data = request.form.to_dict() if request.form else request.get_json()
        
        logger.info(f"Webhook recibido: {json.dumps(data, indent=2)}")
        
        if not data or 'email' not in data:
            logger.warning("Webhook sin email de comprador")
            return jsonify({'error': 'Invalid webhook data'}), 400
        
        buyer_email = data.get('email')
        buyer_name = data.get('full_name', 'Cliente')
        order_id = data.get('order_id', 'N/A')
        product_name = data.get('product_name', 'Tu Dinero Claro')
        sale_id = data.get('sale_id', order_id)
        
        logger.info(f"Procesando compra: {buyer_email} - Order: {order_id}")
        
        license_key = license_gen.generate()
        
        logger.info(f"Licencia generada: {license_key}")
        
        license_data = {
            'license_key': license_key,
            'buyer_email': buyer_email,
            'buyer_name': buyer_name,
            'order_id': order_id,
            'sale_id': sale_id,
            'product_name': product_name,
            'created_at': datetime.utcnow().isoformat(),
            'email_sent': False
        }
        
        save_license(license_data)
        
        email_sent = email_sender.send_license_email(
            to_email=buyer_email,
            buyer_name=buyer_name,
            license_key=license_key
        )
        
        if email_sent:
            logger.info(f"Email enviado exitosamente a {buyer_email}")
            license_data['email_sent'] = True
            
            licenses = load_licenses()
            for lic in licenses:
                if lic['license_key'] == license_key:
                    lic['email_sent'] = True
            with open(LICENSES_FILE, 'w', encoding='utf-8') as f:
                json.dump(licenses, f, indent=2, ensure_ascii=False)
        else:
            logger.error(f"Error enviando email a {buyer_email}")
        
        return jsonify({
            'success': True,
            'license_key': license_key,
            'email_sent': email_sent,
            'message': 'License generated and email sent successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error procesando webhook: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/admin/stats', methods=['GET'])
def admin_stats():
    try:
        licenses = load_licenses()
        
        total = len(licenses)
        sent = sum(1 for lic in licenses if lic.get('email_sent', False))
        failed = total - sent
        
        recent = sorted(licenses, key=lambda x: x['created_at'], reverse=True)[:10]
        
        return jsonify({
            'total_licenses': total,
            'emails_sent': sent,
            'emails_failed': failed,
            'recent_licenses': recent
        })
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin/generate', methods=['POST'])
def admin_generate():
    try:
        data = request.get_json()
        buyer_email = data.get('email')
        buyer_name = data.get('name', 'Cliente')
        
        if not buyer_email:
            return jsonify({'error': 'Email requerido'}), 400
        
        license_key = license_gen.generate()
        
        license_data = {
            'license_key': license_key,
            'buyer_email': buyer_email,
            'buyer_name': buyer_name,
            'order_id': 'MANUAL',
            'sale_id': 'MANUAL',
            'product_name': 'Tu Dinero Claro',
            'created_at': datetime.utcnow().isoformat(),
            'email_sent': False,
            'manual': True
        }
        
        save_license(license_data)
        
        email_sent = email_sender.send_license_email(
            to_email=buyer_email,
            buyer_name=buyer_name,
            license_key=license_key
        )
        
        return jsonify({
            'success': True,
            'license_key': license_key,
            'email_sent': email_sent
        }), 200
        
    except Exception as e:
        logger.error(f"Error generando licencia manual: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    logger.info(f"Iniciando servidor en puerto {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
