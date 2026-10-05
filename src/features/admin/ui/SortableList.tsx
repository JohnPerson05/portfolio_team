"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { useAdminFeedback } from "./feedback";
import { Icon } from "./icons";

export interface DragHandleProps {
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown> | undefined;
  label: string;
}

export interface SortableRenderState {
  handle: ReactNode;
  isDragging: boolean;
  index: number;
}

/** The grip button that starts a drag (mouse, touch, or keyboard: Space + arrows). */
export function DragHandle({ attributes, listeners, label }: DragHandleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <Icon.Grip />
    </button>
  );
}

function SortableItem<T extends { id: string }>({
  item,
  index,
  itemLabel,
  render,
  as: Tag,
  className,
}: {
  item: T;
  index: number;
  itemLabel: (item: T) => string;
  render: (item: T, state: SortableRenderState) => ReactNode;
  as: "li" | "div";
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: "relative",
  };
  return (
    <Tag
      ref={setNodeRef as never}
      style={style}
      className={cn(className, isDragging && "opacity-90 shadow-lg ring-1 ring-zinc-300")}
    >
      {render(item, {
        index,
        isDragging,
        handle: (
          <DragHandle
            attributes={attributes as unknown as Record<string, unknown>}
            listeners={listeners as Record<string, unknown> | undefined}
            label={`Reorder ${itemLabel(item)}`}
          />
        ),
      })}
    </Tag>
  );
}

/**
 * Drag-and-drop reorderable list. Reorders optimistically, then persists via
 * `onReorder(ids)`; reverts and shows an error if saving fails. Keyboard
 * accessible (focus the grip, Space to lift, arrows to move, Space to drop).
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  itemLabel,
  layout = "list",
  className,
  itemClassName,
  successMessage = "Order saved",
}: {
  items: readonly T[];
  onReorder: (ids: string[]) => Promise<ActionResult>;
  renderItem: (item: T, state: SortableRenderState) => ReactNode;
  itemLabel: (item: T) => string;
  layout?: "list" | "grid";
  className?: string;
  itemClassName?: string;
  successMessage?: string;
}) {
  const [order, setOrder] = useState<T[]>([...items]);
  const { toast } = useAdminFeedback();
  // Stable id so dnd-kit's generated aria ids match between server and client.
  const dndId = useId();

  // Re-sync when the server sends a fresh list (after router.refresh()).
  const signature = items.map((i) => i.id).join("|");
  useEffect(() => {
    setOrder([...items]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const previous = order;
    const from = order.findIndex((i) => i.id === active.id);
    const to = order.findIndex((i) => i.id === over.id);
    const next = arrayMove(order, from, to);
    setOrder(next);
    try {
      const result = await onReorder(next.map((i) => i.id));
      if (result && !result.success) throw new Error(result.formError);
      if (successMessage) toast(successMessage);
    } catch (error) {
      setOrder(previous);
      toast(error instanceof Error && error.message ? error.message : "Couldn't save the new order.", "error");
    }
  }

  const Tag = layout === "grid" ? "div" : "ul";
  const ItemTag = layout === "grid" ? "div" : "li";

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable: "To reorder, press Space to pick up an item, use the arrow keys to move it, then press Space again to drop it. Press Escape to cancel.",
        },
      }}
    >
      <SortableContext items={order.map((i) => i.id)} strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
        <Tag className={className}>
          {order.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              itemLabel={itemLabel}
              render={renderItem}
              as={ItemTag}
              className={itemClassName}
            />
          ))}
        </Tag>
      </SortableContext>
    </DndContext>
  );
}
