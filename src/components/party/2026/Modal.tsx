import type { JSX } from "astro/jsx-runtime";
import type { DOMElement } from "solid-js/jsx-runtime";

export function Modal(props: { show: boolean, children?: JSX.Element, onVisibilityChange?: (visible: boolean) => void }) {
	function onBackdropClicked(e: MouseEvent & {
		currentTarget: HTMLDivElement;
		target: DOMElement;
	}) {
		if (e.target !== e.currentTarget) return
		props.onVisibilityChange?.(false)
	}

	return <div class="modal-backdrop" onclick={onBackdropClicked} classList={{ 'modal-open': props.show }}>
		<div class="modal" classList={{ 'modal-open': props.show }}>
			{ props.children }
		</div>
	</div>
}
