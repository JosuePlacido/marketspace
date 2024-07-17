import { Heading, HStack, Box, Pressable, IPressableProps } from "native-base";
import { X } from "phosphor-react-native";

type ItemTag = IPressableProps & {
	description: string;
	value: string;
	selected?: boolean;
};
type ITagSelectorProps = {
	values: ItemTag[];
	onChange: () => void;
};
export function TagSelector({ values, onChange, ...rest }: ITagSelectorProps) {
	return (
		<HStack alignItems="center" py={2} style={{ gap: 4 }}>
			{values.map(v => (
				<Pressable
					key={v.value}
					flexDirection="row"
					rounded="full"
					p={2}
					bgColor={v.selected ? "blueLight" : "gray.500"}
					onPress={onChange}
					{...rest}
				>
					<HStack alignItems="center">
						<Heading
							fontSize="xs"
							fontFamily="heading"
							color={v.selected ? "gray.700" : "gray.200"}
						>
							{v.description}
						</Heading>
						{v.selected && (
							<Box rounded="full" bgColor="gray.700" ml={2}>
								<X color="blueLight" size={12} weight="bold" />
							</Box>
						)}
					</HStack>
				</Pressable>
			))}
		</HStack>
	);
}
