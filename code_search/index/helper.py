from abc import abstractmethod
from typing import Union, List, Optional

from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModel

import numpy as np
import torch
import re

from code_search.model.unixcoder import UniXcoder


class BaseEmbeddingsProvider:

    @abstractmethod
    def embed_code(
            self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> np.array:
        """Converts code and/or docstring to vector"""


class AutoModelEmbeddingsProvider(BaseEmbeddingsProvider):
    def __init__(
        self,
        model_name: str = "microsoft/codebert-base",
        tokenizer_name: Optional[str] = None,
        max_tokens: int = 512,
    ):
        if tokenizer_name is None:
            tokenizer_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.max_tokens = max_tokens
        self.model_name = model_name

    def embed_code(
        self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> np.array:
        token_ids = self.get_token_ids(code, docstring)[:512]
        context_embeddings = (
            self.model(torch.tensor(token_ids)[None, :])[0].squeeze().detach().numpy()
        )
        if 1 == len(context_embeddings.shape):
            return context_embeddings
        return np.mean(context_embeddings, axis=0)

    def get_token_ids(
        self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> Union[int, List[int]]:
        tokens = self.get_tokens(code, docstring)
        tokens_ids = self.tokenizer.convert_tokens_to_ids(tokens)
        return tokens_ids

    def get_tokens(
        self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> List[str]:
        # Maximum number of tokens has to include the separators used by CodeBERT
        max_tokens = self.max_tokens - 3

        code_tokens = []
        if code is not None:
            code_tokens = self.tokenizer.tokenize(
                code, max_length=max_tokens, truncation=True
            )
        docstring_tokens = []
        if docstring is not None:
            docstring_tokens = self.tokenizer.tokenize(
                docstring, max_length=max_tokens, truncation=True
            )

        # If both code and docstring is provided, we need to cut off some
        # tokens above the limit. Here there preference is to remove the code
        # as it should be longer in general.
        n_code_tokens, n_doc_tokens = (
            min(len(code_tokens), max_tokens),
            min(len(docstring_tokens), max_tokens),
        )
        n_code_tokens -= n_doc_tokens

        # Build all the tokens using some possible separators. The separators
        # are aligned to CodeBERT model, but if a selected transformer does not
        # have them, everything should also work.
        tokens = []
        if hasattr(self.tokenizer, "cls_token"):
            tokens.append(self.tokenizer.cls_token)
        tokens.extend(code_tokens[:n_code_tokens])
        if hasattr(self.tokenizer, "sep_token"):
            tokens.append(self.tokenizer.sep_token)
        tokens.extend(docstring_tokens[:n_doc_tokens])
        if hasattr(self.tokenizer, "eos_token"):
            tokens.append(self.tokenizer.eos_token)
        return tokens

    def __str__(self):
        return self.model_name


class UniXcoderEmbeddingsProvider(BaseEmbeddingsProvider):
    def __init__(self, device: Optional[str] = None):
        default_device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(default_device if device is None else device)
        self.model = UniXcoder("microsoft/unixcoder-base")
        self.model.to(self.device)
        self.model_name = "microsoft/unixcoder-base"

    def embed_code(
        self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> np.array:
        tokens_ids = self.model.tokenize(
            [f"{docstring or ''} {code or ''}"], max_length=512, mode="<encoder-only>"
        )
        source_ids = torch.tensor(tokens_ids).to(self.device)
        _, func_embedding = self.model(source_ids)
        vector = func_embedding.detach().cpu().numpy()[0]
        return vector


class SentenceTransformerEmbeddingsProvider(BaseEmbeddingsProvider):
    camel_case_regex = re.compile(r"([a-z\s])([A-Z])")
    underscore_regex = re.compile(r"([a-z])_([a-z])")
    special_chars_regex = re.compile(r"\(|\)|\{|\}|\<|\>|\[|\]|\&|::|;")
    method_call_regex = re.compile(r"\.([a-z])")
    multiple_white_char_regex = re.compile(r"\s{2,}")

    def __init__(self, sentence_transformer_name: str):
        self.model = SentenceTransformer(sentence_transformer_name)
        self.model_name = sentence_transformer_name

    def embed_code(
        self, code: Optional[str] = None, docstring: Optional[str] = None
    ) -> np.array:
        inputs = []
        if docstring is not None:
            inputs.append(docstring)
        if code is not None:
            inputs.append(code)
        return self.model.encode(self._preprocess_text(" ".join(inputs)))

    def _preprocess_text(self, text: str) -> str:
        text = self.camel_case_regex.sub("\\1 \\2", text)
        text = self.underscore_regex.sub("\\1 \\2", text)
        text = self.special_chars_regex.sub(" ", text)
        text = self.method_call_regex.sub(" \\1", text)
        text = self.multiple_white_char_regex.sub(" ", text)
        return text
