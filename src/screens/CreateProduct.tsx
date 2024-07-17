import {
	VStack,
	Text,
	Heading,
	ScrollView,
	HStack,
	useTheme,
	Switch,
	Checkbox
} from "native-base";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@components/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { useEffect } from "react";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { ButtonIcon } from "@components/ButtonIcon";
import { PhotoGallery } from "@components/PhotoGallery";
import { Input } from "@components/Input";
import { RadioButton } from "@components/RadioButton";
import { ImageObject, PaymentMethods, ProductDTOEdit } from "@dtos/ProductDTO";
import { api } from "@services/api";

type FormDataProps = {
	name: string;
	description: string;
	pictures: string[];
	picturesFiles?: ImageObject[];
	state: "new" | "used";
	price: number;
	accept_trade: boolean;
	ticket: boolean;
	pix: boolean;
	money: boolean;
	creditcard: boolean;
	deposit: boolean;
	picturesRemoved?: string[];
};

const createProductSchema = yup.object({
	name: yup.string().required("Informe o nome"),
	description: yup.string().required("Informe a descrição"),
	state: yup
		.string()
		.oneOf(["new", "used"], "estado do produto inǘalido")
		.required("Informe o estado do produto"),
	price: yup
		.number()
		.moreThan(0, "o preço não pode ser zero")
		.required("Informe o preço"),
	pictures: yup.array().required("Escolha ao menos uma imagem"),
	acceptTrade: yup.boolean().required("Informe se o aceita troca ou não"),
	ticket: yup.boolean().required(""),
	pix: yup.boolean().required(),
	money: yup.boolean().required(),
	creditcard: yup.boolean().required(),
	deposit: yup
		.boolean()
		.required()
		.test(
			"teste",
			"Pelo menos um método de pagamento deve ser selecionado",
			function (value) {
				const { pix, ticket, money, creditcard } = this.parent;
				return pix || ticket || money || creditcard || value;
			}
		)
});
type ICreateEditProduct = {
	product: ProductDTOEdit;
};

