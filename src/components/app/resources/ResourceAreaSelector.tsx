import { AREA_DETAILS, selectClasses } from "./constants";
import type { ResourceArea } from "./types";

export function AreaSelector({
 disabled,
 id,
 manageableAreas,
 name = "area",
 onChange,
 value,
}: {
 disabled?: boolean;
 id: string;
 manageableAreas: ResourceArea[];
 name?: string;
 onChange?: (value: ResourceArea) => void;
 value: ResourceArea;
}) {
 return (
 <select
 id={id}
 name={name}
 value={value}
 disabled={disabled}
 onChange={(event) => onChange?.(event.target.value as ResourceArea)}
 className={selectClasses}
 >
 {manageableAreas.map((area) => (
 <option key={area} value={area}>
 {AREA_DETAILS[area].label}
 </option>
 ))}
 </select>
 );
}
