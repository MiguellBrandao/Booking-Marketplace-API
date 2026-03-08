"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { AvailabilityBlockResponse } from "@/lib/api/availability-blocks";
import {
  availabilityBlockSchema,
  AvailabilityBlockInput,
} from "@/lib/schemas/availability-block.schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AvailabilityBlockFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  block?: AvailabilityBlockResponse | null;
  isPending?: boolean;
  apiError?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AvailabilityBlockInput) => Promise<void>;
};

function toDateTimeLocal(value: string) {
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}

export function AvailabilityBlockFormDialog({
  open,
  mode,
  block,
  isPending = false,
  apiError,
  onOpenChange,
  onSubmit,
}: AvailabilityBlockFormDialogProps) {
  const form = useForm<AvailabilityBlockInput>({
    resolver: standardSchemaResolver(availabilityBlockSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        startDate: "",
        endDate: "",
        reason: "",
      });
      return;
    }

    if (mode === "edit" && block) {
      form.reset({
        startDate: toDateTimeLocal(block.startDate),
        endDate: toDateTimeLocal(block.endDate),
        reason: block.reason,
      });
      return;
    }

    form.reset({
      startDate: "",
      endDate: "",
      reason: "",
    });
  }, [open, mode, block, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const title = mode === "create" ? "Create Availability Block" : "Edit Availability Block";
  const description =
    mode === "create"
      ? "Set a period where this listing will not accept bookings."
      : "Update dates or reason for this blocked period.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="availability-block-form" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                <Input
                  id="startDate"
                  type="datetime-local"
                  aria-invalid={Boolean(form.formState.errors.startDate)}
                  {...form.register("startDate")}
                />
                <FieldError errors={[form.formState.errors.startDate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                <Input
                  id="endDate"
                  type="datetime-local"
                  aria-invalid={Boolean(form.formState.errors.endDate)}
                  {...form.register("endDate")}
                />
                <FieldError errors={[form.formState.errors.endDate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="reason">Reason</FieldLabel>
                <Input
                  id="reason"
                  placeholder="Maintenance, deep cleaning, owner stay..."
                  aria-invalid={Boolean(form.formState.errors.reason)}
                  {...form.register("reason")}
                />
                <FieldError errors={[form.formState.errors.reason]} />
              </Field>

              {apiError ? <FieldError>{apiError}</FieldError> : null}
            </FieldGroup>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="availability-block-form" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Block" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
