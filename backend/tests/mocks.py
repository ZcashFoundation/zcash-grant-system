def mock_request(response):
    def mock_request_func(*args, **kwargs):
        class MockResponse:
            def json(self):
                return {'data': response}

        return MockResponse()

    return mock_request_func
