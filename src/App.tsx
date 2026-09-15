import ClassicApp from "./classic/ClassicApp";
import { useDesign } from "./hooks/useDesign";
import ModernApp from "./modern/ModernApp";

export default function App() {
  const { design, setDesign } = useDesign();

  if (design === "classic") {
    return <ClassicApp onSwitchDesign={() => setDesign("modern")} />;
  }

  return <ModernApp onSwitchDesign={() => setDesign("classic")} />;
}
