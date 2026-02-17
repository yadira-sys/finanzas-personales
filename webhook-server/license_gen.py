#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Licencias para Tu Dinero Claro
"""

import random
import string

class LicenseGenerator:
    def __init__(self):
        self.prefix = "TDC-2025"
        self.chars = string.ascii_uppercase + string.digits
        
    def generate(self):
        code = ''.join(random.choice(self.chars) for _ in range(4))
        checksum = self._calculate_checksum(code)
        code += checksum
        return f"{self.prefix}-{code}"
    
    def _calculate_checksum(self, code):
        total = sum(ord(char) for char in code)
        check_char = chr((total % 26) + 65)
        return check_char
    
    def verify(self, license_key):
        if not license_key or not isinstance(license_key, str):
            return False
        
        parts = license_key.split('-')
        if len(parts) != 3:
            return False
        
        if parts[0] != 'TDC' or parts[1] != '2025':
            return False
        
        code = parts[2]
        if len(code) != 5:
            return False
        
        if not code.isalnum():
            return False
        
        base_code = code[:4]
        provided_checksum = code[4]
        expected_checksum = self._calculate_checksum(base_code)
        
        return provided_checksum == expected_checksum
