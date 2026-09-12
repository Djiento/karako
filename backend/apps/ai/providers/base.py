from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):

    @abstractmethod
    def structure_idea(self, title: str, description: str) -> dict[str, Any]:
        pass

    @abstractmethod
    def challenge_idea(
        self,
        title: str,
        description: str,
        problem: str,
        solution: str,
        target: str,
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def summarize(self, content: str) -> dict[str, Any]:
        pass