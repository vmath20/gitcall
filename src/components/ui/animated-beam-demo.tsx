"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";
import { 
  FileText, 
  Bot, 
  HardDrive, 
  MessageCircle, 
  Slack, 
  Zap, 
  Github,
  GitBranch 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[600px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex size-full flex-col max-w-2xl max-h-[400px] items-stretch justify-between gap-16">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Image src="/logo/vapi.svg" alt="Vapi" width={48} height={48} unoptimized />
          </Circle>
          <Circle ref={div5Ref}>
            <Image src="/logo/slack.png" alt="Slack" width={48} height={48} unoptimized />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Image src="/logo/github.svg" alt="GitHub" width={48} height={48} unoptimized />
          </Circle>
          <Circle ref={div4Ref} className="size-24">
            <Image src="/logo/TransparentLogo.png" alt="GitCall" width={128} height={128} unoptimized />
          </Circle>
          <Circle ref={div6Ref}>
            <Image src="/logo/gmail.png" alt="Gmail" width={48} height={48} unoptimized />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Image src="/logo/coderabbit.png" alt="CodeRabbit" width={48} height={48} unoptimized />
          </Circle>
          <Circle ref={div7Ref}>
            <Image src="/logo/microsoft.png" alt="Microsoft" width={48} height={48} unoptimized />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
      />
    </div>
  );
} 