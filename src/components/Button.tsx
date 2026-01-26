import Link from "next/link";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline" | "outline-light";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  title?: string;
}

const variantStyles = {
  primary: "bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  outline:
    "bg-white text-amber-600 border-2 border-amber-600 hover:bg-amber-50 disabled:border-amber-300 disabled:text-amber-300",
  "outline-light":
    "bg-transparent text-white border-2 border-white hover:bg-white/20 disabled:border-white/50 disabled:text-white/50",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  href,
  onClick,
  variant = "primary",
  size = "md",
  children,
  disabled = false,
  type = "button",
  className = "",
  title,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed";
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styles}
      title={title}
    >
      {children}
    </button>
  );
}
