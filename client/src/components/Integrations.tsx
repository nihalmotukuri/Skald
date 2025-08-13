"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { CiHome, CiCalendar, CiTimer, CiUser } from "react-icons/ci"
import { SlNotebook } from "react-icons/sl";
import { BsLightningChargeFill } from "react-icons/bs";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className,
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

const Integrations = ({
    className,
}: {
    className?: string;
}) => {
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
            className={cn(
                "relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10",
                className,
            )}
            ref={containerRef}
        >
            <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
                <div className="flex flex-col justify-center">
                    <Circle ref={div7Ref} className=" bg-neutral-900">
                        <Icons.user />
                    </Circle>
                </div>
                <div className="flex flex-col justify-center">
                    <Circle ref={div6Ref} className="size-16 bg-neutral-900">
                        <Icons.openai />
                    </Circle>
                </div>
                <div className="flex flex-col justify-center gap-2">
                    <Circle ref={div1Ref} className="size-10 bg-neutral-900">
                        <Icons.googleDrive />
                    </Circle>
                    <Circle ref={div2Ref} className="size-10  bg-neutral-900">
                        <Icons.googleDocs /> 
                    </Circle> 
                    <Circle ref={div3Ref} className="size-10  bg-neutral-900">
                        <Icons.whatsapp /> 
                    </Circle> 
                    <Circle ref={div4Ref} className="size-10  bg-neutral-900">
                        <Icons.messenger />
                    </Circle>
                    <Circle ref={div5Ref} className="size-10  bg-neutral-900">
                        <Icons.notion />
                    </Circle>
                </div>
            </div>

            {/* AnimatedBeams */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div6Ref}
                duration={3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div6Ref}
                duration={3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div6Ref}
                duration={3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={div6Ref}
                duration={3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={div6Ref}
                duration={3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div7Ref}
                duration={3}
            />
        </div>
    );
}

const Icons = {
    notion: () => (
        <BsLightningChargeFill />
    ),
    openai: () => (
        <img width={100} height={100} src="/images/logo.png" />
    ),
    googleDrive: () => (
        <CiHome />
    ),
    whatsapp: () => (
        <CiCalendar />
    ),
    googleDocs: () => (
        <CiTimer />
    ),
    zapier: () => (
        <SlNotebook />
    ),
    messenger: () => (
        <SlNotebook />

    ),
    user: () => (
        <CiUser />
    ),
};

export default Integrations