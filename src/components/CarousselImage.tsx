import { HStack, useTheme, View } from "native-base";
import React, { useRef, useState } from "react";
import { FlatList, ViewToken, Image, Dimensions } from "react-native";

interface Props {
	imagesUrl: {
		id: string;
		photo: string;
	}[];
}

interface ChangeImageProps {
	viewableItems: ViewToken[];
	changed: ViewToken[];
}

const width = Dimensions.get("window").width;

export function ImageSlider({ imagesUrl }: Props) {
	const { colors } = useTheme();
	const [indexView, setIndexView] = useState(0);
	const indexChanged = useRef((info: ChangeImageProps) => {
		listRef.current?.scrollToIndex({
			animated: true,
			index: info.viewableItems[0].index!
		});
		setIndexView(info.viewableItems[0].index!);
	});
	const listRef = useRef<FlatList>(null);

	function changeIndexView(info: ChangeImageProps) {
		listRef.current?.scrollToIndex({
			animated: true,
			index: info.viewableItems[0].index!
		});
		setIndexView(info.viewableItems[0].index!);
	}

	return (
		<View position="relative" flex={1}>
			<FlatList
				ref={listRef}
				data={imagesUrl}
				keyExtractor={item => item.id}
				showsHorizontalScrollIndicator={false}
				horizontal={true}
				onViewableItemsChanged={changeIndexView}
				renderItem={({ item, index }) => (
					<Image
						source={{ uri: item.photo }}
						alt={`imagem de produto ${index + 1}`}
						width={width}
						resizeMode="stretch"
					/>
				)}
			/>
			<HStack
				position="absolute"
				justifyContent="stretch"
				w="full"
				bottom={0}
			>
				{imagesUrl.map((item, index) => (
					<View
						key={item.id}
						bgColor={
							index === indexView
								? `${colors.gray[700]}cc`
								: `${colors.gray[700]}50`
						}
						h={1}
						m={1}
						flex={1}
					/>
				))}
			</HStack>
		</View>
	);
}
