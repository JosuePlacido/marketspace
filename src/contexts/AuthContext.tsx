import { createContext, ReactNode, useEffect, useState } from "react";
import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import {
	storageUserGet,
	storageUserRemove,
	storageUserSave
} from "@storage/storageUser";
import {
	storageAuthTokenGet,
	storageAuthTokenRemove,
	storageAuthTokenSave
} from "@storage/storageAuthToken";

export type AuthContextDataProps = {
	user: UserDTO;
	singIn: (email: string, password: string) => void;
	updateAds: (count: number) => Promise<void>;
	signOut: () => Promise<void>;
	isLoadingUserStorageData: boolean;
};
type AuthContextProviderProps = {
	children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
	{} as AuthContextDataProps
);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [user, setUser] = useState<UserDTO>({} as UserDTO);
	const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
		useState(true);

	async function userAndTokenUpdate(userData: UserDTO, token: string) {
		api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		try {
			const { data } = await api.get("/users/products");
			userData.ads = data.length;
		} catch (error) {
			throw error;
		}
		setUser(userData);
	}

	async function storageUserAndTokenSave(
		userData: UserDTO,
		token: string,
		refresh_token: string
	) {
		try {
			setIsLoadingUserStorageData(true);

			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			setIsLoadingUserStorageData(true);
			await storageUserSave(userData);
			await storageAuthTokenSave({ token, refresh_token });
		} catch (error) {
			throw error;
		} finally {
			setIsLoadingUserStorageData(false);
		}
	}

	async function singIn(email: string, password: string) {
		try {
			const { data } = await api.post("/sessions", { email, password });

			if (data.user && data.token && data.refresh_token) {
				await storageUserAndTokenSave(
					data.user,
					data.token,
					data.refresh_token
				);
				await userAndTokenUpdate(data.user, data.token);
			}
		} catch (error) {
			throw error;
		} finally {
			setIsLoadingUserStorageData(false);
		}
	}

	async function loadUserData() {
		try {
			setIsLoadingUserStorageData(true);

			const userLogged = await storageUserGet();
			const { token } = await storageAuthTokenGet();

			if (token && userLogged) {
				await userAndTokenUpdate(userLogged, token);
			}
		} catch (error) {
			throw error;
		} finally {
			setIsLoadingUserStorageData(false);
		}
	}

	async function signOut() {
		try {
			setIsLoadingUserStorageData(true);
			setUser({} as UserDTO);
			await storageUserRemove();
			await storageAuthTokenRemove();
		} catch (error) {
			throw error;
		} finally {
			setIsLoadingUserStorageData(false);
		}
	}
	async function updateAds(count: number) {
		try {
			const userUpdated = user;
			userUpdated.ads += count;
			setUser(userUpdated);
			await storageUserSave(userUpdated);
		} catch (error) {
			throw error;
		}
	}

	useEffect(() => {
		loadUserData();
	}, []);

	useEffect(() => {
		const subscribe = api.registerInterceptTokenManager(signOut);
		return () => {
			subscribe();
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				singIn,
				updateAds,
				isLoadingUserStorageData,
				signOut
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
