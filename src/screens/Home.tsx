import {
	VStack,
	Text,
	Modal,
	Center,
	useToast,
	HStack,
	Pressable,
	useTheme,
	Input,
	FlatList
} from "native-base";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@hooks/useAuth";
import AppError from "@utils/AppError";
import { useEffect, useRef, useState } from "react";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { UserPhoto } from "@components/UserPhoto";
import { api } from "@services/api";
import { ArrowRight, Tag } from "phosphor-react-native";
import { ButtonIcon } from "@components/ButtonIcon";
import { ProductCard } from "@components/ProductCard";
import { FormFilterProps, ModalFilter } from "@components/ModalFilter";
import { Loading } from "@components/Loading";
import { ProductCardDTO } from "@dtos/ProductDTO";
type filters = FormFilterProps & {
	query?: string;
};
export function Home() {
	const filtersConfigured = useRef<filters>({
		query: "",
		isNew: true,
		acceptTrade: false,
		ticket: true,
		pix: true,
		money: true,
		creditcard: true,
		deposit: true
	});
	const { user } = useAuth();
	const { colors, fontSizes } = useTheme();
	const toast = useToast();

	const [modalVisible, setModalVisible] = useState(false);
	const [products, setProducts] = useState<ProductCardDTO[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const navigation = useNavigation<AppNavigatorRoutesProps>();

	function handleMyProducts() {
		navigation.navigate("myproducts");
	}

	function handleCreateAnnouncer() {
		navigation.navigate("create");
	}

	async function handleSearch() {
		setIsLoading(true);
		try {
			const pm = [];
			filtersConfigured.current.deposit && pm.push("deposit");
			filtersConfigured.current.creditcard && pm.push("card");
			filtersConfigured.current.pix && pm.push("pix");
			filtersConfigured.current.money && pm.push("cash");
			filtersConfigured.current.ticket && pm.push("boleto");
			const { data } = await api.get("/products", {
				params: {
					is_new: filtersConfigured.current.isNew,
					accept_trade: filtersConfigured.current.acceptTrade,
					query: filtersConfigured.current.query,
					payment_methods: pm
				}
			});
			setProducts(data);
		} catch (error) {
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: "Erro ao buscar anúncios";
			console.error(error);

			toast.show({
				title,
				placement: "top",
				bgColor: "red.500"
			});
		} finally {
			setIsLoading(false);
		}
	}

	function handleOpenFilters() {
		setModalVisible(true);
	}

	function handleAplyuFilters(filters: FormFilterProps) {
		filtersConfigured.current = filters;
		setModalVisible(false);
		handleSearch();
	}
	function handleProductDetails(product: string) {
		navigation.navigate("details", { product, mode: "view" });
	}

	useEffect(() => {
		handleSearch();
	}, []);

	return (
		<VStack flex={1} bgColor="gray.600" px={8} py={12}>
			<HStack alignItems="center" mb={4}>
				<UserPhoto
					size={14}
					alt="avatar"
					source={{
						uri: `${api.defaults.baseURL}/images/${user.avatar}`
					}}
					mr={1}
				/>
				<VStack width="container" mx={2}>
					<Text fontSize={16}>Boas vindas</Text>
					<Text fontSize={16} fontWeight="bold">
						{user.name}!
					</Text>
				</VStack>
				<Button
					title="Criar anúncio"
					w="container"
					variant="dark"
					icon="plus"
					onPress={handleCreateAnnouncer}
				/>
			</HStack>
			<Text color="gray.300" fontSize="sm" mb={3} fontFamily="body">
				Seus produtos anunciados para venda
			</Text>
			<Pressable onPress={handleMyProducts} mb={6}>
				<HStack
					bgColor={`${colors.blue}40`}
					px={6}
					py={2}
					alignItems="center"
					borderRadius="xl"
				>
					<Tag color={colors.blue[500]} />
					<VStack mx="auto">
						<Text
							fontSize="xl"
							color="gray.200"
							fontWeight="bold"
							fontFamily="body"
						>
							{user.ads}
						</Text>
						<Text fontSize="sm" color="gray.200" fontFamily="body">
							anúncios ativos
						</Text>
					</VStack>
					<Text
						fontSize="sm"
						color="blue"
						fontWeight="bold"
						fontFamily="body"
						mr={2}
					>
						meus anúncios
					</Text>
					<ArrowRight color={colors.blue[500]} size={fontSizes.md} />
				</HStack>
			</Pressable>
			<Text color="gray.300" fontSize="sm" mb={3} fontFamily="body">
				Compre produtos variados
			</Text>
			<HStack bgColor="gray.700" alignItems="center" mb={3}>
				<Input
					placeholder="Buscar anúncio"
					flex="1"
					borderWidth="0"
					value={filtersConfigured.current?.query}
					onChangeText={t => (filtersConfigured.current!.query = t)}
				/>
				<ButtonIcon icon="SEARCH" onPress={handleSearch} />
				<Text color="gray.400">|</Text>
				<ButtonIcon icon="FILTER" onPress={handleOpenFilters} />
			</HStack>
			{isLoading ? (
				<Loading />
			) : (
				<FlatList
					data={products}
					columnWrapperStyle={{ gap: 10 }}
					numColumns={2}
					keyExtractor={item => item.id}
					renderItem={({ item }) => (
						<ProductCard
							data={item}
							onPress={() => handleProductDetails(item.id)}
						/>
					)}
					ListEmptyComponent={() => (
						<Center>
							<Text color="gray.300" textAlign="center">
								Parece que nenhum produto com esses filtros foi
								anunciado acima!
							</Text>
						</Center>
					)}
				/>
			)}
			<Modal
				isOpen={modalVisible}
				onClose={() => {
					setModalVisible(false);
				}}
				p="0"
				size="xl"
			>
				<ModalFilter
					data={filtersConfigured.current}
					onApply={handleAplyuFilters}
				/>
			</Modal>
		</VStack>
	);
}
