import type * as React from "react";

import { AREA_DETAILS, selectClasses } from "./constants";
import type { ResourceArea } from "./types";

type AreaSelectorProps = Omit<
 React.ComponentPropsWithoutRef<"select">,
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
 <select
 id={id}
 name={name}
 value={value}
 disabled={disabled}
 onChange={(event) => onChange?.(event.target.value as ResourceArea)}
 className={[selectClasses, className].filter(Boolean).join(" ")}
 {...props}
 >
 {manageableAreas.map((area) => (
 <option key={area} value={area}>
 {AREA_DETAILS[area].label}
 </option>
 ))}
 </select>
 );
}
