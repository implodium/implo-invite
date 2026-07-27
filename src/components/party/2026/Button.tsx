import { children, type JSX } from "solid-js";

export type ButtonProps = {
	children: JSX.Element
	fullWidth?: boolean
	disabled?: boolean
	variant?: 'primary' | 'ghost'
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export function Button(props: ButtonProps) {
	const content = children(() => props.children)
	const disabled = () => props.disabled ?? false
	const variantClass = () => {
		switch (props.variant) {
			case 'primary':
				return 'btn-primary'
			case 'ghost':
				return 'btn-ghost'
			default:
				return 'btn-primary'
		}
	}

	return <button class={variantClass()} style={{ width: props.fullWidth ? "100%" : "auto", opacity: disabled() ? '50%' : '100%' }} {...props}>{content()}</button>
}
