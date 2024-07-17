import { Image, useToast, HStack, Pressable, useTheme, Box } from "native-base";
import { useAuth } from "@hooks/useAuth";
import { useEffect, useState } from "react";
import { Plus, X } from "phosphor-react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { api } from "@services/api";
import { ImageObject } from "@dtos/ProductDTO";

type ComponentProps = {
	initialValues: ImageObject[];
	changePhotos: (value: ImageObject[], idRemoved?: string) => void;
	isInvalid?: boolean;
};

export function PhotoGallery({
	initialValues,
	changePhotos,
	isInvalid = false
}: ComponentProps) {
	const [photoList, setPhotoList] = useState<ImageObject[]>([]);
	const { user } = useAuth();
	const { colors } = useTheme();
	const toast = useToast();

	async function handleOpenGallery() {
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
				const fileExtension = photoSelected.assets[0].uri
					.split(".")
					.pop();

				const newState = [
					...photoList,
					{
						name: `${user.name}.${fileExtension}`.toLowerCase(),
						uri: photoSelected.assets[0].uri,
						type: `${photoSelected.assets[0].type}/${fileExtension}`
					}
				];
				setPhotoList(newState);
				changePhotos(newState);
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function handleRemoveImage(index: number) {
		const newState = photoList.filter((p, i) => i !== index);
		setPhotoList(newState);
		changePhotos(newState, photoList[index].id);
	}

	useEffect(() => {
		if (initialValues.length > 0) setPhotoList(initialValues);
	}, []);

	return (
		<HStack
			mt="3"
			style={{
				gap: 5,
				borderBottomWidth: isInvalid ? 1 : 0,
				borderBottomColor: colors.red[500]
			}}
			height={100}
		>
			{photoList.map((p, index) => (
				<Box key={p.id || p.uri} position="relative">
					<Image
						size={33}
						alt={p.name || p.id}
						source={{
							uri:
								p.uri ||
								`${api.defaults.baseURL}/images/${p.path}`
						}}
						rounded="md"
					/>
					<Pressable
						position="absolute"
						p={1}
						right={1}
						top={1}
						bgColor="gray.200"
						rounded="full"
						alignItems="center"
						justifyContent="center"
						onPress={() => handleRemoveImage(index)}
					>
						<X color={colors.gray[600]} size={12} />
					</Pressable>
				</Box>
			))}
			{photoList.length < 3 && (
				<Pressable
					bgColor="gray.500"
					width={100}
					rounded="md"
					alignItems="center"
					justifyContent="center"
					onPress={handleOpenGallery}
				>
					<Plus color={colors.gray[400]} size={20} />
				</Pressable>
			)}
		</HStack>
	);
}
