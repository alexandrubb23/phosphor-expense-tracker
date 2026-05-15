import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEventListener } from "usehooks-ts";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFields,
  type EditUserFields,
} from "@expense-tracker/core";
import { Form, FormInputField } from "@/components/ui/form";
import FormRootError from "@/components/ui/FormRootError";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import type { User } from "@/api/users";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface UserFormModalProps {
  user?: User;
  onClose: () => void;
}

type FormFields = CreateUserFields | EditUserFields;

export default function UserFormModal({ user, onClose }: UserFormModalProps) {
  const isEdit = user !== undefined;

  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser(user?.id ?? "");

  const form = useForm<FormFields>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: isEdit
      ? { name: user.name, email: user.email, password: "" }
      : { name: "", email: "", password: "" },
  });

  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEventListener("keydown", (e) => {
    if (e.key === "Escape") onClose();
  });

  const onSubmit = async (data: FormFields) => {
    try {
      if (isEdit) {
        const payload = { ...data } as EditUserFields;
        if (!payload.password) delete payload.password;
        await updateUser(payload);
      } else {
        await createUser(data as CreateUserFields);
      }
      onClose();
    } catch (err) {
      setError("root", {
        message: getErrorMessage(
          err,
          `Failed to ${isEdit ? "update" : "create"} user`
        ),
      });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md border border-hairline-glow bg-surface p-8 shadow-[0_0_60px_rgba(0,229,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        {/* Corner accents */}
        <span className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t border-l border-cyan" />
        <span className="pointer-events-none absolute -right-px -bottom-px h-3 w-3 border-b border-r border-cyan" />

        <div className="mb-6 flex items-center justify-between">
          <h2
            id="user-form-title"
            className="font-mono text-[13px] font-medium uppercase tracking-[0.22em] text-ink"
          >
            {isEdit ? "Edit User" : "New User"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] tracking-[0.2em] text-muted transition-colors duration-200 hover:text-cyan"
            aria-label="Close"
          >
            ✕ CLOSE
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            <FormInputField
              control={form.control}
              name="name"
              label="NAME"
              type="text"
              placeholder="FULL NAME"
              autoComplete="off"
              autoFocus
            />

            <FormInputField
              control={form.control}
              name="email"
              label="EMAIL ADDRESS"
              type="email"
              placeholder="USER@DOMAIN.COM"
              autoComplete="off"
            />

            <FormInputField
              control={form.control}
              name="password"
              label="PASSWORD"
              type="password"
              placeholder={
                isEdit ? "LEAVE BLANK TO KEEP CURRENT" : "••••••••••••"
              }
              autoComplete="new-password"
            />

            <FormRootError message={errors.root?.message} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-none bg-cyan py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-bg-deep transition-all duration-200
                hover:bg-cyan-bright hover:tracking-[0.38em] hover:shadow-[0_0_36px_rgba(0,229,255,0.5),inset_0_0_16px_rgba(255,255,255,0.3)]
                disabled:cursor-not-allowed disabled:opacity-50 disabled:tracking-[0.2em]"
            >
              {isSubmitting
                ? isEdit
                  ? "SAVING…"
                  : "CREATING…"
                : isEdit
                  ? "▸ SAVE CHANGES"
                  : "▸ CREATE USER"}
            </button>
          </form>
        </Form>
      </div>
    </div>,
    document.body
  );
}
