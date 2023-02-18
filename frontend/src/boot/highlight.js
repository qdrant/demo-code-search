import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';
import hljsVuePlugin from "@highlightjs/vue-plugin";


hljs.registerLanguage('rust', rust);


export default boot(({ app }) => {
    app.use(hljsVuePlugin)
})

