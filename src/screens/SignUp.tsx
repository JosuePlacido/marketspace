import { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { PencilSimpleLine } from "phosphor-react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import {
	VStack,
	Text,
	Center,
	Heading,
	ScrollView,
	useToast,
	Skeleton,
	Button as ButtonNativeBase,
	useTheme,
	View
} from "native-base";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import LogoSvg from "@assets/logo.svg";

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { Controller, useForm } from "react-hook-form";
import { api } from "@services/api";
import AppError from "@utils/AppError";
import { useAuth } from "@hooks/useAuth";
import { UserPhoto } from "@components/UserPhoto";
import defaulUserPhotoImg from "@assets/userPhotoDefault.png";

type FormDataProps = {
	name: string;
	email: string;
	phone: string;
	password: string;
	password_confirm: string;
	avatar: string;
};

const signUpSchema = yup.object({
	name: yup.string().required("Informe o nome"),
	email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
	avatar: yup
		.string()
		.required("Escolha uma foto")
		.notOneOf(["defaulUserPhotoImg"]),
	phone: yup
		.string()
		.matches(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/, "Telefone inválido")
		.required("Informe o telefone"),
	password: yup
		.string()
		.required("Informe a senha")
		.min(6, "A senha deve ter pelo menos 6 dígitos."),
	password_confirm: yup
		.string()
		.required("Confirme a senha.")
		.oneOf([yup.ref("password")], "A confirmação da senha não confere")
});

const PHOTO_SIZE = 33;
export function SignUp() {
	const type_photo = useRef("");
	const [isLoading, setIsLoading] = useState(false);
	const [photoIsLoading, setPhotoIsLoading] = useState(false);
	const { singIn } = useAuth();
	const { colors } = useTheme();
	const toast = useToast();
	const {
		control,
		handleSubmit,
		formState: { errors }
	} = useForm<FormDataProps>({
		resolver: yupResolver(signUpSchema)
	});

	const navigation = useNavigation();

	async function handleUserPhotoSelected(onChange: (avatar: string) => void) {
		setPhotoIsLoading(true);

		try {
			const photoSelected = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 1,
				aspect: [4, 4],
				allowsEditing: true
			});

			if (photoSelected.assets) {
				const photoInfo = await FileSystem.getInfoAsync(
					photoSelected.assets[0].uri
				);
				if (photoInfo.exists) {
					if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
						return toast.show({
							title: "Essa imagem é muito grande. Escolha uma de até 5MB.",
							placement: "top",
							bgColor: "red.500"
						});
					}
				}
				onChange(photoSelected.assets[0].uri);

				const fileExtension = photoSelected.assets[0].uri
					.split(".")
					.pop();
				type_photo.current = `${photoSelected.assets[0].type}/${fileExtension}`;
			}
		} catch (error) {
			console.log(error);
		} finally {
			setPhotoIsLoading(false);
		}
	}

	function handleGoBack() {
		navigation.goBack();
	}

	async function handleSignUp({
		name,
		email,
		password,
		phone,
		avatar
	}: FormDataProps) {
		try {
			setIsLoading(true);
			const fileExtension = avatar.split(".").pop();

			const photoFile = {
				name: `${name}.${fileExtension}`.toLowerCase(),
				uri: avatar,
				type: `${type_photo.current}`
			} as any;

			const userPhotoUploadForm = new FormData();
			userPhotoUploadForm.append("name", name);
			userPhotoUploadForm.append("email", email);
			userPhotoUploadForm.append("password", password);
			userPhotoUploadForm.append("tel", `+55${phone.replace(/\D/g, "")}`);
			userPhotoUploadForm.append("avatar", photoFile);

			await api.post("/users", userPhotoUploadForm, {
				headers: {
					"Content-Type": "multipart/form-data"
				}
			});

			singIn(email, password);
		} catch (error) {
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: "Não foi possível criar a conta. Tente novamente mais tarde";

			toast.show({
				title,
				placement: "top",
				bgColor: "red.500"
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			showsVerticalScrollIndicator={false}
		>
			<VStack flex={1} px={10} pb={16}>
				<Center mt={24} mb={8}>
					<LogoSvg scaleX={0.8} scaleY={0.7} />
					<Heading
						color="gray.100"
						fontSize="lg"
						fontFamily="heading"
						mb={2}
					>
						Boas vindas!
					</Heading>

					<Text color="gray.300" fontSize="sm" textAlign="center">
						Crie sua conta e use o espaço para comprar itens
						variados e vender seus produtos
					</Text>
				</Center>

				<Center mb={10}>
					{photoIsLoading ? (
						<Skeleton
							w={PHOTO_SIZE}
							h={PHOTO_SIZE}
							rounded="full"
							startColor="gray.500"
							endColor="gray.400"
						/>
					) : (
						<Controller
							control={control}
							name="avatar"
							render={({ field: { onChange, value } }) => (
								<View position="relative" mb={4}>
									<UserPhoto
										source={
											value
												? {
														uri: value
												  }
												: defaulUserPhotoImg
										}
										hasError={!!errors.avatar}
										alt="Foto do usuário"
										size={PHOTO_SIZE}
									/>
									{errors.avatar?.message && (
										<Text color="red.500">
											{errors.avatar?.message}
										</Text>
									)}
									<ButtonNativeBase
										borderRadius="full"
										bgColor="blueLight"
										bottom="0"
										right={!!errors.avatar ? 1.5 : -10}
										position="absolute"
										mb={!!errors.avatar ? 6 : 0}
										p={3}
										onPress={() =>
											handleUserPhotoSelected(onChange)
										}
									>
										<PencilSimpleLine
											size={20}
											color={colors.gray[700]}
										/>
									</ButtonNativeBase>
								</View>
							)}
						/>
					)}
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Nome"
								onChangeText={onChange}
								errorMessage={errors.name?.message}
								value={value}
							/>
						)}
					/>
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="E-mail"
								keyboardType="email-address"
								autoCapitalize="none"
								onChangeText={onChange}
								errorMessage={errors.email?.message}
								value={value}
							/>
						)}
					/>
					<Controller
						control={control}
						name="phone"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Telefone"
								keyboardType="phone-pad"
								autoCapitalize="none"
								onChangeText={t =>
									onChange(
										t
											.replace(/\D/g, "")
											.replace(
												/^(\d{2})(\d{5})(\d{4})$/,
												"($1) $2-$3"
											)
									)
								}
								errorMessage={errors.phone?.message}
								value={value}
							/>
						)}
					/>

					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Senha"
								secureTextEntry
								onChangeText={onChange}
								errorMessage={errors.password?.message}
								value={value}
							/>
						)}
					/>

					<Controller
						control={control}
						name="password_confirm"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Confirmar a Senha"
								secureTextEntry
								onChangeText={onChange}
								errorMessage={errors.password_confirm?.message}
								value={value}
								onSubmitEditing={handleSubmit(handleSignUp)}
								returnKeyType="send"
							/>
						)}
					/>
					<Button
						title="Criar"
						mt={4}
						alignSelf="stretch"
						variant="dark"
						onPress={handleSubmit(handleSignUp)}
						isLoading={isLoading}
					/>
				</Center>
				<Center>
					<Text color="gray.100" fontSize="sm" mb={4}>
						Já tem uma conta?
					</Text>
					<Button
						title="Ir para login"
						alignSelf="stretch"
						onPress={handleGoBack}
					/>
				</Center>
			</VStack>
		</ScrollView>
	);
}
