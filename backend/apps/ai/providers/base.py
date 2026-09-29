from abc import ABC, abstractmethod
from typing import Any



from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):
    name = "base"

    @abstractmethod
    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        raise NotImplementedError

    @abstractmethod
    def structure_idea(
        self,
        *,
        title: str,
        description: str,
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def challenge_idea(
        self,
        *,
        title: str,
        description: str,
        problem: str,
        solution: str,
        target: str,
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def summarize(
        self,
        *,
        content: str,
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def chat(
        self,
        *,
        context: str,
        messages: list[dict[str, str]],
    ) -> str:
        raise NotImplementedError
