<template>
  <div class="note-editor flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 bg-surface-900 rounded-t-lg border border-border">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-primary">
          <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-text-primary">Noten Editor</span>
      </div>
      <div class="flex items-center gap-3 text-xs text-text-muted">
        <span>{{ store.noteCount }} Noten</span>
        <span v-if="store.metadata.targetLength">{{ store.metadata.targetLength }}</span>
      </div>
    </div>

    <!-- Editor -->
    <div ref="editorContainer" class="flex-1 min-h-0 border border-t-0 border-border rounded-b-lg overflow-hidden"></div>

    <!-- Error Message -->
    <div v-if="store.error" class="mt-2 flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/50 rounded-lg text-sm text-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ store.error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, Decoration, ViewPlugin, DecorationSet, ViewUpdate } from '@codemirror/view'
import { EditorState, Compartment, RangeSetBuilder } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { usePianoBotStore } from '@store/index'

const store = usePianoBotStore()
const editorContainer = ref<HTMLElement | null>(null)
let editorView: EditorView | null = null
const themeCompartment = new Compartment()

// Decoration marks for piano notation
const bracketMark = Decoration.mark({ class: 'pm-bracket' })
const pauseMark = Decoration.mark({ class: 'pm-pause' })
const highNoteMark = Decoration.mark({ class: 'pm-high-note' })
const lowNoteMark = Decoration.mark({ class: 'pm-low-note' })
const numberMark = Decoration.mark({ class: 'pm-number' })

// Piano notation highlighter plugin
function pianoNotationHighlighter(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc.toString()
  let inChord = false

  for (let i = 0; i < doc.length; i++) {
    const char = doc[i]

    if (char === '[' || char === '{') {
      builder.add(i, i + 1, bracketMark)
      inChord = true
    } else if (char === ']' || char === '}') {
      builder.add(i, i + 1, bracketMark)
      inChord = false
    } else if (char === '|') {
      builder.add(i, i + 1, pauseMark)
    } else if (inChord) {
      // Inside chord - highlight each character
      if (/[A-Z!@#$%^&*()]/.test(char)) {
        builder.add(i, i + 1, highNoteMark)
      } else if (/[0-9]/.test(char)) {
        builder.add(i, i + 1, numberMark)
      } else if (/[a-z]/.test(char)) {
        builder.add(i, i + 1, lowNoteMark)
      }
    } else {
      // Single notes outside chords
      if (/[A-Z!@#$%^&*()]/.test(char)) {
        builder.add(i, i + 1, highNoteMark)
      } else if (/[0-9]/.test(char)) {
        builder.add(i, i + 1, numberMark)
      } else if (/[a-z]/.test(char)) {
        builder.add(i, i + 1, lowNoteMark)
      }
    }
  }

  return builder.finish()
}

const pianoHighlightPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = pianoNotationHighlighter(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = pianoNotationHighlighter(update.view)
    }
  }
}, {
  decorations: v => v.decorations
})

// Custom theme
const pianoTheme = EditorView.theme({
  '&': {
    backgroundColor: '#171717',
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-content': {
    padding: '12px',
    caretColor: '#8B5CF6',
  },
  '.cm-cursor': {
    borderLeftColor: '#8B5CF6',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  '.cm-gutters': {
    backgroundColor: '#0F0F0F',
    color: '#6B7280',
    border: 'none',
    borderRight: '1px solid #333333',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1A1A1A',
    color: '#A1A1A1',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '&.cm-focused': {
    outline: 'none',
  },
}, { dark: true })

// Update listener
const updateListener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const content = update.state.doc.toString()
    store.setNotes(content)
  }
})

function createEditor() {
  if (!editorContainer.value) return

  const startState = EditorState.create({
    doc: store.notes || '',
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      themeCompartment.of(pianoTheme),
      pianoHighlightPlugin,
      updateListener,
      EditorView.lineWrapping,
    ],
  })

  editorView = new EditorView({
    state: startState,
    parent: editorContainer.value,
  })
}

function updateEditorContent(content: string) {
  if (!editorView) return

  const currentContent = editorView.state.doc.toString()
  if (currentContent !== content) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: currentContent.length,
        insert: content,
      },
    })
  }
}

// Watch for external changes (e.g., from file load)
watch(() => store.notes, (newNotes) => {
  if (editorView) {
    const currentContent = editorView.state.doc.toString()
    if (currentContent !== newNotes) {
      updateEditorContent(newNotes)
    }
  }
})

onMounted(() => {
  createEditor()
})

onUnmounted(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})
</script>

<style>
.note-editor .cm-editor {
  height: 100%;
}

.note-editor .cm-scroller {
  overflow: auto;
}

/* Piano notation syntax highlighting */
.pm-bracket {
  color: #F472B6;
  font-weight: bold;
}

.pm-pause {
  color: #FB923C;
  font-weight: bold;
}

.pm-high-note {
  color: #22D3EE;
  font-weight: 600;
}

.pm-low-note {
  color: #A78BFA;
}

.pm-number {
  color: #FBBF24;
}
</style>
