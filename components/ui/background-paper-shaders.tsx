"use client";

import React from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

interface BackgroundPaperShadersProps {
  children?: React.ReactNode;
  className?: string;
}

export function BackgroundPaperShaders({
  children,
  className,
}: BackgroundPaperShadersProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Mesh Gradient Background */}
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#0f172a", "#1e1b4b", "#581c87", "#ec4899"]}
        speed={0.8}
      />

      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
