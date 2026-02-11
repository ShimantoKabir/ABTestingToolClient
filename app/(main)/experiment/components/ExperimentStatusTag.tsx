import { Tag } from "primereact/tag";
import { ExperimentResponseDto } from "../dtos/experiment.dto";

interface ExperimentStatusTagProps {
  status: ExperimentResponseDto["status"];
}

export const ExperimentStatusTag: React.FC<ExperimentStatusTagProps> = ({ status }) => {
  const severity =
    status === "Active"
      ? "success"
      : status === "Draft"
      ? "warning"
      : "danger";
  
  return <Tag value={status} severity={severity} />;
};
