import Admin from "@/pages/Admin";
import Home from "@/pages/Home";

export default function App() {
  return window.location.pathname.includes("admin") ? <Admin /> : <Home />;
}
