// PWA用アイコン生成スクリプト
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

const sizes = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

const outputDir = path.join(process.cwd(), "public", "icons");

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach(({ name, size }) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // 背景色 (amber-900: #78350f)
  ctx.fillStyle = "#78350f";
  ctx.fillRect(0, 0, size, size);

  // コーヒーカップのアイコンを描画
  const centerX = size / 2;
  const centerY = size / 2;
  const scale = size / 100; // 基準サイズ100pxからのスケール

  // カップの本体（白色）
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(centerX - 25 * scale, centerY - 15 * scale);
  ctx.lineTo(centerX - 20 * scale, centerY + 20 * scale);
  ctx.quadraticCurveTo(
    centerX,
    centerY + 28 * scale,
    centerX + 20 * scale,
    centerY + 20 * scale
  );
  ctx.lineTo(centerX + 25 * scale, centerY - 15 * scale);
  ctx.closePath();
  ctx.fill();

  // カップの取っ手
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.arc(
    centerX + 30 * scale,
    centerY,
    8 * scale,
    -Math.PI / 2,
    Math.PI / 2
  );
  ctx.stroke();

  // コーヒーの液体（茶色）
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(centerX - 22 * scale, centerY - 8 * scale);
  ctx.lineTo(centerX - 18 * scale, centerY + 15 * scale);
  ctx.quadraticCurveTo(
    centerX,
    centerY + 22 * scale,
    centerX + 18 * scale,
    centerY + 15 * scale
  );
  ctx.lineTo(centerX + 22 * scale, centerY - 8 * scale);
  ctx.closePath();
  ctx.fill();

  // 湯気（白色、半透明）
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";

  // 左の湯気
  ctx.beginPath();
  ctx.moveTo(centerX - 10 * scale, centerY - 20 * scale);
  ctx.quadraticCurveTo(
    centerX - 15 * scale,
    centerY - 30 * scale,
    centerX - 10 * scale,
    centerY - 38 * scale
  );
  ctx.stroke();

  // 中央の湯気
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 20 * scale);
  ctx.quadraticCurveTo(
    centerX + 5 * scale,
    centerY - 30 * scale,
    centerX,
    centerY - 40 * scale
  );
  ctx.stroke();

  // 右の湯気
  ctx.beginPath();
  ctx.moveTo(centerX + 10 * scale, centerY - 20 * scale);
  ctx.quadraticCurveTo(
    centerX + 15 * scale,
    centerY - 30 * scale,
    centerX + 10 * scale,
    centerY - 38 * scale
  );
  ctx.stroke();

  // ファイルに保存
  const buffer = canvas.toBuffer("image/png");
  const outputPath = path.join(outputDir, name);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${outputPath}`);
});

console.log("\n🎉 All icons generated successfully!");
