import {
	VStack,
	Text,
	Center,
	Heading,
	useToast,
	HStack,
	FlatList
} from "native-base";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AppError from "@utils/AppError";
import { useRef, useState, useCallback } from "react";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { ButtonIcon } from "@components/ButtonIcon";
import { ProductCard } from "@components/ProductCard";
import { ProductCardDTO } from "@dtos/ProductDTO";
import { SelectInput } from "@components/Select";
import { Loading } from "@components/Loading";

export function MyProducts() {
	const myProducts = useRef<ProductCardDTO[]>();
	const [isLoading, setIsLoading] = useState(false);
	const [filter, setFilter] = useState("all");
	const [viewedProducts, setViewedProducts] = useState<ProductCardDTO[]>([]);
	const toast = useToast();

	const navigation = useNavigation<AppNavigatorRoutesProps>();

	async function loadUserData() {
		try {
			const { data } = await api.get("/users/products");
			myProducts.current = data;
			setViewedProducts(data);
		} catch (error) {
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: "Erro ao buscar seus anúncios";
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

	function handleCreateAd() {
		navigation.navigate("create");
	}

	function handleOpenAd(product: string) {
		navigation.navigate("details", {
			mode: "activable",
			product
		});
	}

	function handleChangeList(newValue: string) {
		setFilter(newValue);
		setViewedProducts(
			newValue === "all"
				? myProducts.current!
				: myProducts.current!.filter(
						p => p.is_active === (newValue === "active")
				  )
		);
	}

	useFocusEffect(
		useCallback(() => {
			loadUserData();
		}, [])
	);

	return (
		<VStack flex={1} bgColor="gray.600" px={8} py={8}>
			<HStack justifyContent="center" position="relative">
				<Heading
					p={2}
					textAlign="center"
					fontFamily="heading"
					fontSize="lg"
				>
					Meus anúncios
				</Heading>
				<ButtonIcon
					icon="PLUS"
					right={0}
					bgColor="gray.600"
					position="absolute"
					onPress={handleCreateAd}
				/>
			</HStack>
			<HStack justifyContent="space-between" alignItems="center" py={2}>
				<Text fontFamily="body" fontSize="sm">
					{myProducts.current?.length} anúncios
				</Text>
				<SelectInput
					variant="outline"
					selectedValue={filter}
					onValueChange={handleChangeList}
					data={[
						{ value: "all", text: "Todos" },
						{ value: "active", text: "Ativos" },
						{ value: "inactive", text: "Inativos" }
					]}
				/>
			</HStack>
			{isLoading ? (
				<Loading />
			) : (
				<FlatList
					data={viewedProducts}
					columnWrapperStyle={{ gap: 10 }}
					numColumns={2}
					keyExtractor={item => item.id}
					renderItem={({ item }) => (
						<ProductCard
							data={item}
							onPress={() => handleOpenAd(item.id)}
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
		</VStack>
	);
}
