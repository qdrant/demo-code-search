<template>
    <q-page>
        <div class="q-pa-md q-col-gutter-sm items-stretch">
            <div class="row justify-evenly">
                <div class="col-8">
                    <h2>About This Demo</h2>
                    <p>
                        This demo is a simple example of how to perform a Semantic Search over a code repository using
                        Qdrant and pre-trained models from Hugging Face.
                    </p>
                    <p>
                        For this demo we used source code of Qdrant vector search engine. You can find the code on GitHub:
                        <a href="https://github.com/qdrant/qdrant" target="_blank">https://github.com/qdrant/qdrant</a>.
                    </p>
                    <p>
                        This demo uses a combination of two models from Hugging Face:
                    </p>
                    <ul>
                        <li>
                            <a href="https://huggingface.co/microsoft/unixcoder-base" target="_blank">
                                microsoft/unixcoder-base
                            </a>
                            - unified cross-modal pre-trained model that leverages multimodal data (i.e. code comment and
                            AST) to pretrain code representation. We use it to extract embeddigns from pieces of code.
                        </li>
                        <li>
                            <a href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2" target="_blank">
                                sentence-transformers/all-MiniLM-L6-v2
                            </a>
                            - a general-purpose encoder, it maps sentences & paragraphs to a 384 dimensional dense vector
                            space and can be used for tasks like clustering or semantic search.
                            We use it to encode function definitions and comments.
                        </li>
                    </ul>
                    <p>
                        Outputs of both models are uploaded to Qdrant as embeddings. Then, we perform a semantic search
                        over those two collections and combine results.
                        Function bodies are obtained from the vector search over function signatiures and docstrings.
                        Matching code blocks are highlighted inside the function body.
                    </p>


                    <p>
                        Source code of this demo is available on GitHub: <a
                            href="https://github.com/qdrant/demo-code-search">https://github.com/qdrant/demo-code-search</a>
                    </p>

                    <br />

                    <q-btn label="Back to Search" color="primary" outline to="/" />
                </div>
            </div>

        </div>
    </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "AboutPage",
});
</script>