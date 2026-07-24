from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.db import connection
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def health_check(request):
    try:
        connection.ensure_connection()
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    return JsonResponse({
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status
    })


urlpatterns = [
    # API v1 Versioned Endpoints
    path('api/v1/health/', health_check, name='health-check-v1'),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema-v1'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema-v1'), name='swagger-ui-v1'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema-v1'), name='redoc-v1'),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),

    # Legacy Backward-Compatible /api/ Routes
    path('api/health/', health_check, name='health-check'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

