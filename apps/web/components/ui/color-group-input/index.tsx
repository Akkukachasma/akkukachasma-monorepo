import React from "react";
import { Label } from "../label";
import { Cross, CrossIcon, PlusIcon } from "lucide-react";
import { Button } from "../button";
import ColorInputModal from "./ColorInputModal";
import { Cross1Icon } from "@radix-ui/react-icons";

interface ColorGroupInputProps {
  value?: Array<ColorGroupItem[]>;
  onChange?: (value: Array<ColorGroupItem[]>) => void;
}
export interface ColorGroupItem {
  id: string;
  color: string;
}
const ColorGroupInput: React.FC<ColorGroupInputProps> = ({
  onChange,
  value,
}) => {
  const [groups, setGroups] = React.useState<Array<ColorGroupItem[]>>([]);
  const [open, setOpen] = React.useState(false);

  const handleChange = (group: ColorGroupItem[]) => {
    let updatedGroups: Array<ColorGroupItem[]> = [];
    // Create a Set of sorted IDs from the new group
    const newGroupIds = new Set(group.map((c) => c.id).sort());

    const exists = groups.some((existingGroup) => {
      const existingIds = new Set(existingGroup.map((c) => c.id).sort());

      // Check if both sets have same size and same elements
      if (existingIds.size !== newGroupIds.size) return false;

      for (const id of newGroupIds) {
        if (!existingIds.has(id)) return false;
      }
      return true;
    });

    if (!exists) {
      updatedGroups = [...groups, group];
    } else {
      updatedGroups = groups;
    }

    setGroups(updatedGroups);
    onChange?.(updatedGroups);
  };

  const handleGroupRemove = (groupToRemove: ColorGroupItem[]) => {
    const removableIds = new Set(groupToRemove.map((c) => c.id));
    const isSameGroup = (group: ColorGroupItem[]) => {
      if (group.length !== removableIds.size) return false;

      for (const item of group) {
        if (!removableIds.has(item.id)) return false;
      }

      return true;
    };
    const remainingGroups = groups.filter((group) => !isSameGroup(group));

    setGroups(remainingGroups);
    onChange?.(remainingGroups);
  };

  React.useEffect(() => {
    if (Array.isArray(value)) {
      setGroups(value);
    }
  }, [value]);

  return (
    <React.Fragment>
      <ColorInputModal
        onChange={(group) => {
          handleChange(group);
        }}
        open={open}
        onOpenChange={setOpen}
      />
      <div className="flex items-center gap-2">
        {groups?.map((group, index) => {
          return (
            <div
              key={index}
              className="size-10 rounded-full group flex flex-col overflow-hidden relative cursor-pointer"
            >
              {group?.map((color, j) => {
                return (
                  <div
                    key={j}
                    className="w-full h-full"
                    style={{ backgroundColor: color.color }}
                  />
                );
              })}
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleGroupRemove(group)}
                className="absolute hidden !bg-black/70 inset-0 size-full group-hover:grid place-content-center"
              >
                <Cross1Icon className="text-white" />
              </Button>
            </div>
          );
        })}
        <Button
          onClick={() => setOpen(true)}
          type="button"
          size="icon"
          variant="secondary"
        >
          <PlusIcon />
        </Button>
      </div>
    </React.Fragment>
  );
};
export default ColorGroupInput;
