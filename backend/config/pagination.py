from rest_framework.pagination import LimitOffsetPagination


class StandardResultsSetPagination(LimitOffsetPagination):
    """
    Offset/limit based pagination used across the API.

    Clients can page through results using `?limit=<n>&offset=<n>` query
    params, e.g. `/api/products/?limit=20&offset=40`.

    - `limit` defaults to `default_limit` when omitted.
    - `limit` is capped at `max_limit` to prevent clients from requesting
      unbounded result sets.
    """
    default_limit = 10
    max_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'
