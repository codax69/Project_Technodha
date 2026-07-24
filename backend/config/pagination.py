from rest_framework.pagination import LimitOffsetPagination


class StandardResultsSetPagination(LimitOffsetPagination):
    """
    Offset/limit based pagination used across the API.

    Clients can page through results using `?limit=<n>&offset=<n>` query
    params, e.g. `/api/products/?limit=20&offset=40`, or `?page=<n>`.
    """
    default_limit = 10
    max_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'

    def get_offset(self, request):
        offset = request.query_params.get(self.offset_query_param)
        if offset is not None:
            return super().get_offset(request)

        page = request.query_params.get('page')
        if page:
            try:
                page_num = max(1, int(page))
                limit = self.get_limit(request)
                if limit is None:
                    limit = self.default_limit
                return (page_num - 1) * limit
            except (ValueError, TypeError):
                pass

        return super().get_offset(request)

