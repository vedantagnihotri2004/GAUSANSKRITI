from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError

def health_check_view(request):
    """
    Health check endpoint to verify API and database connectivity
    """
    # Check database connection
    is_database_connected = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except OperationalError:
        is_database_connected = False
    
    return JsonResponse({
        'status': 'online',
        'api_version': '1.0.0',
        'database_connected': is_database_connected,
    })
