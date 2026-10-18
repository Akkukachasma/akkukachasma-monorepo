import { PreviewTemplateProps } from ".";
import { Cross2Icon } from "@radix-ui/react-icons";

const DefaultPreviewTemplate: React.FC<PreviewTemplateProps> = ({
  onRemove,
  label,
}) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-xl border bg-slate-200 text-xs font-medium">
      {label}
      <button
        type="button"
        className="text-destructive"
        onClick={() => onRemove()}
      >
        <Cross2Icon className="size-3" />
      </button>
    </div>
  );
};
export default DefaultPreviewTemplate;