export function CreateProduct() {
	const { user } = useAuth();
	const { colors } = useTheme();
	const route = useRoute();
	const product = route.params
		? (route.params as ICreateEditProduct).product
		: undefined;
	const {
		control,
		handleSubmit,
		setValue,
		reset,
		formState: { errors }
	} = useForm<FormDataProps>({
		defaultValues: {
			name: product?.name || "",
			picturesFiles: product?.pictures || [],
			deposit: product?.deposit || false,
			money: product?.money || false,
			accept_trade: product?.accept_trade || false,
			description: product?.description || "",
			state: product?.is_new ? "new" : "used",
			creditcard: product?.creditcard || false,
			pix: product?.pix || false,
			price: product?.price || undefined,
			ticket: product?.ticket || false
		},
		resolver: yupResolver(createProductSchema)
	});

	const navigation = useNavigation<AppNavigatorRoutesProps>();

	function handleChangePhotos(value: ImageObject[], idRemoved = "") {
		if (idRemoved) {
			if (!control._formValues.picturesRemoved) {
				setValue("picturesRemoved", [idRemoved]);
			} else {
				setValue("picturesRemoved", [
					...control._formValues.picturesRemoved,
					idRemoved
				]);
			}
		}
		setValue(
			"pictures",
			value.map(v => v.uri)
		);
		setValue("picturesFiles", value);
	}

	function handleSubmitCreate({
		state,
		accept_trade,
		description,
		deposit,
		money,
		creditcard,
		pix,
		name,
		price,
		ticket,
		picturesFiles,
		picturesRemoved
	}: FormDataProps) {
		const pm: PaymentMethods[] = [];
		deposit && pm.push({ key: "deposit", name: "Depósito bancário" });
		creditcard && pm.push({ key: "card", name: "Cartão de crédito" });
		pix && pm.push({ key: "pix", name: "Pix" });
		money && pm.push({ key: "cash", name: "Dinheiro" });
		ticket && pm.push({ key: "boleto", name: "Boleto" });
		navigation.navigate("details", {
			product: {
				id: "",
				name,
				product_images: picturesFiles as ImageObject[],
				accept_trade,
				description,
				is_new: state === "new",
				user_id: user.id,
				user: {
					avatar: user.avatar,
					name: user.name,
					tel: ""
				},
				price,
				is_active: true,
				payment_methods: pm,
				picturesRemoved: picturesRemoved || []
			} as ProductDTOEdit,
			mode: "preview"
		});
	}
	function formatNumber(num: number): string {
		let numStr: string = num.toString();
		if (numStr.length < 4) {
			numStr = numStr.padStart(4, "0");
		}
		const formattedNumber: string =
			numStr.slice(0, -2) + "," + numStr.slice(-2);
		return `R$ ${formattedNumber}`;
	}

	function handleBack() {
		navigation.goBack();
	}

	useEffect(() => {
		if (!!product) {
			setValue("accept_trade", product.accept_trade);
			setValue("state", product.is_new ? "new" : "used");
			setValue(
				"pictures",
				product.pictures.map(
					p => `${api.defaults.baseURL}/images/${p.path}`
				)
			);
			setValue("picturesFiles", product.pictures);
		}
	}, []);

	return (
		<ScrollView>
			<VStack flex={1} bgColor="gray.600" px={4} py={12}>
				<HStack
					position="relative"
					alignItems="center"
					justifyContent="center"
					mb={4}
				>
					<ButtonIcon
						icon="BACK"
						bgColor="gray.600"
						left={0}
						position="absolute"
						color={colors.gray[100]}
						onPress={handleBack}
					/>
					<Heading
						color="gray.100"
						fontFamily="heading"
						fontSize="lg"
					>
						{!product?.id ? "Criar anúncio" : "Editar anúncio"}
					</Heading>
				</HStack>
				<Heading
					mt="3"
					fontFamily="heading"
					fontSize="md"
					color="gray.200"
				>
					Imagens
				</Heading>
				<Text mt="1" fontFamily="body" fontSize="sm" color="gray.300">
					Escolha até 3 imagens para mostrar o quando o seu produto é
					incrível!
				</Text>
				<PhotoGallery
					initialValues={product?.pictures || []}
					changePhotos={handleChangePhotos}
					isInvalid={!!errors.pictures}
				/>
				{errors.pictures && (
					<Text fontFamily="body" fontSize="sm" color="red.500">
						{errors.pictures.message}
					</Text>
				)}
				<Heading
					my="3"
					fontFamily="heading"
					fontSize="md"
					color="gray.200"
				>
					Sobre o produto
				</Heading>
				<Controller
					control={control}
					name="name"
					render={({ field: { onChange, value } }) => (
						<Input
							placeholder="Título ao anúncio"
							onChangeText={onChange}
							errorMessage={errors.name?.message}
							value={value}
						/>
					)}
				/>
				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, value } }) => (
						<Input
							placeholder="Descrição do produto"
							textAlignVertical="top"
							onChangeText={onChange}
							errorMessage={errors.description?.message}
							numberOfLines={4}
							value={value}
						/>
					)}
				/>
				<Controller
					control={control}
					name="state"
					render={({ field: { onChange, value } }) => (
						<RadioButton
							data={[
								{ text: "Produto novo", value: "new" },
								{ text: "Produto usado", value: "used" }
							]}
							onChange={onChange}
							errorMessages={errors.state?.message}
							isInvalid={!!errors.state}
							name="state"
							value={value}
						/>
					)}
				/>
				<Heading
					my="3"
					fontFamily="heading"
					fontSize="md"
					color="gray.200"
				>
					Venda
				</Heading>
				<Controller
					control={control}
					name="price"
					render={({ field: { onChange, value } }) => (
						<Input
							placeholder="Valor do produto"
							keyboardType="numeric"
							onChangeText={t =>
								onChange(Number(t.replace(/\D/g, "")))
							}
							isInvalid={!!errors.money}
							errorMessage={errors.price?.message}
							value={!!value ? formatNumber(value) : ""}
						/>
					)}
				/>
				<Heading
					mt="3"
					fontFamily="heading"
					fontSize="sm"
					color="gray.200"
				>
					Aceita troca
				</Heading>
				<Controller
					control={control}
					name="accept_trade"
					render={({ field: { onChange, value } }) => (
						<HStack>
							<Switch
								onTrackColor="blueLight"
								size="lg"
								isChecked={value}
								onChange={() => onChange(!value)}
							/>
						</HStack>
					)}
				/>

				<Heading
					color="gray.200"
					fontSize="sm"
					fontFamily="body"
					mt={4}
				>
					Meios de pagamentos aceitos
				</Heading>
				<Controller
					control={control}
					name="ticket"
					render={({ field: { onChange, value } }) => (
						<Checkbox
							value="ticket"
							size="sm"
							isChecked={value}
							isInvalid={!!errors.deposit?.message}
							_invalid={{
								borderColor: "red.500"
							}}
							onChange={onChange}
							_checked={{
								bgColor: "blueLight",
								borderColor: "blueLight"
							}}
						>
							Boletos
						</Checkbox>
					)}
				/>
				<Controller
					control={control}
					name="pix"
					render={({ field: { onChange, value } }) => (
						<Checkbox
							value="pix"
							size="sm"
							isChecked={value}
							isInvalid={!!errors.deposit?.message}
							_invalid={{
								borderColor: "red.500"
							}}
							onChange={onChange}
							_checked={{
								bgColor: "blueLight",
								borderColor: "blueLight"
							}}
						>
							Pix
						</Checkbox>
					)}
				/>
				<Controller
					control={control}
					name="creditcard"
					render={({ field: { onChange, value } }) => (
						<Checkbox
							tintColor="blue"
							value="creditcard"
							size="sm"
							isChecked={value}
							onChange={onChange}
							isInvalid={!!errors.deposit?.message}
							_invalid={{
								borderColor: "red.500"
							}}
							_checked={{
								bgColor: "blueLight",
								borderColor: "blueLight"
							}}
						>
							Cartão de crédito
						</Checkbox>
					)}
				/>
				<Controller
					control={control}
					name="money"
					render={({ field: { onChange, value } }) => (
						<Checkbox
							tintColor="blue"
							value="red"
							size="sm"
							isChecked={value}
							isInvalid={!!errors.deposit?.message}
							_invalid={{
								borderColor: "red.500"
							}}
							onChange={onChange}
							_checked={{
								bgColor: "blueLight",
								borderColor: "blueLight"
							}}
						>
							Dinheiro
						</Checkbox>
					)}
				/>
				<Controller
					control={control}
					name="deposit"
					render={({ field: { onChange, value } }) => (
						<Checkbox
							tintColor="blue"
							value="deposit"
							size="sm"
							isChecked={value}
							onChange={onChange}
							isInvalid={!!errors.deposit?.message}
							_invalid={{
								borderColor: "red.500"
							}}
							_checked={{
								bgColor: "blueLight",
								borderColor: "blueLight"
							}}
						>
							Depósito bancário
						</Checkbox>
					)}
				/>
				{errors.deposit?.message && (
					<Text color="red.500" fontFamily="body">
						{Object.values(errors)[0].message}
					</Text>
				)}

				<HStack style={{ gap: 10 }} mt={24}>
					<Button title="Cancelar" onPress={() => reset()} />
					<Button
						title="Avançar"
						variant="dark"
						onPress={handleSubmit(handleSubmitCreate)}
					/>
				</HStack>
			</VStack>
		</ScrollView>
	);
}
