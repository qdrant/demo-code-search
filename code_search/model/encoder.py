from typing import Optional, List
from .unixcoder import UniXcoder

import torch


class UniXcoderEmbeddingsProvider:
    def __init__(self, device: Optional[str] = None):
        default_device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(default_device if device is None else device)
        self.model = UniXcoder("microsoft/unixcoder-base")
        self.model.to(self.device)
        self.model_name = "microsoft/unixcoder-base"

    def embed_code(
        self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> List[float]:
        tokens_ids = self.model.tokenize(
            [f"{docstring or ''} {code or ''}"], max_length=512, mode="<encoder-only>"
        )
        source_ids = torch.tensor(tokens_ids).to(self.device)
        _, func_embedding = self.model(source_ids)
        vector = func_embedding.detach().cpu().numpy()[0]
        return vector.tolist()
