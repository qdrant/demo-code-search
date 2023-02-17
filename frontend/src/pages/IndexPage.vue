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
          <q-input outlined :loading="loading" v-model="query" placeholder="Search" color="black"
            :input-style="{ fontSize: '16pt' }" class="input" v-on:keyup.enter="search">
            <template v-slot:append>
              <q-avatar style='width: auto;'>
                <img src="~/assets/logo_no_text.png" alt="Powered by Qdrant" />
              </q-avatar>
            </template>
          </q-input>


          <q-list v-if="showQuickResults" class="q-pa-xs simple-typeahead-list bg-white">
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
                  {{ result.file }}:{{ result.start_line }} - &nbsp;&nbsp; <q-icon size="xs" name="open_in_news" />
                  <a :href="'https://github.com/qdrant/qdrant/blob/master/' + result.file + '#L' + (result.start_line + 1)"
                    target="_blank">GitHub</a>
                </q-item-label>
                <q-item-label>
                  <highlightjs language="rust" :code="'...\n' + result.code_snippet.slice(0, 1000) + '\n...'" />
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
import { Notify } from 'quasar'

import hljs from 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";


let fakeData = [
  { "code_snippet": "fn estimate_should<F>(\n    estimator: &F,\n    conditions: &[Condition],\n    total: usize,\n) -> CardinalityEstimation", "end_character": 1, "end_line": 127, "file": "lib/segment/src/index/query_estimator.rs", "start_character": 21, "start_line": 123 },
  { "code_snippet": "                let query_cardinality = {\n                    let payload_index = self.payload_index.borrow();\n                    payload_index.estimate_cardinality(condition)\n                };", "end_character": 17, "end_line": 701, "file": "lib/segment/src/segment.rs", "start_character": 40, "start_line": 698 },
  { "code_snippet": "fn estimate_must_not<F>(\n    estimator: &F,\n    conditions: &[Condition],\n    total: usize,\n) -> CardinalityEstimation", "end_character": 1, "end_line": 162, "file": "lib/segment/src/index/query_estimator.rs", "start_character": 23, "start_line": 158 },
  { "code_snippet": "    ) -> Option<CardinalityEstimation> {\n        self.get_payload_field_index()\n            .estimate_cardinality(condition)\n    }", "end_character": 5, "end_line": 167, "file": "lib/segment/src/index/field_index/field_index_base.rs", "start_character": 39, "start_line": 164 },
  { "code_snippet": "    fn cardinality_request(index: &NumericIndex<f64>, query: Range) -> CardinalityEstimation {\n        let estimation = index.range_cardinality(&query);\n\n        let result = index\n            .filter(&FieldCondition::new_range(\"\".to_string(), query))\n            .unwrap()\n            .unique()\n            .collect_vec();\n\n        eprintln!(\"estimation = {:#?}\", estimation);\n        eprintln!(\"result.len() = {:#?}\", result.len());\n        assert!(estimation.min <= result.len());\n        assert!(estimation.max >= result.len());\n        estimation\n    }", "end_character": 5, "end_line": 587, "file": "lib/segment/src/index/field_index/numeric_index.rs", "start_character": 93, "start_line": 573 },
]


export default defineComponent({
  name: "IndexPage",

  components: {
    highlightjs: hljsVuePlugin.component
  },

  data: () => ({
    query: "",
    loading: false,
    results: [],
    showResults: true,
    showQuickResults: false,
  }),

  created() {
    // fetch on init
    // this.search();
  },

  methods: {
    async search() {
      try {
        this.loading = true;
        const response = await axios.get("api/search", {
          params: { query: this.query },
        });
        this.results = response.data.result;
        this.showResults = true;
        this.loading = false;
      } catch (e) {
        this.loading = false;
        Notify.create({
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