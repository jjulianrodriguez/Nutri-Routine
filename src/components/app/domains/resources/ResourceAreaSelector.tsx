import {
 Select,
 type SelectProps,
} from "@/components/ui/forms/select";

import { AREA_DETAILS } from "./constants";
import type { ResourceArea } from "./types";

type AreaSelectorProps = Omit<
 SelectProps,
 "children" | "onChange" | "value"
> & {
 manageableAreas: ResourceArea[];
 onChange?: (value: ResourceArea) => void;
 value: ResourceArea;
};

export function AreaSelector({
 className,
 disabled,
 id,
 manageableAreas,
 name = "area",
 onChange,
 value,
 ...props
}: AreaSelectorProps) {
 return (
 <Select
 id={id}
 name={name}
 value={value}
 disabled={disabled}
 onChange={(event) => onChange?.(event.target.value as ResourceArea)}
 className={className}
 {...props}
 >
 {manageableAreas.map((area) => (
 <option key={area} value={area}>
 {AREA_DETAILS[area].label}
 </option>
 ))}
 </Select>
 );
}
