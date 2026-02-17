     1	#!/usr/bin/env python3
     2	# -*- coding: utf-8 -*-
     3	"""
     4	Sistema de envío de emails para Tu Dinero Claro
     5	Usa Resend API (compatible con Railway)
     6	"""
     7	
     8	import os
     9	import requests
    10	from datetime import datetime
    11	import logging
    12	
    13	logger = logging.getLogger(__name__)
    14	
    15	class EmailSender:
    16	    """
    17	    Envía emails usando Resend API
    18	    """
    19	    
    20	    def __init__(self):
    21	        # Credenciales desde variables de entorno (seguras en Railway)
    22	        self.resend_api_key = os.environ.get('RESEND_API_KEY', '')
    23	        self.sender_email = os.environ.get('SENDER_EMAIL', 'hola@tuadministrativa.es')
    24	        self.sender_name = os.environ.get('SENDER_NAME', 'Tu Administrativa')
    25	        
    26	        # URL de la aplicación
    27	        self.app_url = 'https://finanzas.tuadministrativa.es'
    28	        
    29	        # Resend API endpoint
    30	        self.resend_url = 'https://api.resend.com/emails'
    31	        
    32	    def send_license_email(self, to_email, buyer_name, license_key):
    33	        """
    34	        Envía el email con la licencia al comprador usando Resend API
    35	        """
    36	        try:
    37	            # Validar configuración
    38	            if not self.resend_api_key:
    39	                logger.error("❌ RESEND_API_KEY no configurada en variables de entorno")
    40	                return False
    41	            
    42	            # Cuerpo del email en HTML
    43	            html_body = self._create_email_body(buyer_name, license_key)
    44	            
    45	            # Cuerpo del email en texto plano (fallback)
    46	            text_body = self._create_text_body(buyer_name, license_key)
    47	            
    48	            # Preparar datos para Resend API
    49	            payload = {
    50	                'from': f'{self.sender_name} <{self.sender_email}>',
    51	                'to': [to_email],
    52	                'subject': '🎉 Tu licencia de Tu Dinero Claro está lista',
    53	                'html': html_body,
    54	                'text': text_body
    55	            }
    56	            
    57	            headers = {
    58	                'Authorization': f'Bearer {self.resend_api_key}',
    59	                'Content-Type': 'application/json'
    60	            }
    61	            
    62	            # Enviar email vía Resend API
    63	            logger.info(f"Enviando email a {to_email} vía Resend API...")
    64	            
    65	            response = requests.post(self.resend_url, json=payload, headers=headers)
    66	            
    67	            if response.status_code == 200:
    68	                logger.info(f"✅ Email enviado exitosamente a {to_email}")
    69	                return True
    70	            else:
    71	                logger.error(f"❌ Error enviando email: {response.status_code} - {response.text}")
    72	                return False
    73	            
    74	        except Exception as e:
    75	            logger.error(f"❌ Error enviando email: {e}", exc_info=True)
    76	            return False
    77	    
    78	    def _create_email_body(self, buyer_name, license_key):
    79	        """Crea el cuerpo del email en HTML (profesional)"""
    80	        return f"""
    81	<!DOCTYPE html>
    82	<html lang="es">
    83	<head>
    84	    <meta charset="UTF-8">
    85	    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    86	    <style>
    87	        body {{
    88	            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    89	            line-height: 1.6;
    90	            color: #333;
    91	            max-width: 600px;
    92	            margin: 0 auto;
    93	            padding: 20px;
    94	            background-color: #f5f5f5;
    95	        }}
    96	        .container {{
    97	            background: white;
    98	            border-radius: 12px;
    99	            padding: 40px;
   100	            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
   101	        }}
   102	        .header {{
   103	            text-align: center;
   104	            margin-bottom: 30px;
   105	        }}
   106	        .header h1 {{
   107	            color: #7c3aed;
   108	            margin: 0;
   109	            font-size: 28px;
   110	        }}
   111	        .license-box {{
   112	            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   113	            color: white;
   114	            padding: 25px;
   115	            border-radius: 10px;
   116	            text-align: center;
   117	            margin: 30px 0;
   118	        }}
   119	        .license-key {{
   120	            font-size: 24px;
   121	            font-weight: bold;
   122	            letter-spacing: 2px;
   123	            margin: 15px 0;
   124	            font-family: 'Courier New', monospace;
   125	            background: rgba(255,255,255,0.2);
   126	            padding: 15px;
   127	            border-radius: 8px;
   128	        }}
   129	        .button {{
   130	            display: inline-block;
   131	            background: #7c3aed;
   132	            color: white;
   133	            padding: 15px 40px;
   134	            text-decoration: none;
   135	            border-radius: 8px;
   136	            font-weight: bold;
   137	            margin: 20px 0;
   138	        }}
   139	        .instructions {{
   140	            background: #f8f9fa;
   141	            padding: 20px;
   142	            border-radius: 8px;
   143	            margin: 20px 0;
   144	        }}
   145	        .instructions ol {{
   146	            margin: 10px 0;
   147	            padding-left: 20px;
   148	        }}
   149	        .instructions li {{
   150	            margin: 10px 0;
   151	        }}
   152	        .features {{
   153	            margin: 20px 0;
   154	        }}
   155	        .feature {{
   156	            margin: 10px 0;
   157	            padding-left: 25px;
   158	        }}
   159	        .footer {{
   160	            text-align: center;
   161	            margin-top: 40px;
   162	            padding-top: 20px;
   163	            border-top: 1px solid #eee;
   164	            color: #666;
   165	            font-size: 14px;
   166	        }}
   167	        .emoji {{
   168	            font-size: 20px;
   169	        }}
   170	    </style>
   171	</head>
   172	<body>
   173	    <div class="container">
   174	        <div class="header">
   175	            <h1>🎉 ¡Bienvenido a Tu Dinero Claro!</h1>
   176	            <p>Hola {buyer_name},</p>
   177	            <p>Tu compra se ha procesado exitosamente. ¡Gracias por confiar en nosotros!</p>
   178	        </div>
   179	        
   180	        <div class="license-box">
   181	            <p style="margin: 0; font-size: 16px;">🔑 TU LICENCIA PERSONAL</p>
   182	            <div class="license-key">{license_key}</div>
   183	            <p style="margin: 0; font-size: 14px;">Guarda esta licencia en un lugar seguro</p>
   184	        </div>
   185	        
   186	        <div style="text-align: center;">
   187	            <a href="{self.app_url}" class="button">🚀 Acceder a la Aplicación</a>
   188	        </div>
   189	        
   190	        <div class="instructions">
   191	            <h3 style="margin-top: 0;">📋 Instrucciones de Activación:</h3>
   192	            <ol>
   193	                <li>Abre <strong><a href="{self.app_url}">{self.app_url}</a></strong> en tu navegador</li>
   194	                <li>Introduce tu licencia cuando aparezca la pantalla de activación</li>
   195	                <li>Crea tu primer perfil con un PIN de 4 dígitos</li>
   196	                <li>¡Empieza a importar tus extractos bancarios y analizar tus finanzas!</li>
   197	            </ol>
   198	        </div>
   199	        
   200	        <div class="features">
   201	            <h3>✨ Características de Tu Dinero Claro:</h3>
   202	            <div class="feature">✅ <strong>100% Privado</strong> - Tus datos NUNCA salen de tu navegador</div>
   203	            <div class="feature">📊 <strong>Análisis Completo</strong> - Gráficos interactivos de ingresos y gastos</div>
   204	            <div class="feature">📁 <strong>Importación Fácil</strong> - Compatible con extractos CSV/Excel de cualquier banco</div>
   205	            <div class="feature">🎯 <strong>Categorización Automática</strong> - Reglas inteligentes personalizables</div>
   206	            <div class="feature">👥 <strong>Multi-Perfil</strong> - Hasta 3 perfiles protegidos con PIN</div>
   207	            <div class="feature">💾 <strong>Exportación</strong> - Descarga tus análisis en formato Excel</div>
   208	        </div>
   209	        
   210	        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
   211	            <strong>💡 Consejo:</strong> Marca este email como importante y guarda tu licencia. La necesitarás cada vez que accedas a la aplicación.
   212	        </div>
   213	        
   214	        <div class="footer">
   215	            <p><strong>¿Necesitas ayuda?</strong></p>
   216	            <p>Responde a este email y te ayudaremos encantados.</p>
   217	            <p style="margin-top: 20px;">
   218	                <strong>{self.sender_name}</strong><br>
   219	                <a href="mailto:{self.sender_email}">{self.sender_email}</a>
   220	            </p>
   221	            <p style="color: #999; font-size: 12px; margin-top: 20px;">
   222	                © {datetime.now().year} Tu Herramienta Digital. Todos los derechos reservados.
   223	            </p>
   224	        </div>
   225	    </div>
   226	</body>
   227	</html>
   228	"""
   229	    
   230	    def _create_text_body(self, buyer_name, license_key):
   231	        """Crea el cuerpo del email en texto plano (fallback)"""
   232	        return f"""
   233	🎉 ¡BIENVENIDO A TU DINERO CLARO!
   234	
   235	Hola {buyer_name},
   236	
   237	Tu compra se ha procesado exitosamente. ¡Gracias por confiar en nosotros!
   238	
   239	🔑 TU LICENCIA PERSONAL:
   240	{license_key}
   241	
   242	Guarda esta licencia en un lugar seguro.
   243	
   244	🚀 ACCEDE A LA APLICACIÓN:
   245	{self.app_url}
   246	
   247	📋 INSTRUCCIONES DE ACTIVACIÓN:
   248	
   249	1. Abre {self.app_url} en tu navegador
   250	2. Introduce tu licencia cuando aparezca la pantalla de activación
   251	3. Crea tu primer perfil con un PIN de 4 dígitos
   252	4. ¡Empieza a importar tus extractos bancarios y analizar tus finanzas!
   253	
   254	✨ CARACTERÍSTICAS:
   255	
   256	✅ 100% Privado - Tus datos NUNCA salen de tu navegador
   257	📊 Análisis Completo - Gráficos interactivos de ingresos y gastos
   258	📁 Importación Fácil - Compatible con extractos CSV/Excel de cualquier banco
   259	🎯 Categorización Automática - Reglas inteligentes personalizables
   260	👥 Multi-Perfil - Hasta 3 perfiles protegidos con PIN
   261	💾 Exportación - Descarga tus análisis en formato Excel
   262	
   263	💡 CONSEJO: Marca este email como importante y guarda tu licencia. 
   264	La necesitarás cada vez que accedas a la aplicación.
   265	
   266	¿NECESITAS AYUDA?
   267	Responde a este email y te ayudaremos encantados.
   268	
   269	---
   270	{self.sender_name}
   271	{self.sender_email}
   272	© {datetime.now().year} Tu Herramienta Digital
   273	"""
   274	
   275	
   276	# Testing (solo se ejecuta si se corre directamente este archivo)
   277	if __name__ == '__main__':
   278	    import sys
   279	    
   280	    print("📧 Sistema de Envío de Emails - Tu Dinero Claro")
   281	    print("=" * 60)
   282	    
   283	    # Verificar configuración
   284	    sender = EmailSender()
   285	    
   286	    print(f"\n📝 Configuración:")
   287	    print(f"   Servidor SMTP: {sender.smtp_server}:{sender.smtp_port}")
   288	    print(f"   Email remitente: {sender.sender_email}")
   289	    print(f"   Nombre remitente: {sender.sender_name}")
   290	    print(f"   Password configurada: {'✅ Sí' if sender.sender_password else '❌ No'}")
   291	    
   292	    if not sender.sender_password:
   293	        print("\n⚠️  ADVERTENCIA: Variable de entorno SENDER_PASSWORD no configurada")
   294	        print("   Exporta la variable antes de usar:")
   295	        print("   export SENDER_PASSWORD='tu_app_password_de_google'")
   296	        sys.exit(1)
   297	    
   298	    # Test de envío (comentado para evitar spam)
   299	    # print("\n🧪 Test de envío:")
   300	    # test_email = input("Email de prueba (Enter para omitir): ").strip()
   301	    # if test_email:
   302	    #     success = sender.send_license_email(
   303	    #         to_email=test_email,
   304	    #         buyer_name="Usuario de Prueba",
   305	    #         license_key="TDC-2025-TEST1"
   306	    #     )
   307	    #     print(f"\n{'✅ Éxito' if success else '❌ Error'}")
   308	
