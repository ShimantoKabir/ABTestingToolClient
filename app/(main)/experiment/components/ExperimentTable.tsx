import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ExperimentResponseDto } from "../dtos/experiment.dto";
import { ExperimentStatusTag } from "./ExperimentStatusTag";

interface ExperimentTableProps {
  experiments: ExperimentResponseDto[];
  loading: boolean;
  totalRecords: number;
  lazyParams: { first: number; rows: number; page: number };
  onPageChange: (event: any) => void;
  onEnterExperiment: (id: number) => void;
}

export const ExperimentTable: React.FC<ExperimentTableProps> = ({
  experiments,
  loading,
  totalRecords,
  lazyParams,
  onPageChange,
  onEnterExperiment,
}) => {
  const typeBody = (rowData: ExperimentResponseDto) => {
    return <span className="font-semibold text-500">{rowData.type}</span>;
  };

  const actionBody = (rowData: ExperimentResponseDto) => {
    return (
      <Button
        icon="pi pi-arrow-right"
        rounded
        text
        severity="info"
        tooltip="Enter Experiment"
        tooltipOptions={{ position: "top" }}
        onClick={() => onEnterExperiment(rowData.id)}
      />
    );
  };

  return (
    <DataTable
      value={experiments}
      lazy
      paginator
      size={'small'}
      first={lazyParams.first}
      rows={lazyParams.rows}
      totalRecords={totalRecords}
      onPage={onPageChange}
      loading={loading}
      rowClassName={() => "vertical-align-middle cursor-pointer hover:bg-blue-50"}
      onRowClick={(e) => onEnterExperiment(e.data.id)}
    >
      <Column field="title" header="Title" style={{ width: "25%" }} />
      <Column field="description" header="Description" />
      <Column
        field="status"
        header="Status"
        body={(rowData) => <ExperimentStatusTag status={rowData.status} />}
        style={{ width: "10%" }}
      />
      <Column
        field="type"
        header="Type"
        body={typeBody}
        style={{ width: "15%" }}
      />
      {/* <Column
        body={actionBody}
        header="Action"
        style={{ width: "5%", textAlign: "center" }}
      /> */}
    </DataTable>
  );
};
