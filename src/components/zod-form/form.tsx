import { ZodField } from "@/components/zod-form/field";
import {
  parseZField,
  zodSchemaToInnerSchema,
} from "@/components/zod-form/helpers";
import { cx } from "class-variance-authority";
import React, { useMemo, useState } from "react";
import { AnyZodObject, z, ZodSchema } from "zod";

interface FormProps<T extends ZodSchema> {
  schema: T;
  initialValues: z.infer<T>;
  onChange: (values: z.infer<T>) => void;
  className?: string;
  children?: React.ReactNode;
}

export const ZodForm = React.memo(
  <T extends ZodSchema>({
    schema: rootSchema,
    initialValues,
    onChange,
    className,
    children,
  }: FormProps<T>) => {
    // I will fake a form implementation here
    // in prod one is better suited with react-final-form or other form lib
    // but for this challenge it's enough
    const [values, setValues] = useState(initialValues || {});
    const handleChange = (name: string, value: z.infer<T>) => {
      const nextValues = { ...values, [name]: value };
      setValues(nextValues);
      onChange?.(nextValues);
    };
    const renderObjectSchema = (schema: AnyZodObject) => {
      return Object.entries(schema.shape).map(([name, prop]) => {
        const propSchema = zodSchemaToInnerSchema(prop as ZodSchema);
        const zFieldProps = parseZField(prop as ZodSchema);

        return (
          <div key={name}>
            {zFieldProps.label && (
              <label className="text-xs uppercase font-medium text-gray-400 pb-1 block">
                {zFieldProps.label}
              </label>
            )}
            <ZodField
              {...zFieldProps}
              name={name}
              schema={propSchema}
              onChange={handleChange}
              value={values[name as keyof typeof values]}
            />
          </div>
        );
      });
    };

    // const
    // return null

    const schema = useMemo(
      () => zodSchemaToInnerSchema(rootSchema),
      [rootSchema]
    );

    return (
      <form className={cx("", className)}>
        {renderObjectSchema(schema as AnyZodObject)}
        {children}
      </form>
    );
  }
);
