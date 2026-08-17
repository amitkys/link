"use client";

import { Toaster } from "sonner";

export function CustomeToast() {
    return (
        <Toaster
            closeButton
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: "!font-mono !font-bold !border !shadow-lg !rounded-xl",
                    success: "!bg-emerald-600 !text-white !border-emerald-600",
                    title: "!font-bold",
                    error: "!bg-rose-600 !text-white !border-rose-600",
                    info: "!bg-sky-600 !text-white !border-sky-600",
                    warning: "!bg-amber-600 !text-white !border-amber-600",
                },
            }
            }
        />
    );
}