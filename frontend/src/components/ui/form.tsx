import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({
  children,
}: {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return React.cloneElement(children, {
    id: formItemId,
    "aria-describedby": !error
      ? formDescriptionId
      : `${formDescriptionId} ${formMessageId}`,
    "aria-invalid": !!error || undefined,
  } as React.HTMLAttributes<HTMLElement>);
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) return null;

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

const INPUT_CLASS =
  "w-full border border-hairline-glow bg-surface px-4 py-3.5 h-auto rounded-none font-mono text-base md:text-sm tracking-[0.04em] text-ink transition-all duration-200 " +
  "placeholder:text-[11px] placeholder:tracking-[0.14em] placeholder:text-muted-soft " +
  "focus:border-cyan focus:bg-panel-raised focus:outline-none focus:shadow-[0_0_0_1px_#0098b5,0_0_24px_rgba(0,229,255,0.08)] " +
  "aria-invalid:border-red aria-invalid:bg-[rgba(255,58,92,0.04)] aria-invalid:shadow-[0_0_0_1px_#ff3a5c]";

const LABEL_CLASS =
  "font-mono text-[10px] uppercase tracking-[0.28em] text-cyan";
const MESSAGE_CLASS =
  "font-mono text-[10px] tracking-[0.14em] text-red [text-shadow:0_0_8px_rgba(255,58,92,0.5)]";

interface FormInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.ComponentProps<"input">, "name"> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
}

function FormInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  ...inputProps
}: FormInputFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <Input className={INPUT_CLASS} {...inputProps} {...field} />
          </FormControl>
          <FormMessage className={MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormInputField,
};
