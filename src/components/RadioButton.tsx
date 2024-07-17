import { HStack, Text, Radio, IRadioGroupProps, useTheme } from "native-base";

type RadioValue = {
	value: string;
	text?: string;
};

type RadioProps = IRadioGroupProps & {
	data: RadioValue[] | string[];
	errorMessages?: string;
};

export function RadioButton({ data, errorMessages, ...rest }: RadioProps) {
	const { colors } = useTheme();
	return (
		<Radio.Group
			defaultValue="1"
			accessibilityLabel="escolha o estado do produto"
			{...rest}
		>
			<HStack alignItems="center" w="full" space={12}>
				{data.map(i => (
					<Radio
						key={typeof i === "string" ? i : i.value}
						value={typeof i === "string" ? i : i.value}
						_icon={{ size: "sm", color: "blueLight" }}
						_checked={{
							borderColor: "blueLight"
						}}
						size="sm"
						my={1}
						isInvalid={rest.isInvalid}
						_invalid={{
							borderColor: colors.red[500]
						}}
					>
						{typeof i === "string" ? i : i.text || i.value}
					</Radio>
				))}
			</HStack>
			{rest.isInvalid && (
				<Text fontFamily="body" fontSize="sm" color="red.500">
					{errorMessages}
				</Text>
			)}
		</Radio.Group>
	);
}
