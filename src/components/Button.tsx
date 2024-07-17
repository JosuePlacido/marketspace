import {
	Button as ButtonNativeBase,
	HStack,
	IButtonProps,
	Text,
	useTheme
} from "native-base";
import {
	ArrowLeft,
	Plus,
	Power,
	Tag,
	Trash,
	WhatsappLogo
} from "phosphor-react-native";

type Props = IButtonProps & {
	title: string;
	variant?: "primary" | "dark" | "default";
	icon?: "plus" | "back" | "store" | "trash" | "power" | "whatsapp";
};

export function Button({ title, variant = "default", icon, ...rest }: Props) {
	const { colors, fontSizes } = useTheme();
	return (
		<ButtonNativeBase
			flex="1"
			flexDirection="row"
			h={14}
			bg={
				variant === "default"
					? "gray.500"
					: variant === "primary"
					? "blueLight"
					: "gray.100"
			}
			rounded="sm"
			_pressed={{
				bg:
					variant === "default"
						? "gray.400"
						: variant === "primary"
						? "blue"
						: "gray.300"
			}}
			{...rest}
		>
			<HStack alignItems="center">
				{icon === "plus" && (
					<Plus
						color={
							variant === "default"
								? colors.gray[100]
								: colors.gray[700]
						}
						size={fontSizes.md}
						style={{ marginRight: 10 }}
					/>
				)}
				{icon === "back" && (
					<ArrowLeft
						color={
							variant === "default"
								? colors.gray[100]
								: colors.gray[700]
						}
						size={fontSizes.md}
						style={{ marginRight: 10 }}
					/>
				)}
				{icon === "store" && (
					<Tag
						color={
							variant === "default"
								? colors.gray[100]
								: colors.gray[700]
						}
						size={fontSizes.md}
						style={{ marginRight: 10 }}
					/>
				)}
				{icon === "trash" && (
					<Trash
						color={
							variant === "default"
								? colors.gray[100]
								: colors.gray[700]
						}
						size={fontSizes.md}
						style={{ marginRight: 10 }}
					/>
				)}
				{icon === "power" && (
					<Power
						color={
							variant === "default"
								? colors.gray[100]
								: colors.gray[700]
						}
						size={fontSizes.md}
						style={{ marginRight: 10 }}
					/>
				)}
				{icon === "whatsapp" && (
					<WhatsappLogo
						color={
							variant === "default"
								? colors.gray[100]
								: colors.gray[700]
						}
						size={fontSizes.md}
						style={{ marginRight: 10 }}
					/>
				)}
				<Text
					color={variant === "default" ? "gray.100" : "gray.700"}
					fontFamily="heading"
					fontSize="sm"
				>
					{title}
				</Text>
			</HStack>
		</ButtonNativeBase>
	);
}
