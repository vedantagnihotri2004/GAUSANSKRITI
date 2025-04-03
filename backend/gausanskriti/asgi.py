"""
ASGI config for gausanskriti project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gausanskriti.settings')

application = get_asgi_application()
