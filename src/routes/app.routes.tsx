import {
	BottomTabNavigationProp,
	createBottomTabNavigator
} from "@react-navigation/bottom-tabs";
import { Home } from "@screens/Home";
import { House, SignOut, Tag } from "phosphor-react-native";
import { useTheme } from "native-base";
import { Platform } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { MyProducts } from "@screens/MyProducts";
import { CreateProduct } from "@screens/CreateProduct";
import { Details } from "@screens/Details";
import { ProductDTOEdit } from "@dtos/ProductDTO";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

type AppRoutes = {
	tabs: undefined;
	home: undefined;
	myproducts: undefined;
	logout: undefined;
	create:
		| {
				product: ProductDTOEdit;
		  }
		| undefined;
	details: {
		product: string | ProductDTOEdit;
		mode: "view" | "preview" | "activable";
	};
};

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();
const Stack = createNativeStackNavigator<AppRoutes>();

export function AppRoutes() {
	const { sizes, colors } = useTheme();
	const { signOut } = useAuth();

	const iconSize = sizes[6];

	function Tabs() {
		return (
			<Navigator
				screenOptions={{
					headerShown: false,
					tabBarShowLabel: false,
					tabBarActiveTintColor: colors.gray[200],
					tabBarInactiveTintColor: colors.gray[400],
					tabBarStyle: {
						backgroundColor: colors.gray[700],
						borderTopWidth: 0,
						height: Platform.OS === "android" ? "auto" : 96,
						paddingBottom: sizes[10],
						paddingTop: sizes[6]
					}
				}}
			>
				<Screen
					name="home"
					component={Home}
					options={{
						tabBarIcon: ({ focused, color }) => (
							<House
								color={color}
								weight={focused ? "bold" : "regular"}
							/>
						)
					}}
				/>
				<Screen
					name="myproducts"
					component={MyProducts}
					options={{
						tabBarIcon: ({ focused, color }) => (
							<Tag
								color={color}
								weight={focused ? "bold" : "regular"}
							/>
						)
					}}
				/>
				<Screen
					name="logout"
					component={Home}
					listeners={{
						tabPress: signOut
					}}
					options={{
						tabBarIcon: ({ focused, color }) => (
							<SignOut color={colors.red[500]} size={iconSize} />
						)
					}}
				/>
			</Navigator>
		);
	}

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="tabs" component={Tabs} />
			<Stack.Screen name="create" component={CreateProduct} />
			<Stack.Screen name="details" component={Details} />
		</Stack.Navigator>
	);
}
