import { Simulator } from "./components/Simulator";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Title,
} from "chart.js";

function App() {
  // Register the controllers and elements for the charts
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
  );

  return (
    <div className="container mb-6">
      <Simulator />
    </div>
  );
}

export default App;
