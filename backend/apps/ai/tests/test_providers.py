from django.test import SimpleTestCase

from apps.ai.providers import get_ai_provider
from apps.ai.providers.mock import MockAIProvider


class AIProviderTests(SimpleTestCase):

    def test_default_provider_is_mock(self):
        provider = get_ai_provider()

        self.assertIsInstance(
            provider,
            MockAIProvider,
        )

        self.assertEqual(
            provider.name,
            "mock",
        )

    def test_mock_provider_returns_content(self):
        provider = MockAIProvider()

        result = provider.generate(
            system_prompt="Tu es Karako.",
            user_prompt="Analyse cette idée.",
        )

        self.assertIsInstance(result, str)
        self.assertTrue(result.strip())