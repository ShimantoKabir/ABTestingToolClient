import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

interface CreateExperimentDialogProps {
  visible: boolean;
  onHide: () => void;
  title: string;
  description: string;
  url: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onCreate: () => void;
}

export const CreateExperimentDialog: React.FC<CreateExperimentDialogProps> = ({
  visible,
  onHide,
  title,
  description,
  url,
  onTitleChange,
  onDescriptionChange,
  onUrlChange,
  onCreate,
}) => {
  const dialogFooter = (
    <div className="flex justify-content-end mt-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        onClick={onHide}
      />
      <Button label="Create" icon="pi pi-check" onClick={onCreate} />
    </div>
  );

  return (
    <Dialog
      header="Create Experiment"
      visible={visible}
      style={{ width: "500px" }}
      onHide={onHide}
      footer={dialogFooter}
    >
      <div className="flex flex-column gap-4 pt-2">
        {/* Title Input */}
        <div className="flex flex-column gap-2">
          <label htmlFor="title" className="font-bold">
            Title
          </label>
          <InputText
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            autoFocus
            placeholder="e.g. Homepage Redesign"
          />
        </div>

        {/* Description Input */}
        <div className="flex flex-column gap-2">
          <label htmlFor="description" className="font-bold">
            Description
          </label>
          <InputTextarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            autoResize
            placeholder="Optional description of the test..."
          />
        </div>

        {/* URL Input */}
        <div className="flex flex-column gap-2">
          <label htmlFor="url" className="font-bold">
            Target URL
          </label>
          <InputText
            id="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>
    </Dialog>
  );
};
