import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface EditorState {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  removeTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  updateTabTitle: (id: string, title: string) => void;
  setActiveTab: (id: string) => void;
  getActiveTab: () => Tab | undefined;
}

const DEFAULT_CONTENT = `# 🧮 Markdown + LaTeX

Escribe Markdown con **fórmulas matemáticas**:

Inline: $E = mc^2$

Block:
$$
\\int_{0}^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}
$$

Y también tablas y listas:
- React
- Markdown
- KaTeX
`;

const createNewTab = (index: number): Tab => ({
  id: `tab-${Date.now()}-${Math.random()}`,
  title: `Documento ${index}`,
  content: DEFAULT_CONTENT,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      tabs: [createNewTab(1)],
      activeTabId: '',
      
      addTab: () => {
        const newTab = createNewTab(get().tabs.length + 1);
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },
      
      removeTab: (id: string) => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return; // No eliminar el último tab
        
        const filteredTabs = tabs.filter((tab) => tab.id !== id);
        let newActiveId = activeTabId;
        
        if (activeTabId === id) {
          const removedIndex = tabs.findIndex((tab) => tab.id === id);
          newActiveId = filteredTabs[Math.max(0, removedIndex - 1)]?.id || filteredTabs[0]?.id || '';
        }
        
        set({
          tabs: filteredTabs,
          activeTabId: newActiveId,
        });
      },
      
      updateTabContent: (id: string, content: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id
              ? { ...tab, content, updatedAt: Date.now() }
              : tab
          ),
        }));
      },
      
      updateTabTitle: (id: string, title: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id
              ? { ...tab, title, updatedAt: Date.now() }
              : tab
          ),
        }));
      },
      
      setActiveTab: (id: string) => {
        set({ activeTabId: id });
      },
      
      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((tab) => tab.id === activeTabId) || tabs[0];
      },
    }),
    {
      name: 'markdown-editor-storage',
      onRehydrateStorage: () => (state) => {
        // Asegurar que hay un tab activo después de recargar
        if (state && (!state.activeTabId || !state.tabs.find(t => t.id === state.activeTabId))) {
          state.activeTabId = state.tabs[0]?.id || '';
        }
      },
    }
  )
);
