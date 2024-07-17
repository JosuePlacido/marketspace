import {
	ArrowLeft,
	Faders,
	MagnifyingGlass,
	PencilLine,
	PencilSimpleLine,
	Plus,
	X
} from "phosphor-react-native";
import { Button, IButtonProps, useTheme } from "native-base";

type Props = IButtonProps & {
	icon?: "FILTER" | "SEARCH" | "X" | "BACK" | "PLUS" | "EDIT";
};

export function ButtonIcon({ icon = "FILTER", ...rest }: Props) {
	const { colors } = useTheme();
	const ICONS: { [id: string]: React.JSX.Element } = {
		FILTER: (
			<Faders
				size={24}
				color={(rest.color as string) || colors.gray[200]}
			/>
		),
		SEARCH: (
			<MagnifyingGlass
				size={24}
				color={(rest.color as string) || colors.gray[200]}
			/>
		),
		X: <X size={24} color={(rest.color as string) || colors.gray[200]} />,
		BACK: (
			<ArrowLeft
				size={24}
				color={(rest.color as string) || colors.gray[200]}
			/>
		),
		PLUS: (
			<Plus
				size={24}
				color={(rest.color as string) || colors.gray[200]}
			/>
		),
		EDIT: (
			<PencilSimpleLine
				size={24}
				color={(rest.color as string) || colors.gray[200]}
			/>
		)
	};
	return (
		<Button
			bg={rest.bg || "gray.700"}
			rounded={rest.rounded || "sm"}
			_pressed={
				rest._pressed || {
					bg: "gray.600"
				}
			}
			{...rest}
		>
			{ICONS[icon]}
		</Button>
	);
}
