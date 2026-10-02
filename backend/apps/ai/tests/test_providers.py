from django.test import SimpleTestCase

from apps.ai.providers import get_ai_provider
from apps.ai.providers.mock import MockAIProvider
import os
from unittest.mock import patch


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

    def test_default_provider_is_mock(self):
        with patch.dict(
            os.environ,
            {"AI_PROVIDER": "mock"},
            clear=False,
        ):
            provider = get_ai_provider()

        self.assertIsInstance(
            provider,
            MockAIProvider,
        )