import re


def split_camel_case(text):
    """Split camel case text into words.

    Args:
        text (str): A camel case text.
            Example: "StorageError"

    Returns:
        str: A text with spaces between words.
            Example: "Storage Error"
    """
    return re.sub(r"([a-z])([A-Z])", r"\1 \2", text)


def split_snake_case(text):
    """Split snake case text into words.

    Args:
        text (str): A snake case text.
            Example: "storage_error"

    Returns:
        str: A text with spaces between words.
            Example: "storage error"
    """
    return re.sub(r"([a-z])_([a-z])", r"\1 \2", text)


def check_special_tokens(text):
    """Check if a text consists of special tokens.

    Args:
        text (str): A text.
            Example: "fn"

    Returns:
        bool: True if the text consists of special tokens, False otherwise.
    """
    return re.match(r"^\W+$", text) is not None


def tokenize(text):
    """Tokenize a text by words borders.

    Args:
        text (str): A text.
            Example: "(& mut self , alias : & str)"

    Returns:
        list: A list of tokens.
            Example: ["(", "&", "mut", "self", ",", "alias", ":", "&", "str", ")"]
    """
    tokens = re.split(r"(\W)", text)
    tokens = [token for token in tokens if token != ""]
    return tokens


def clear_signature(signature):
    """Remove special symbols from a function signature.

    Args:
        signature (str): A function signature.
            Example: "fn remove (& mut self , alias : & str) -> Result < Option < String > , StorageError >"

    Returns:
        str: A function signature without special symbols. and proper tokenization.
            Example: "function remove alias str returns Result Option String Storage Error"

    >>> clear_signature("fn remove (& mut self , alias : & str) -> Result < Option < String > , StorageError >")
    'fn remove mut self alias str Result Option String Storage Error'
    """
    tokens = tokenize(signature)
    tokens = (token for token in tokens if not check_special_tokens(token))
    tokens = (token.strip() for token in tokens)
    tokens = (token for token in tokens if token != "")
    tokens = (split_snake_case(split_camel_case(token)) for token in tokens)
    sentence = " ".join(tokens)
    return sentence


def textify(structure):
    """Convert a piece of code structure into a text representation close to natural language.

    Args:
        structure (dict): A piece of code structure.
            Example:
            structure = {
                "name": "remove",
                "signature": "fn remove (& mut self , alias : & str) -> Result < Option < String > , StorageError >",
                "code_type": "Function",
                "docstring": null,
                "line": 75,
                "line_from": 75,
                "line_to": 79,
                "context": {
                    "module": "content_manager",
                    "file_path": "lib/storage/src/content_manager/alias_mapping.rs",
                    "file_name": "alias_mapping.rs",
                    "struct_name": "AliasPersistence",
                    "snippet": "    pub fn remove(&mut self, alias: &str) -> Result<Option<String>, StorageError> {\n        let res = self.alias_mapping.0.remove(alias);\n        self.alias_mapping.save(&self.data_path)?;\n        Ok(res)\n    }\n"
                }
            }

    """
    code_type = structure["code_type"]
    docstring = ""
    if structure["docstring"] is not None:
        docstring = "that does: " + structure["docstring"]

    context = ""
    if structure["context"] is not None:
        context_struct = structure["context"]
        if context_struct["struct_name"] is not None:
            context = f"""{context} in struct {context_struct["struct_name"]} """
        if context_struct["module"] is not None:
            context = f"""{context} in module {context_struct["module"]} """
        if context_struct["file_name"] is not None:
            context = f"""{context} in file {context_struct["file_name"]} """

    name = structure["name"]
    signature = clear_signature(structure["signature"])
    text = f"""{code_type} {name} {docstring} defined as {signature} {context}"""
    return text
