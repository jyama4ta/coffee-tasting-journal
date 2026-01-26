"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

type DeleteButtonProps = {
  id: number;
  disabled?: boolean;
};

export default function DeleteButton({ id, disabled }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("この銘柄を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/bean-masters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "削除に失敗しました");
        return;
      }

      router.push("/bean-masters");
      router.refresh();
    } catch {
      alert("削除に失敗しました");
    }
  };

  return (
    <Button
      variant="danger"
      onClick={handleDelete}
      disabled={disabled}
      title={disabled ? "購入記録がある銘柄は削除できません" : "削除"}
    >
      削除
    </Button>
  );
}
