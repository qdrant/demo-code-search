<template>
  <q-page>
    <div class="q-pa-md q-col-gutter-sm items-stretch">
      <div class="row justify-evenly">
        <div class="col-8">
          <h2>Source Code Search</h2>
        </div>
      </div>

      <div class="row justify-evenly">
        <div class="col-10 simple-typeahead">
          <q-input outlined v-model="query" placeholder="Search" color="black" :input-style="{ fontSize: '16pt' }"
            class="input" v-on:keyup.enter="search">
            <template v-slot:append>
              <q-avatar style='width: auto;'>
                <img src="~/assets/logo_no_text.png" alt="Powered by Qdrant" />
              </q-avatar>
            </template>
          </q-input>


          <q-list v-if="showResults" class="q-pa-xs simple-typeahead-list bg-white">
            <q-item clickable v-ripple v-for="result in results" :key="result.title" @click="console.log(result)"
              class="">
              <q-item-section>
                <q-item-label>{{ result.context.module }} / {{ result.context.file_name }}:{{ result.line }} > {{
                  result.context.struct_name
                }} </q-item-label>
                <q-item-label caption>
                  <code>{{ result.signature.slice(0, 100) }}...</code>
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-icon></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="row justify-evenly">
        <div class="col-10">
          <q-list class="q-pa-xs q-margin-md" separator>
            <q-item v-for="result in results" :key="result.title" @click="console.log(result)" class="">
              <q-item-section>
                <q-item-label>
                  {{ result.context.module }} / {{ result.context.file_name }}:{{ result.line }} >
                  {{ result.context.struct_name }}
                </q-item-label>
                <q-item-label>
                  <highlightjs language="rust" :code="'...\n' + result.context.snippet.slice(0, 1000) + '\n...'" />
                </q-item-label>

              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { axios } from "boot/axios";
import { useQuasar } from "quasar";
import hljs from 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";


