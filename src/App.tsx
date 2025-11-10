import { ConfigProvider, App as AntApp } from "antd";
import DutiesPage from "./pages";

export default function App() {
	return (
		<ConfigProvider theme={{ token: { colorPrimary: "#1677ff" } }}>
			<AntApp>
				<DutiesPage />
			</AntApp>
		</ConfigProvider>
	);
}
