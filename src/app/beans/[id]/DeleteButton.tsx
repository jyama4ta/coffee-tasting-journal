"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface DeleteButtonProps {
  beanId: number;
  beanName: string;
}

export default function DeleteButton({ beanId, beanName }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `「${beanName}」を削除しますか？\n関連する試飲記録も削除されます。\nこの操作は取り消せません。`,
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/beans/${beanId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      router.push("/beans");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleDelete} variant="danger" disabled={loading}>
      {loading ? "削除中..." : "削除"}
    </Button>
  );
}
