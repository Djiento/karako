from django.test import SimpleTestCase

from apps.ai.providers.mock import MockAIProvider


class MockProviderTests(SimpleTestCase):

    def test_generate_returns_response(self):

        provider = MockAIProvider()

        result = provider.generate(
            system_prompt="Tu es un assistant.",
            user_prompt="Bonjour",
        )

        self.assertIsInstance(
            result,
            str,
        )

        self.assertTrue(result)