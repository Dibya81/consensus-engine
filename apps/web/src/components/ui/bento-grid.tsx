import { cn } from "@/lib/utils";
import React from "react";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[16rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-[2rem] group/bento hover:shadow-2xl transition duration-500 shadow-none p-6 justify-between flex flex-col space-y-4",
                "glass-card glow-border preserve-3d float-card relative overflow-hidden",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/bento:opacity-100 transition duration-500 z-0" />
            <div className="relative z-10 w-full mb-2">{header}</div>
            <div className="relative z-10 group-hover/bento:-translate-y-1 transition duration-500">
                <div className="mb-3">{icon}</div>
                <div className="font-bold text-zinc-100 text-lg mb-1 tracking-wide">
                    {title}
                </div>
                <div className="font-normal text-zinc-400 text-sm">
                    {description}
                </div>
            </div>
        </div>
    );
};
