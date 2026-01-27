"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface DeleteButtonProps {
  dripperId: number;
  dripperName: string;
  disabled?: boolean;
}

export default function DeleteButton({
  dripperId,
  dripperName,
  disabled,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(`「${dripperName}」を削除しますか？\nこの操作は取り消せません。`)
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/drippers/${dripperId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      router.push("/admin/drippers");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDelete}
      variant="danger"
      disabled={loading || disabled}
    >
      {loading ? "削除中..." : "削除"}
    </Button>
  );
}
