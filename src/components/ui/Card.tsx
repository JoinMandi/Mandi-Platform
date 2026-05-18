import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}

export default function Card({
  children,
  className = "",
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={`bg-cream-soft rounded-3xl shadow-warm p-8 ${className}`}
    >
      {children}
    </Tag>
  );
}
