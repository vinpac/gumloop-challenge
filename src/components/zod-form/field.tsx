import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ZField } from "@/components/zod-form/helpers";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { ZodFirstPartySchemaTypes } from "zod";
import { TextareaAutosizeProps } from "react-textarea-autosize";

export const ZodFieldComponent = ({
  name,
  schema,
  minRows,
  placeholder,
  label,
  onChange,
  value,
}: ZField & {
  schema: ZodFirstPartySchemaTypes;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) => {
  const props = {
    key: name,
    name,
    value,
  };

  // Render different field types based on the Zod schema
  switch (schema._def.typeName) {
    case "ZodString":
      if (minRows) {
        return (
          <Textarea
            {...(props as TextareaAutosizeProps)}
            minRows={minRows}
            placeholder={placeholder}
            onChange={(e) => onChange(name, e.target.value)}
          />
        );
      }

      return (
        <Input
          {...(props as Omit<React.ComponentProps<"input">, "ref">)}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      );
    // Add more cases for other Zod types as needed
    case "ZodEnum":
    case "ZodNativeEnum": {
      const values = schema._def.values;
      const options: Array<{ value: string; label: string }> = Array.isArray(
        values
      )
        ? schema._def.values.map((v: string) => ({
            value: v,
            label: v,
          }))
        : Object.entries(values).map(([label, value]) => ({
            label,
            value,
          }));

      return (
        <Select value={value} onValueChange={(value) => onChange(name, value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {label && <SelectLabel>{label}</SelectLabel>}
              {options.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
    default:
      return null;
  }
};
