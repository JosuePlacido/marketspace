import {
	VStack,
	Text,
	Center,
	Heading,
	ScrollView,
	useToast,
	View,
	HStack,
	useTheme,
	Badge
} from "native-base";
import { Button } from "@components/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppError from "@utils/AppError";
import { useEffect, useState } from "react";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { UserPhoto } from "@components/UserPhoto";
import { api } from "@services/api";
import { ButtonIcon } from "@components/ButtonIcon";
import { ImageObject, ProductDTOEdit, ProductImages } from "@dtos/ProductDTO";
import { ImageSlider } from "@components/CarousselImage";
import { Linking } from "react-native";
import { PaymentMethodItem } from "@components/PaymentMethodPrint";
import { useAuth } from "@hooks/useAuth";

type IDetailsScreenProps = {
	product: ProductDTOEdit | string;
	mode?: "view" | "preview" | "activable";
};

export function Details() {
	const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const route = useRoute();
	const { product, mode } = route.params as IDetailsScreenProps;
	const [productView, setProductView] = useState<ProductDTOEdit>(
		{} as ProductDTOEdit
	);
	const { colors } = useTheme();
	const { updateAds } = useAuth();
	const toast = useToast();

	const navigation = useNavigation<AppNavigatorRoutesProps>();
	async function handleSubmitCreate() {
		setIsLoadingSubmit(true);
		const bodyRequest = {
			name: productView.name,
			description: productView.description,
			is_new: productView.is_new,
			price: productView.price,
			accept_trade: productView.accept_trade,
			payment_methods: productView.payment_methods.map(pm => pm.key)
		};

		try {
			const { data } = productView.id
				? await api.put(`/products/${productView.id}`, bodyRequest)
				: await api.post("/products/", bodyRequest);
			if (
				data.id ||
				productView.product_images.findIndex(i => !i.id) >= 0
			) {
				const productPhotoUpload = new FormData();
				productPhotoUpload.append("product_id", data.id || product);
				productView.product_images.forEach(
					p => !p.id && productPhotoUpload.append("images", p as any)
				);
				await api.post("/products/images/", productPhotoUpload, {
					headers: {
						"Content-Type": "multipart/form-data"
					}
				});
				if (!productView.id) {
					updateAds(1);
				}
			}

			if (
				productView.picturesRemoved &&
				productView.picturesRemoved.length > 0
			) {
				await api.delete("/products/images/", {
					data: {
						productImagesIds: productView.picturesRemoved
					}
				});
			}

			toast.show({
				title: productView.id
					? "anúncio alterado com sucesso"
					: "anúncio criado com sucesso"
			});
			navigation.navigate("myproducts");
		} catch (error) {
			console.error(error);
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: "Não foi possível criar o anúncio. Tente novamente mais tarde";

			toast.show({
				title,
				placement: "top",
				bgColor: "red.500"
			});
		} finally {
			setIsLoadingSubmit(false);
		}
	}

	async function handleDeleteAd() {
		setIsLoadingSubmit(true);
		try {
			await api.delete(`/products/${productView.id}`);

			toast.show({
				title: "anúncio excluído com sucesso"
			});
			updateAds(-1);
			navigation.navigate("myproducts");
		} catch (error) {
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: "Não foi possível criar o anúncio. Tente novamente mais tarde";

			toast.show({
				title,
				placement: "top",
				bgColor: "red.500"
			});
		} finally {
			setIsLoadingSubmit(false);
		}
	}

	async function handleReactivate() {
		setIsLoadingSubmit(true);
		try {
			await api.patch(`/products/${productView.id}`, {
				is_active: !productView.is_active
			});

			setProductView({
				...productView,
				is_active: !productView.is_active
			});
		} catch (error) {
			const isAppError = error instanceof AppError;
			const title = isAppError
				? error.message
				: "Não foi possível criar o anúncio. Tente novamente mais tarde";

			toast.show({
				title,
				placement: "top",
				bgColor: "red.500"
			});
		} finally {
			setIsLoadingSubmit(false);
		}
	}

	function handleEdit() {
		navigation.navigate("create", {
			product: {
				...productView,
				pictures: productView.product_images,
				money:
					productView.payment_methods.findIndex(
						pm => pm.key === "cash"
					) >= 0,
				deposit:
					productView.payment_methods.findIndex(
						pm => pm.key === "deposit"
					) >= 0,
				creditcard:
					productView.payment_methods.findIndex(
						pm => pm.key === "card"
					) >= 0,
				pix:
					productView.payment_methods.findIndex(
						pm => pm.key === "pix"
					) >= 0,
				ticket:
					productView.payment_methods.findIndex(
						pm => pm.key === "boleto"
					) >= 0
			}!
		});
	}

	function handleBack() {
		navigation.goBack();
	}

	async function handleExternalApp() {
		await Linking.openURL(`https://wa.me/${productView.user.tel}`);
	}

	async function loadProduct() {
		setIsLoading(true);
		try {
			console.log(`/products/${product}`);
			const { data } = await api.get(`/products/${product}`);
			console.log(data);
			setProductView({ ...data, pictures: data.product_images });
		} catch (error) {
			const isAppError = error instanceof AppError;
			const title = isAppError
				? error.message
				: "Não foi possível carregar o produto.";

			toast.show({
				title,
				placement: "top",
				bgColor: "red.500"
			});
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		typeof product === "string" ? loadProduct() : setProductView(product);
	}, []);

	return (
		<VStack flex={1} bgColor="gray.600">
			{mode !== "preview" && (
				<HStack
					alignItems="center"
					justifyContent="space-between"
					pt={8}
					mb={2}
				>
					<ButtonIcon
						icon="BACK"
						bgColor="gray.600"
						color={colors.gray[100]}
						onPress={handleBack}
					/>
					{mode === "activable" && (
						<ButtonIcon
							icon="EDIT"
							bgColor="gray.600"
							color={colors.gray[100]}
							onPress={handleEdit}
						/>
					)}
				</HStack>
			)}

			{mode === "preview" && (
				<Center bgColor="blueLight" pb={2} pt={8}>
					<Heading
						mt="3"
						fontFamily="heading"
						fontSize="md"
						color="gray.700"
					>
						Pré visualização do anúncio
					</Heading>
					<Text
						mt="1"
						fontFamily="body"
						fontSize="sm"
						color="gray.700"
					>
						É assim que seu produto vai aparecer!
					</Text>
				</Center>
			)}
			{!isLoading && productView.product_images && (
				<ScrollView>
					<VStack height={300}>
						<ImageSlider
							imagesUrl={productView.product_images.map(
								(p: ImageObject, i) => {
									return {
										id: p.id || p.name! + i,
										photo:
											p.uri ||
											`${api.defaults.baseURL}/images/${
												(p as ProductImages).path
											}`
									};
								}
							)}
						/>
						{!productView.is_active && (
							<View
								bgColor={`${colors.gray[100]}70`}
								position="absolute"
								left="0"
								right="0"
								top="0"
								bottom="0"
							>
								<Text
									color="gray.700"
									fontFamily="body"
									m="auto"
									fontSize="md"
								>
									ANÚNCIO DESATIVADO
								</Text>
							</View>
						)}
					</VStack>
					<HStack alignItems="center" mb={4} p={2}>
						<UserPhoto
							size={14}
							alt="avatar"
							source={{
								uri: `${api.defaults.baseURL}/images/${productView.user.avatar}`
							}}
							mr={1}
						/>
						<Text fontSize={16} fontWeight="bold">
							{productView.user.name}!
						</Text>
					</HStack>
					<HStack justifyContent="flex-start" px={4}>
						<Badge
							bgColor="gray.500"
							rounded="xl"
							color="gray.200"
							width="auto"
							fontSize="xl"
						>
							{productView.is_new ? "NOVO" : "USADO"}
						</Badge>
					</HStack>
					<HStack
						px={4}
						alignItems="center"
						justifyContent="space-between"
					>
						<Heading
							my="3"
							fontFamily="heading"
							fontSize="md"
							color="gray.200"
						>
							{productView.name}
						</Heading>
						<Text fontSize="lg" fontWeight="bold" color="blueLight">
							<Text fontSize="sm">R$</Text>{" "}
							{(productView.price / 100)
								.toFixed(2)
								.replace(".", ",")}
						</Text>
					</HStack>
					<Text fontSize="sm" color="gray.400" px={4}>
						{productView.description}
					</Text>

					<HStack px={4} alignItems="center" style={{ gap: 10 }}>
						<Heading
							my="3"
							fontFamily="heading"
							fontSize="sm"
							color="gray.200"
						>
							Aceita troca?
						</Heading>
						<Text fontSize="sm">
							{productView.accept_trade ? "Sim" : "Não"}
						</Text>
					</HStack>
					<Heading
						my="3"
						px={4}
						fontFamily="heading"
						fontSize="sm"
						color="gray.200"
					>
						Meios de pagamento?
					</Heading>
					{productView.payment_methods.map(({ key, name }) => (
						<PaymentMethodItem key={key} id={key} name={name} />
					))}
					{mode === "activable" && (
						<VStack style={{ gap: 5 }} m={4}>
							<Button
								icon="power"
								title={`${
									productView.is_active
										? "Desativar"
										: "Reativar"
								} anúncio`}
								variant={
									productView.is_active ? "dark" : "primary"
								}
								onPress={handleReactivate}
								isLoading={isLoading}
							/>
							<Button
								icon="trash"
								title="Excluir anúncio"
								onPress={handleDeleteAd}
								isLoading={isLoadingSubmit}
							/>
						</VStack>
					)}
				</ScrollView>
			)}
			{mode === "preview" && (
				<HStack style={{ gap: 10 }} m={4}>
					<Button
						icon="back"
						title="voltar e editar"
						onPress={handleBack}
					/>
					<Button
						icon="store"
						title="Avançar"
						variant="primary"
						onPress={handleSubmitCreate}
						isLoading={isLoadingSubmit}
					/>
				</HStack>
			)}
			{mode === "view" && (
				<HStack
					bgColor="gray.700"
					alignItems="center"
					style={{ gap: 10 }}
					p={5}
				>
					<Text
						fontSize="xl"
						fontWeight="bold"
						width="40%"
						color="blue"
					>
						<Text fontSize="sm">R$</Text>{" "}
						{(productView.price / 100).toFixed(2).replace(".", ",")}
					</Text>
					<Button
						icon="whatsapp"
						title="Entrar em contato"
						variant="primary"
						onPress={handleExternalApp}
					/>
				</HStack>
			)}
		</VStack>
	);
}
