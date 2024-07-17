import {
	Heading,
	HStack,
	Image,
	Text,
	VStack,
	View,
	Pressable,
	IPressableProps,
	useTheme
} from "native-base";
import { ProductCardDTO } from "@dtos/ProductDTO";
import { api } from "@services/api";
import { UserPhoto } from "./UserPhoto";

type Props = IPressableProps & {
	data: ProductCardDTO;
};

export function ProductCard({ data, ...rest }: Props) {
	const { colors } = useTheme();

	return (
		<Pressable flex={1} maxW="50%" mb={2} {...rest}>
			<VStack rounded="md">
				<HStack flex={1} rounded="md" position="relative" pb={33}>
					<Image
						source={{
							uri: `${api.defaults.baseURL}/images/${data.product_images[0].path}`
						}}
						alt="Pessoas treinando"
						position="absolute"
						rounded="md"
						bottom="0"
						top="0"
						left="0"
						right="0"
						resizeMode="stretch"
					/>
					{data.user && (
						<UserPhoto
							size={7}
							mr="auto"
							alt="foto do anunciante"
							ml={2}
							mt={2}
							borderColor="gray.700"
							source={{
								uri: `${api.defaults.baseURL}/images/${data.user.avatar}`
							}}
						/>
					)}
					<View
						bgColor={data.is_new ? "blue" : "gray.200"}
						px={4}
						height="container"
						rounded="xl"
						m={2}
						ml="auto"
						mb={12}
					>
						<Text fontSize="sm" fontWeight="bold" color="gray.700">
							{data.is_new ? "NOVO" : "USADO"}
						</Text>
					</View>
					{data.is_active === false && (
						<View
							bgColor={`${colors.gray[100]}77`}
							position="absolute"
							bottom="0"
							top="0"
							left="0"
							right="0"
						>
							<Text
								fontSize="sm"
								fontWeight="bold"
								color="gray.700"
								mx="auto"
								mt="auto"
							>
								ANÚNCIO DESATIVADO
							</Text>
						</View>
					)}
				</HStack>
				<VStack alignItems="flex-start" p={2}>
					<Text
						fontSize="md"
						color={
							data.is_active === false ? "gray.400" : "gray.100"
						}
					>
						{data.name}
					</Text>
					<Heading
						fontSize="lg"
						color={
							data.is_active === false ? "gray.400" : "gray.100"
						}
						fontFamily="heading"
					>
						R$ {(data.price / 100).toFixed(2).replace(".", ",")}
					</Heading>
				</VStack>
			</VStack>
		</Pressable>
	);
}
