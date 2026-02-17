     1	#!/usr/bin/env python3
     2	# -*- coding: utf-8 -*-
     3	"""
     4	Servidor Webhook para Tu Dinero Claro
     5	Recibe notificaciones de ventas de Gumroad y genera licencias automáticamente
     6	"""
     7	
     8	from flask import Flask, request, jsonify, send_from_directory
     9	from flask_cors import CORS
    10	import os
    11	import json
    12	from datetime import datetime
    13	import logging
    14	from license_gen import LicenseGenerator
    15	from email_sender import EmailSender
    16	
    17	# Configuración de logging
    18	logging.basicConfig(
    19	    level=logging.INFO,
    20	    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    21	)
    22	logger = logging.getLogger(__name__)
    23	
    24	# Determinar ruta de archivos estáticos
    25	static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    26	
    27	app = Flask(__name__, static_folder=static_folder, static_url_path='')
    28	CORS(app)
    29	
    30	# Inicializar generador de licencias y email
    31	license_gen = LicenseGenerator()
    32	email_sender = EmailSender()
    33	
    34	# Archivo para almacenar licencias generadas
    35	LICENSES_FILE = 'licenses_issued.json'
    36	
    37	def load_licenses():
    38	    """Carga el registro de licencias emitidas"""
    39	    if os.path.exists(LICENSES_FILE):
    40	        try:
    41	            with open(LICENSES_FILE, 'r', encoding='utf-8') as f:
    42	                return json.load(f)
    43	        except Exception as e:
    44	            logger.error(f"Error cargando licencias: {e}")
    45	            return []
    46	    return []
    47	
    48	def save_license(license_data):
    49	    """Guarda una licencia en el registro"""
    50	    try:
    51	        licenses = load_licenses()
    52	        licenses.append(license_data)
    53	        with open(LICENSES_FILE, 'w', encoding='utf-8') as f:
    54	            json.dump(licenses, f, indent=2, ensure_ascii=False)
    55	        logger.info(f"Licencia guardada: {license_data['license_key']}")
    56	        return True
    57	    except Exception as e:
    58	        logger.error(f"Error guardando licencia: {e}")
    59	        return False
    60	
    61	@app.route('/')
    62	def index():
    63	    """Sirve la página principal de la aplicación"""
    64	    return send_from_directory(app.static_folder, 'index.html')
    65	
    66	@app.route('/<path:path>')
    67	def serve_static(path):
    68	    """Sirve archivos estáticos (CSS, JS, HTML)"""
    69	    return send_from_directory(app.static_folder, path)
    70	
    71	@app.route('/api/status', methods=['GET'])
    72	def api_status():
    73	    """Endpoint de verificación del API"""
    74	    return jsonify({
    75	        'service': 'Tu Dinero Claro - Webhook Server',
    76	        'status': 'running',
    77	        'version': '1.0.0',
    78	        'endpoints': {
    79	            'webhook': '/webhook/gumroad',
    80	            'health': '/health',
    81	            'stats': '/admin/stats'
    82	        }
    83	    })
    84	
    85	@app.route('/health', methods=['GET'])
    86	def health():
    87	    """Health check para Railway"""
    88	    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})
    89	
    90	@app.route('/webhook/gumroad', methods=['POST'])
    91	def gumroad_webhook():
    92	    """
    93	    Endpoint que recibe webhooks de Gumroad
    94	    Documentación: https://help.gumroad.com/article/268-webhooks
    95	    """
    96	    try:
    97	        # Obtener datos del webhook
    98	        data = request.form.to_dict() if request.form else request.get_json()
    99	        
   100	        logger.info(f"Webhook recibido: {json.dumps(data, indent=2)}")
   101	        
   102	        # Validar que es una venta
   103	        if not data or 'email' not in data:
   104	            logger.warning("Webhook sin email de comprador")
   105	            return jsonify({'error': 'Invalid webhook data'}), 400
   106	        
   107	        # Extraer información del comprador
   108	        buyer_email = data.get('email')
   109	        buyer_name = data.get('full_name', 'Cliente')
   110	        order_id = data.get('order_id', 'N/A')
   111	        product_name = data.get('product_name', 'Tu Dinero Claro')
   112	        sale_id = data.get('sale_id', order_id)
   113	        
   114	        logger.info(f"Procesando compra: {buyer_email} - Order: {order_id}")
   115	        
   116	        # Generar licencia única
   117	        license_key = license_gen.generate()
   118	        
   119	        logger.info(f"Licencia generada: {license_key}")
   120	        
   121	        # Preparar datos de la licencia
   122	        license_data = {
   123	            'license_key': license_key,
   124	            'buyer_email': buyer_email,
   125	            'buyer_name': buyer_name,
   126	            'order_id': order_id,
   127	            'sale_id': sale_id,
   128	            'product_name': product_name,
   129	            'created_at': datetime.utcnow().isoformat(),
   130	            'email_sent': False
   131	        }
   132	        
   133	        # Guardar licencia en registro
   134	        save_license(license_data)
   135	        
   136	        # Enviar email al comprador
   137	        email_sent = email_sender.send_license_email(
   138	            to_email=buyer_email,
   139	            buyer_name=buyer_name,
   140	            license_key=license_key
   141	        )
   142	        
   143	        if email_sent:
   144	            logger.info(f"Email enviado exitosamente a {buyer_email}")
   145	            license_data['email_sent'] = True
   146	            
   147	            # Actualizar estado en el registro
   148	            licenses = load_licenses()
   149	            for lic in licenses:
   150	                if lic['license_key'] == license_key:
   151	                    lic['email_sent'] = True
   152	            with open(LICENSES_FILE, 'w', encoding='utf-8') as f:
   153	                json.dump(licenses, f, indent=2, ensure_ascii=False)
   154	        else:
   155	            logger.error(f"Error enviando email a {buyer_email}")
   156	        
   157	        return jsonify({
   158	            'success': True,
   159	            'license_key': license_key,
   160	            'email_sent': email_sent,
   161	            'message': 'License generated and email sent successfully'
   162	        }), 200
   163	        
   164	    except Exception as e:
   165	        logger.error(f"Error procesando webhook: {str(e)}", exc_info=True)
   166	        return jsonify({'error': str(e)}), 500
   167	
   168	@app.route('/admin/stats', methods=['GET'])
   169	def admin_stats():
   170	    """Endpoint para estadísticas (proteger en producción)"""
   171	    try:
   172	        licenses = load_licenses()
   173	        
   174	        total = len(licenses)
   175	        sent = sum(1 for lic in licenses if lic.get('email_sent', False))
   176	        failed = total - sent
   177	        
   178	        # Últimas 10 licencias
   179	        recent = sorted(licenses, key=lambda x: x['created_at'], reverse=True)[:10]
   180	        
   181	        return jsonify({
   182	            'total_licenses': total,
   183	            'emails_sent': sent,
   184	            'emails_failed': failed,
   185	            'recent_licenses': recent
   186	        })
   187	    except Exception as e:
   188	        logger.error(f"Error obteniendo estadísticas: {e}")
   189	        return jsonify({'error': str(e)}), 500
   190	
   191	@app.route('/admin/generate', methods=['POST'])
   192	def admin_generate():
   193	    """Endpoint para generar licencia manualmente (backup)"""
   194	    try:
   195	        data = request.get_json()
   196	        buyer_email = data.get('email')
   197	        buyer_name = data.get('name', 'Cliente')
   198	        
   199	        if not buyer_email:
   200	            return jsonify({'error': 'Email requerido'}), 400
   201	        
   202	        # Generar licencia
   203	        license_key = license_gen.generate()
   204	        
   205	        # Guardar
   206	        license_data = {
   207	            'license_key': license_key,
   208	            'buyer_email': buyer_email,
   209	            'buyer_name': buyer_name,
   210	            'order_id': 'MANUAL',
   211	            'sale_id': 'MANUAL',
   212	            'product_name': 'Tu Dinero Claro',
   213	            'created_at': datetime.utcnow().isoformat(),
   214	            'email_sent': False,
   215	            'manual': True
   216	        }
   217	        
   218	        save_license(license_data)
   219	        
   220	        # Enviar email
   221	        email_sent = email_sender.send_license_email(
   222	            to_email=buyer_email,
   223	            buyer_name=buyer_name,
   224	            license_key=license_key
   225	        )
   226	        
   227	        return jsonify({
   228	            'success': True,
   229	            'license_key': license_key,
   230	            'email_sent': email_sent
   231	        }), 200
   232	        
   233	    except Exception as e:
   234	        logger.error(f"Error generando licencia manual: {e}")
   235	        return jsonify({'error': str(e)}), 500
   236	
   237	if __name__ == '__main__':
   238	    port = int(os.environ.get('PORT', 8080))
   239	    logger.info(f"Iniciando servidor en puerto {port}")
   240	    app.run(host='0.0.0.0', port=port, debug=False)
   241	
