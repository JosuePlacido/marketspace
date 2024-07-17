import {
	Input as NativeBaseInput,
	IInputProps,
	FormControl
} from "native-base";

type Props = IInputProps & {
	errorMessage?: string | null;
};

export function Input({
	errorMessage = null,
	isInvalid,
	value,
	...rest
}: Props) {
	const invalid = !!errorMessage || isInvalid;
	return (
		<FormControl isInvalid={invalid} mb={4}>
			<NativeBaseInput
				value={value}
				bg="gray.700"
				px={4}
				borderWidth={1}
				borderColor={
					value && value.length > 0 ? "gray.300" : "gray.700"
				}
				fontSize="md"
				color="gray.200"
				fontFamily="body"
				placeholderTextColor="gray.400"
				_focus={{
					bgColor: "gray.700",
					borderColor: "gray.300"
				}}
				isInvalid={invalid}
				_invalid={{
					borderColor: "red.500"
				}}
				{...rest}
			/>

			<FormControl.ErrorMessage _text={{ color: "red.500" }}>
				{errorMessage}
			</FormControl.ErrorMessage>
		</FormControl>
	);
}
