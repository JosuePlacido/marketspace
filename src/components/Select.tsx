import { Select, ISelectProps, CheckIcon, Center, Box } from "native-base";

type ItemValue = {
	value: string;
	text: string;
};

type SelectProps = ISelectProps & {
	data: ItemValue[];
};

export function SelectInput({ data, ...rest }: SelectProps) {
	return (
		<Center>
			<Box maxW="300">
				<Select
					minWidth="100"
					_selectedItem={{
						bg: "blue",
						endIcon: <CheckIcon size="5" />
					}}
					mt={1}
					{...rest}
				>
					{data.map(d => (
						<Select.Item
							key={d.value}
							label={d.text}
							value={d.value}
						/>
					))}
				</Select>
			</Box>
		</Center>
	);
}
