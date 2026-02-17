     1	#!/usr/bin/env python3
     2	# -*- coding: utf-8 -*-
     3	"""
     4	Generador de Licencias para Tu Dinero Claro
     5	Implementa el mismo algoritmo que el JavaScript del frontend
     6	Formato: TDC-2025-XXXXX (con checksum)
     7	"""
     8	
     9	import random
    10	import string
    11	
    12	class LicenseGenerator:
    13	    """
    14	    Genera licencias con el formato TDC-2025-XXXXX
    15	    Usa el mismo algoritmo de checksum que js/license.js
    16	    """
    17	    
    18	    def __init__(self):
    19	        self.prefix = "TDC-2025"
    20	        self.chars = string.ascii_uppercase + string.digits  # A-Z, 0-9
    21	        
    22	    def generate(self):
    23	        """
    24	        Genera una licencia válida con checksum
    25	        Retorna: str en formato TDC-2025-XXXXX
    26	        """
    27	        # Generar 4 caracteres aleatorios
    28	        code = ''.join(random.choice(self.chars) for _ in range(4))
    29	        
    30	        # Calcular checksum (mismo algoritmo que JavaScript)
    31	        checksum = self._calculate_checksum(code)
    32	        
    33	        # Añadir checksum al final
    34	        code += checksum
    35	        
    36	        # Retornar licencia completa
    37	        return f"{self.prefix}-{code}"
    38	    
    39	    def _calculate_checksum(self, code):
    40	        """
    41	        Calcula el checksum usando el mismo algoritmo que JavaScript:
    42	        sum = suma de charCodeAt de cada carácter
    43	        checkChar = String.fromCharCode((sum % 26) + 65)
    44	        """
    45	        total = sum(ord(char) for char in code)
    46	        check_char = chr((total % 26) + 65)  # 65 = 'A'
    47	        return check_char
    48	    
    49	    def verify(self, license_key):
    50	        """
    51	        Verifica si una licencia es válida
    52	        Útil para debugging
    53	        """
    54	        # Validar formato
    55	        if not license_key or not isinstance(license_key, str):
    56	            return False
    57	        
    58	        parts = license_key.split('-')
    59	        if len(parts) != 3:
    60	            return False
    61	        
    62	        if parts[0] != 'TDC' or parts[1] != '2025':
    63	            return False
    64	        
    65	        code = parts[2]
    66	        if len(code) != 5:
    67	            return False
    68	        
    69	        # Verificar que todos son alfanuméricos
    70	        if not code.isalnum():
    71	            return False
    72	        
    73	        # Verificar checksum
    74	        base_code = code[:4]
    75	        provided_checksum = code[4]
    76	        expected_checksum = self._calculate_checksum(base_code)
    77	        
    78	        return provided_checksum == expected_checksum
    79	    
    80	    def generate_batch(self, count=10):
    81	        """
    82	        Genera un lote de licencias
    83	        Útil para testing o generación masiva
    84	        """
    85	        licenses = []
    86	        for _ in range(count):
    87	            licenses.append(self.generate())
    88	        return licenses
    89	
    90	
    91	# Testing (solo se ejecuta si se corre directamente este archivo)
    92	if __name__ == '__main__':
    93	    gen = LicenseGenerator()
    94	    
    95	    print("🔑 Generador de Licencias - Tu Dinero Claro")
    96	    print("=" * 50)
    97	    
    98	    # Generar 10 licencias de prueba
    99	    print("\n📝 Generando 10 licencias de prueba:")
   100	    licenses = gen.generate_batch(10)
   101	    for i, lic in enumerate(licenses, 1):
   102	        is_valid = gen.verify(lic)
   103	        status = "✅" if is_valid else "❌"
   104	        print(f"{i:2d}. {lic} {status}")
   105	    
   106	    # Verificar todas son únicas
   107	    unique = len(set(licenses))
   108	    print(f"\n✨ Licencias únicas: {unique}/{len(licenses)}")
   109	    
   110	    # Test de verificación
   111	    print("\n🧪 Test de verificación:")
   112	    valid_key = gen.generate()
   113	    invalid_key = "TDC-2025-FAKE1"
   114	    
   115	    print(f"Válida:   {valid_key} → {gen.verify(valid_key)}")
   116	    print(f"Inválida: {invalid_key} → {gen.verify(invalid_key)}")
   117	
