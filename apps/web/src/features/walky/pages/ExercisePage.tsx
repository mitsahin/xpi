import { useParams } from "react-router-dom";
import { ExerciseScreen } from "../components/ExerciseScreen";

export function ExercisePage() {
  const { skillId = "" } = useParams();
  return <ExerciseScreen skillId={skillId} />;
}
