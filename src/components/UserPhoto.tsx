import { Image, IImageProps } from "native-base";

type Props = IImageProps & {
	size: number;
	hasError?: boolean;
};

export function UserPhoto({
	size,
	hasError = false,
	borderColor,
	...rest
}: Props) {
	return (
		<Image
			w={size}
			h={size}
			rounded="full"
			borderWidth={2}
			borderColor={
				hasError ? "red.500" : borderColor ? borderColor : "blueLight"
			}
			{...rest}
		/>
	);
}