let fakeData = [
  { "name": "score_internal", "signature": "fn score_internal (& self , point : PointOffsetType , points : & mut dyn Iterator < Item = PointOffsetType > , top : usize ,) -> Vec < ScoredPointOffset >", "code_type": "Function", "block": null, "docstring": null, "line": 301, "line_from": 301, "line_to": 309, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/memmap_vector_storage.rs", "file_name": "memmap_vector_storage.rs", "struct_name": "MemmapVectorStorage < TMetric >", "snippet": "    fn score_internal(\n        &self,\n        point: PointOffsetType,\n        points: &mut dyn Iterator<Item = PointOffsetType>,\n        top: usize,\n    ) -> Vec<ScoredPointOffset> {\n        let vector = self.get_vector(point).unwrap();\n        self.score_points(&vector, points, top)\n    }\n" } },
  { "name": "files", "signature": "fn files (& self) -> Vec < PathBuf >", "code_type": "Function", "block": null, "docstring": null, "line": 311, "line_from": 311, "line_to": 313, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/memmap_vector_storage.rs", "file_name": "memmap_vector_storage.rs", "struct_name": "MemmapVectorStorage < TMetric >", "snippet": "    fn files(&self) -> Vec<PathBuf> {\n        vec![self.vectors_path.clone(), self.deleted_path.clone()]\n    }\n" } },
  { "name": "new", "signature": "fn new (dim : usize) -> ChunkedVectors", "code_type": "Function", "block": null, "docstring": null, "line": 23, "line_from": 23, "line_to": 33, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/chunked_vectors.rs", "file_name": "chunked_vectors.rs", "struct_name": "ChunkedVectors", "snippet": "    pub fn new(dim: usize) -> ChunkedVectors {\n        assert_ne!(dim, 0, \"The vector's dimension cannot be 0\");\n        let vector_size = dim * mem::size_of::<VectorElementType>();\n        let chunk_capacity = max(MIN_CHUNK_CAPACITY, CHUNK_SIZE / vector_size);\n        ChunkedVectors {\n            dim,\n            len: 0,\n            chunk_capacity,\n            chunks: Vec::new(),\n        }\n    }\n" } },
  { "name": "len", "signature": "fn len (& self) -> usize", "code_type": "Function", "block": null, "docstring": null, "line": 35, "line_from": 35, "line_to": 37, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/chunked_vectors.rs", "file_name": "chunked_vectors.rs", "struct_name": "ChunkedVectors", "snippet": "    pub fn len(&self) -> usize {\n        self.len\n    }\n" } },
  { "name": "is_empty", "signature": "fn is_empty (& self) -> bool", "code_type": "Function", "block": null, "docstring": null, "line": 39, "line_from": 39, "line_to": 41, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/chunked_vectors.rs", "file_name": "chunked_vectors.rs", "struct_name": "ChunkedVectors", "snippet": "    pub fn is_empty(&self) -> bool {\n        self.len == 0\n    }\n" } },
  { "name": "get", "signature": "fn get (& self , key : PointOffsetType) -> & [VectorElementType]", "code_type": "Function", "block": null, "docstring": null, "line": 43, "line_from": 43, "line_to": 48, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/chunked_vectors.rs", "file_name": "chunked_vectors.rs", "struct_name": "ChunkedVectors", "snippet": "    pub fn get(&self, key: PointOffsetType) -> &[VectorElementType] {\n        let key = key as usize;\n        let chunk_data = &self.chunks[key / self.chunk_capacity];\n        let idx = (key % self.chunk_capacity) * self.dim;\n        &chunk_data[idx..idx + self.dim]\n    }\n" } },
  { "name": "push", "signature": "fn push (& mut self , vector : & [VectorElementType]) -> PointOffsetType", "code_type": "Function", "block": null, "docstring": null, "line": 50, "line_from": 50, "line_to": 54, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/chunked_vectors.rs", "file_name": "chunked_vectors.rs", "struct_name": "ChunkedVectors", "snippet": "    pub fn push(&mut self, vector: &[VectorElementType]) -> PointOffsetType {\n        let new_id = self.len as PointOffsetType;\n        self.insert(new_id, vector);\n        new_id\n    }\n" } },
  { "name": "insert", "signature": "fn insert (& mut self , key : PointOffsetType , vector : & [VectorElementType])", "code_type": "Function", "block": null, "docstring": null, "line": 56, "line_from": 56, "line_to": 70, "context": { "module": "vector_storage", "file_path": "lib/segment/src/vector_storage/chunked_vectors.rs", "file_name": "chunked_vectors.rs", "struct_name": "ChunkedVectors", "snippet": "    pub fn insert(&mut self, key: PointOffsetType, vector: &[VectorElementType]) {\n        let key = key as usize;\n        self.len = max(self.len, key + 1);\n        while self.chunks.len() * self.chunk_capacity < self.len {\n            self.chunks.push(vec![]);\n        }\n\n        let chunk_data = &mut self.chunks[key / self.chunk_capacity];\n        let idx = (key % self.chunk_capacity) * self.dim;\n        if chunk_data.len() < idx + self.dim {\n            chunk_data.resize(idx + self.dim, 0.);\n        }\n        let data = &mut chunk_data[idx..idx + self.dim];\n        data.copy_from_slice(vector);\n    }\n" } },
]


export default defineComponent({
  name: "IndexPage",

  components: {
    highlightjs: hljsVuePlugin.component
  },

  data: () => ({
    query: "",
    results: [],
    showResults: false,
  }),

  created() {
    // fetch on init
    // this.search();
  },

  methods: {
    async search() {
      const $q = useQuasar();
      try {
        // const response = await axios.get("api/predict", {
        //   params: { query: "test" },
        // });
        // this.result = response.data;
        this.results = fakeData;
        this.showResults = true;
      } catch (e) {
        $q.notify({
          color: "negative",
          position: "top",
          message: "Loading failed: " + e,
          icon: "report_problem",
        });
      }
    },
  },
});
</script>


<style scoped>
.simple-typeahead {
  position: relative;
  z-index: 1;
}

.simple-typeahead .input {
  z-index: 1;
}

.simple-typeahead .simple-typeahead-list {
  position: absolute;
  width: 100%;
  overflow-y: auto;
  z-index: -1;
}
</style>