import {
	VStack,
	Image,
	Text,
	Center,
	Heading,
	ScrollView,
	useToast,
	View
} from "native-base";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import LogoSvg from "@assets/logo.svg";

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import AppError from "@utils/AppError";
import { useState } from "react";

type FormDataProps = {
	email: string;
	password: string;
};

const signIpSchema = yup.object({
	email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
	password: yup.string().required("Informe a senha")
});

export function SignIn() {
	const [isLoading, setIsLoading] = useState(false);
	const { singIn } = useAuth();
	const toast = useToast();
	const {
		control,
		handleSubmit,
		formState: { errors }
	} = useForm<FormDataProps>({
		resolver: yupResolver(signIpSchema)
	});
	const navigation = useNavigation<AuthNavigatorRoutesProps>();

	function handleNewAccount() {
		navigation.navigate("signUp");
	}

	async function handleSignIn({ email, password }: FormDataProps) {
		try {
			setIsLoading(true);
			await singIn(email, password);
		} catch (error) {
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: "Não foi possível entrar. Tente novamente mais tarde.";

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
			<VStack flex={1} bgColor="gray.700">
				<View
					bgColor="gray.500"
					px={10}
					pb={16}
					borderBottomLeftRadius="2xl"
					borderBottomRightRadius="2xl"
				>
					<Center mt={24} mb={8}>
						<LogoSvg />
						<Heading
							color="gray.100"
							fontSize="xl"
							fontFamily="heading"
						>
							marketspace
						</Heading>
						<Text color="gray.300" fontSize="sm" mb={6}>
							Seu espaço de compra e venda
						</Text>
					</Center>

					<Center>
						<Text color="gray.100" fontSize="sm" mb={6}>
							Acesse a conta
						</Text>
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
						<Button
							mt={4}
							title="Acessar"
							variant="primary"
							alignSelf="stretch"
							onPress={handleSubmit(handleSignIn)}
							isLoading={isLoading}
						/>
					</Center>
				</View>
				<Center px={10} pt={10}>
					<Text color="gray.7" fontSize="sm" mb={3} fontFamily="body">
						Ainda não tem acesso?
					</Text>
					<Button
						title="Criar Conta"
						alignSelf="stretch"
						onPress={handleNewAccount}
					/>
				</Center>
			</VStack>
		</ScrollView>
	);
}
