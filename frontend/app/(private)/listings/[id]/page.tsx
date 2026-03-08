"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PencilEdit02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import { AvailabilityBlockFormDialog } from "@/components/availability-block-form-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  AvailabilityBlockResponse,
} from "@/lib/api/availability-blocks";
import { AvailabilityBlockInput } from "@/lib/schemas/availability-block.schema";
import { useAvailabilityBlocks, useCreateAvailabilityBlock, useDeleteAvailabilityBlock, useUpdateAvailabilityBlock } from "@/hooks/use-availability-blocks";
import { useListing } from "@/hooks/use-listings";

function formatDateTime(value: string) {
  const parsedDate = parseISO(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return format(parsedDate, "dd MMM yyyy, HH:mm");
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const listingId = params.id;

  const listingQuery = useListing(listingId);
  const availabilityQuery = useAvailabilityBlocks(listingId);

  const createMutation = useCreateAvailabilityBlock(listingId);
  const updateMutation = useUpdateAvailabilityBlock(listingId);
  const deleteMutation = useDeleteAvailabilityBlock(listingId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AvailabilityBlockResponse | null>(null);
  const [blockPendingDelete, setBlockPendingDelete] = useState<AvailabilityBlockResponse | null>(null);

  const modalMode = editingBlock ? "edit" : "create";
  const modalError = useMemo(() => {
    if (modalMode === "edit" && updateMutation.error instanceof Error) {
      return updateMutation.error.message;
    }

    if (modalMode === "create" && createMutation.error instanceof Error) {
      return createMutation.error.message;
    }

    return null;
  }, [modalMode, updateMutation.error, createMutation.error]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateModal() {
    setEditingBlock(null);
    setIsModalOpen(true);
  }

  function openEditModal(block: AvailabilityBlockResponse) {
    setEditingBlock(block);
    setIsModalOpen(true);
  }

  function openDeleteModal(block: AvailabilityBlockResponse) {
    deleteMutation.reset();
    setBlockPendingDelete(block);
  }

  async function handleModalSubmit(values: AvailabilityBlockInput) {
    const startDate = new Date(values.startDate).toISOString();
    const endDate = new Date(values.endDate).toISOString();
    const reason = values.reason.trim();

    if (editingBlock) {
      await updateMutation.mutateAsync({
        id: editingBlock.id,
        data: {
          startDate,
          endDate,
          reason,
        },
      });
    } else {
      await createMutation.mutateAsync({
        startDate,
        endDate,
        reason,
      });
    }

    setIsModalOpen(false);
    setEditingBlock(null);
  }

  async function handleConfirmDeleteBlock() {
    if (!blockPendingDelete) {
      return;
    }

    await deleteMutation.mutateAsync(blockPendingDelete.id);
    setBlockPendingDelete(null);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/listings">Listings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Details</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {listingQuery.isLoading ? (
            <Card>
              <CardContent className="space-y-3 pt-4">
                <div className="h-7 w-48 rounded-md bg-muted/50" />
                <div className="h-4 w-full rounded-md bg-muted/40" />
                <div className="h-4 w-3/4 rounded-md bg-muted/40" />
              </CardContent>
            </Card>
          ) : null}

          {listingQuery.isError ? (
            <Card>
              <CardHeader>
                <CardTitle>Could not load listing</CardTitle>
                <CardDescription>
                  {listingQuery.error instanceof Error ? listingQuery.error.message : "Unknown error"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => listingQuery.refetch()}>
                  Retry
                </Button>
                <Button asChild>
                  <Link href="/admin/listings">Back to Listings</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : null}

          {listingQuery.data ? (
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-2xl">{listingQuery.data.title}</CardTitle>
                  <Button asChild variant="outline" size="icon-sm" className="shrink-0">
                    <Link
                      href={`/admin/listings/${listingId}/edit`}
                      aria-label="Edit listing"
                      title="Edit listing"
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  {listingQuery.data.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">City</p>
                  <p className="pt-1 font-medium">{listingQuery.data.city}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Price / Night</p>
                  <p className="pt-1 font-medium">
                    {formatCurrency(listingQuery.data.pricePerNight, listingQuery.data.currency)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="pt-1 font-medium capitalize">{listingQuery.data.status}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Availability Blocks</CardTitle>
                <CardDescription>
                  Create blocked periods to prevent bookings during maintenance, owner stay, or cleanup.
                </CardDescription>
              </div>
              <Button type="button" onClick={openCreateModal} disabled={!listingQuery.data}>
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                Create Block
              </Button>
            </CardHeader>
            <CardContent>
              {availabilityQuery.isLoading ? (
                <div className="space-y-3">
                  <div className="h-20 rounded-lg bg-muted/40" />
                  <div className="h-20 rounded-lg bg-muted/40" />
                </div>
              ) : null}

              {availabilityQuery.isError ? (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">
                    {availabilityQuery.error instanceof Error
                      ? availabilityQuery.error.message
                      : "Could not load availability blocks"}
                  </p>
                  <Button type="button" variant="outline" onClick={() => availabilityQuery.refetch()}>
                    Retry
                  </Button>
                </div>
              ) : null}

              {!availabilityQuery.isLoading &&
              !availabilityQuery.isError &&
              (availabilityQuery.data?.length ?? 0) === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">No blocked periods yet.</p>
                </div>
              ) : null}

              {!availabilityQuery.isLoading &&
              !availabilityQuery.isError &&
              (availabilityQuery.data?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {availabilityQuery.data?.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{block.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(block.startDate)} to {formatDateTime(block.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            onClick={() => openEditModal(block)}
                            aria-label="Edit block"
                            title="Edit block"
                          >
                            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => openDeleteModal(block)}
                            disabled={deleteMutation.isPending}
                            aria-label="Delete block"
                            title="Delete block"
                          >
                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <AvailabilityBlockFormDialog
          open={isModalOpen}
          mode={modalMode}
          block={editingBlock}
          isPending={isSaving}
          apiError={modalError}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingBlock(null);
            }
          }}
          onSubmit={handleModalSubmit}
        />

        <Dialog
          open={Boolean(blockPendingDelete)}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) {
              setBlockPendingDelete(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Availability Block</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This period will be available for bookings again.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-3">
              {blockPendingDelete ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{blockPendingDelete.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(blockPendingDelete.startDate)} to {formatDateTime(blockPendingDelete.endDate)}
                  </p>
                </div>
              ) : null}
              {deleteMutation.error instanceof Error ? (
                <p className="text-sm text-destructive">{deleteMutation.error.message}</p>
              ) : null}
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBlockPendingDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDeleteBlock}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
