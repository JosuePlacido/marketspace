import {
	Heading,
	HStack,
	useTheme,
	VStack,
	Switch,
	Checkbox,
	Text,
	Modal
} from "native-base";
import * as yup from "yup";
import { Button } from "./Button";
import { TagSelector } from "./TagSelector";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export type FormFilterProps = {
	isNew: boolean;
	acceptTrade: boolean;
	ticket: boolean;
	pix: boolean;
	money: boolean;
	creditcard: boolean;
	deposit: boolean;
};

const filterSchema = yup
	.object({
		isNew: yup.boolean().required("escolha se é novo ou usado"),
		acceptTrade: yup.boolean().required("indique se aceitam trocas"),
		ticket: yup.boolean().required(""),
		pix: yup.boolean().required(),
		money: yup.boolean().required(),
		creditcard: yup.boolean().required(),
		deposit: yup.boolean().required()
	})
	.test(
		"teste",
		"Pelo menos um método de pagamento deve ser selecionado",
		function (value) {
			return (
				value.ticket ||
				value.pix ||
				value.money ||
				value.creditcard ||
				value.deposit
			);
		}
	);
type PropsModal = {
	onApply: (filters: FormFilterProps) => void;
	data: FormFilterProps;
};
export function ModalFilter({ onApply, data }: PropsModal) {
	const { colors } = useTheme();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormFilterProps>({
		defaultValues: data,
		resolver: yupResolver(filterSchema)
	});

	return (
		<VStack mt="auto" width="full" bg={colors.gray[700]} p={6} rounded="xl">
			<Modal.CloseButton />
			<HStack justifyContent="space-between" alignItems="center">
				<Heading fontFamily="heading" fontSize="lg" color="gray.100">
					Filtrar anúncios
				</Heading>
			</HStack>
			<Heading color="gray.200" fontSize="sm" fontFamily="body">
				Condição
			</Heading>

			<Controller
				control={control}
				name="isNew"
				render={({ field: { onChange, value } }) => (
					<TagSelector
						values={[
							{
								description: "USADO",
								selected: value,
								value: "USADO"
							},
							{
								description: "NOVO",
								value: "NOVO",
								selected: !value
							}
						]}
						onChange={() => onChange(!value)}
					/>
				)}
			/>
			<Heading
				mt={4}
				color="gray.200"
				fontSize="sm"
				fontFamily="body"
				fontWeight="bold"
			>
				Aceita troca?
			</Heading>

			<Controller
				control={control}
				name="acceptTrade"
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

			<Heading color="gray.200" fontSize="sm" fontFamily="body" mt={4}>
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
						isInvalid={Object.values(errors).length > 0}
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
						isInvalid={Object.values(errors).length > 0}
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
						value="red"
						size="sm"
						isChecked={value}
						onChange={onChange}
						isInvalid={Object.values(errors).length > 0}
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
						size="sm"
						isChecked={value}
						isInvalid={Object.values(errors).length > 0}
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
						value="deposit"
						size="sm"
						isChecked={value}
						onChange={onChange}
						isInvalid={Object.values(errors).length > 0}
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
			{Object.values(errors).length > 0 && (
				<Text color="red.500" fontFamily="body">
					{Object.values(errors)[0].message}
				</Text>
			)}

			<HStack style={{ gap: 10 }} mt={24}>
				<Button title="Resetar filtros" onPress={() => reset()} />
				<Button
					title="Aplicar filtros"
					variant="dark"
					onPress={handleSubmit(onApply)}
				/>
			</HStack>
		</VStack>
	);
}
