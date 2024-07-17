import { HStack, Text } from "native-base";
import {
	Bank,
	Barcode,
	CreditCard,
	Money,
	QrCode
} from "phosphor-react-native";

const ICONSELEMENT: { [key: string]: React.JSX.Element } = {
	pix: <QrCode size={18} />,
	boleto: <Barcode size={18} />,
	cash: <Money size={18} />,
	card: <CreditCard size={18} />,
	deposit: <Bank size={18} />
};

type Props = {
	id: "pix" | "boleto" | "cash" | "card" | "deposit";
	name: string;
};

export function PaymentMethodItem({ id, name }: Props) {
	return (
		<HStack px={4} alignItems="center" style={{ gap: 5 }}>
			{ICONSELEMENT[id]}
			<Text fontSize="sm">{name}</Text>
		</HStack>
	);
}
