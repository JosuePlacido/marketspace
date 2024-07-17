import { ImageFile } from "./FileImage";

export type ProductCardDTO = {
	id: string;
	name: string;
	price: number;
	is_new: boolean;
	is_active: boolean;
	accept_trade: boolean;
	product_images: ImageObject[];
	payment_methods: PaymentMethods[];
	user_id: string;
	user: { avatar: string; }
};
export type ProductDTOEdit = {
	id: string;
	name: string;
	description: string;
	price: number;
	is_new: boolean;
	user_id: string;
	pictures: ImageObject[];
	user: { avatar: string; name: string, tel: string; }
	payment_methods: PaymentMethods[];
	product_images: ImageObject[];
	accept_trade: boolean;
	ticket: boolean;
	pix: boolean;
	money: boolean;
	creditcard: boolean;
	deposit: boolean;
	is_active: boolean;
	picturesRemoved: string[];
};

export type PaymentMethods = {
	key: "pix" | "boleto" | "cash" | "card" | "deposit";
	name: string;
}

export type ProductImages = {
	id: string;
	path: string;
}

export type ImageObject = {
	name?: string;
	uri?: any;
	type?: string;
	id?: string;
	path?: string;
};
