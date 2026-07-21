import type { JSX } from "astro/jsx-runtime";

export function Modal(props: { show: boolean, children?: JSX.Element  }) {
	return <div class="modal" classList={{ 'modal-open': props.show }}>
		{ props.children }
	</div>
}
