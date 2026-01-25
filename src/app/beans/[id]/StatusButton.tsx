"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface StatusButtonProps {
  beanId: number;
  currentStatus: string;
}

export default function StatusButton({
  beanId,
  currentStatus,
}: StatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStatusChange() {
    const newStatus = currentStatus === "IN_STOCK" ? "FINISHED" : "IN_STOCK";
    const message =
      newStatus === "FINISHED"
        ? "この豆を「飲み切り」にしますか？"
        : "この豆を「在庫中」に戻しますか？";

    if (!confirm(message)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/beans/${beanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("ステータス変更に失敗しました");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleStatusChange}
      variant={currentStatus === "IN_STOCK" ? "secondary" : "primary"}
      disabled={loading}
    >
      {loading
        ? "処理中..."
        : currentStatus === "IN_STOCK"
          ? "飲み切りにする"
          : "在庫中に戻す"}
    </Button>
  );
}
