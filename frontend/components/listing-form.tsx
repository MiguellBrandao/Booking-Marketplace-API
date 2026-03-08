"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { useCreateListing, useListing, useUpdateListing } from "@/hooks/use-listings";
import { listingSchema, type ListingInput } from "@/lib/schemas/listing.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ListingFormProps = {
  mode: "create" | "edit";
  listingId?: string;
};

export function ListingForm({ mode, listingId }: ListingFormProps) {
  const router = useRouter();
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing(listingId ?? "");
  const isEdit = mode === "edit";

  const listingQuery = useListing(listingId);

  const form = useForm<ListingInput>({
    resolver: standardSchemaResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      city: "",
      pricePerNight: 0,
      currency: "EUR",
      status: "active",
    },
  });

  useEffect(() => {
    if (isEdit && listingQuery.data) {
      form.reset({
        title: listingQuery.data.title,
        description: listingQuery.data.description ?? "",
        city: listingQuery.data.city,
        pricePerNight: listingQuery.data.pricePerNight,
        currency: listingQuery.data.currency,
        status: listingQuery.data.status,
      });
    }
  }, [isEdit, listingQuery.data, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingEditData = isEdit && listingQuery.isLoading;

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit && listingId) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }

    router.push("/admin/listings");
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Listing" : "Create Listing"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update listing information and keep availability accurate."
            : "Fill in listing details to publish it in your marketplace."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingEditData ? (
          <div className="space-y-3">
            <div className="h-10 rounded-md bg-muted/40" />
            <div className="h-10 rounded-md bg-muted/40" />
            <div className="h-10 rounded-md bg-muted/40" />
            <div className="h-10 rounded-md bg-muted/40" />
          </div>
        ) : isEdit && listingQuery.isError ? (
          <div className="space-y-3">
            <FieldDescription className="text-red-500">
              {listingQuery.error instanceof Error
                ? listingQuery.error.message
                : "Could not load listing data"}
            </FieldDescription>
            <Button type="button" variant="outline" onClick={() => listingQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input id="title" placeholder="Cozy Apartment Downtown" {...form.register("title")} />
                <FieldDescription>{form.formState.errors.title?.message}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input id="description" placeholder="2-bedroom near metro station" {...form.register("description")} />
                <FieldDescription>{form.formState.errors.description?.message}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input id="city" placeholder="Lisbon" {...form.register("city")} />
                <FieldDescription>{form.formState.errors.city?.message}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="pricePerNight">Price per night</FieldLabel>
                <Input id="pricePerNight" type="number" min={1} step="0.01" {...form.register("pricePerNight")} />
                <FieldDescription>{form.formState.errors.pricePerNight?.message}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="currency">Currency</FieldLabel>
                <Input id="currency" maxLength={3} placeholder="EUR" {...form.register("currency")} />
                <FieldDescription>{form.formState.errors.currency?.message}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <select
                  id="status"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  {...form.register("status")}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
                <FieldDescription>{form.formState.errors.status?.message}</FieldDescription>
              </Field>

              {createMutation.isError || updateMutation.isError ? (
                <FieldDescription className="text-red-500">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : updateMutation.error instanceof Error
                      ? updateMutation.error.message
                      : "Could not save listing"}
                </FieldDescription>
              ) : null}

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Listing"}
                </Button>
                <Button type="button" variant="ghost" asChild>
                  <Link href="/admin/listings">Cancel</Link>
                </Button>
              </div>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
