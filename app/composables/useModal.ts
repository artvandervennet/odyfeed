export interface ModalState {
	isOpen: Ref<boolean>
	open: () => void
	close: () => void
	toggle: () => void
}

export const useModalState = function (initialState = false): ModalState {
	const isOpen = ref(initialState)

	const open = function () {
		isOpen.value = true
	}

	const close = function () {
		isOpen.value = false
	}

	const toggle = function () {
		isOpen.value = !isOpen.value
	}

	return {
		isOpen,
		open,
		close,
		toggle,
	}
}
