import {Tabs} from "./components/Tabs.jsx";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

function App() {
    // Register the plugin to all charts:
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement
    );
  return (
      <div className="container">
        <Tabs />
      </div>
  );
}

export default App;
