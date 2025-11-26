/**
 * UI Store (Zustand)
 *
 * Global UI state management for modals, sidebars, and other UI elements.
 */

import { create } from 'zustand';

interface UIStore {
  // Mobile menu
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Filters panel (mobile)
  isFiltersPanelOpen: boolean;
  openFiltersPanel: () => void;
  closeFiltersPanel: () => void;
  toggleFiltersPanel: () => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Quick Apply
  quickApplyJobId: string | null;
  openQuickApply: (jobId: string) => void;
  closeQuickApply: () => void;

  // Loading states
  isGlobalLoading: boolean;
  setGlobalLoading: (isLoading: boolean) => void;

  // Toast notifications (lightweight state)
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
  }>;
  addToast: (
    toast: Omit<UIStore['toasts'][0], 'id'>
  ) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Mobile menu
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Filters panel
  isFiltersPanelOpen: false,
  openFiltersPanel: () => set({ isFiltersPanelOpen: true }),
  closeFiltersPanel: () => set({ isFiltersPanelOpen: false }),
  toggleFiltersPanel: () =>
    set((state) => ({ isFiltersPanelOpen: !state.isFiltersPanelOpen })),

  // Modals
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Quick Apply
  quickApplyJobId: null,
  openQuickApply: (jobId) =>
    set({ quickApplyJobId: jobId, activeModal: 'quick-apply' }),
  closeQuickApply: () => set({ quickApplyJobId: null, activeModal: null }),

  // Loading
  isGlobalLoading: false,
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/**
 * Selector hooks
 */
export const useMobileMenu = () =>
  useUIStore((state) => ({
    isOpen: state.isMobileMenuOpen,
    open: state.openMobileMenu,
    close: state.closeMobileMenu,
    toggle: state.toggleMobileMenu,
  }));

export const useFiltersPanel = () =>
  useUIStore((state) => ({
    isOpen: state.isFiltersPanelOpen,
    open: state.openFiltersPanel,
    close: state.closeFiltersPanel,
    toggle: state.toggleFiltersPanel,
  }));

export const useModal = () =>
  useUIStore((state) => ({
    activeModal: state.activeModal,
    open: state.openModal,
    close: state.closeModal,
  }));

export const useQuickApply = () =>
  useUIStore((state) => ({
    jobId: state.quickApplyJobId,
    open: state.openQuickApply,
    close: state.closeQuickApply,
  }));

export const useToasts = () =>
  useUIStore((state) => ({
    toasts: state.toasts,
    add: state.addToast,
    remove: state.removeToast,
  }));
