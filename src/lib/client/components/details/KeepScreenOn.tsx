import {Sun} from "lucide-react";
import {useEffect, useId, useState} from "react";
import {Button} from "~/lib/client/components/ui/button";


export function KeepScreenOn() {
    const descriptionId = useId();
    const [enabled, setEnabled] = useState(false);
    const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
    const [status, setStatus] = useState<"idle" | "pending" | "active" | "error">("idle");

    useEffect(() => {
        if (!enabled || !supported) return;

        let disposed = false;
        let requesting = false;
        let lock: WakeLockSentinel | null = null;

        const acquire = async () => {
            if (disposed || requesting || lock || document.visibilityState !== "visible") return;

            requesting = true;

            try {
                const acquired = await navigator.wakeLock.request("screen");

                // A request can finish after toggle was switched off or page was left
                if (disposed || document.visibilityState !== "visible") {
                    void acquired.release();
                    return;
                }

                lock = acquired;
                setStatus("active");

                acquired.addEventListener("release", () => {
                    if (disposed || lock !== acquired) return;
                    lock = null;

                    if (document.visibilityState === "visible") {
                        setStatus("error");
                        setEnabled(false);
                    }
                    else {
                        setStatus("pending");
                    }
                }, { once: true });
            }
            catch {
                if (!disposed && document.visibilityState === "visible") {
                    setStatus("error");
                    setEnabled(false);
                }
            }
            finally {
                requesting = false;
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void acquire();
            }
            else {
                const previous = lock;
                lock = null;

                setStatus("pending");
                void previous?.release();
            }
        };

        void acquire();
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            disposed = true;
            document.removeEventListener("visibilitychange", onVisibilityChange);
            void lock?.release();
        };
    }, [enabled, supported]);

    return (
        <div className="mt-6 flex flex-col items-start gap-2">
            <Button
                type="button"
                disabled={!supported}
                aria-pressed={enabled}
                aria-describedby={descriptionId}
                aria-busy={status === "pending"}
                variant={status === "active" ? "secondary" : "outline"}
                onClick={() => {
                    setStatus(enabled ? "idle" : "pending");
                    setEnabled(!enabled);
                }}
            >
                <Sun data-icon="inline-start"/>
                Keep screen on
            </Button>
            <p id={descriptionId} role="status" className="text-xs text-muted-foreground">
                {!supported
                    ? <>This browser cannot keep the screen on.</>
                    : status === "error"
                        ? <>Couldn’t keep the screen on. Try again or check your device’s power settings.</>
                        : status === "active"
                            ? <>Screen stays on while this recipe is open.</>
                            : status === "pending"
                                ? <>Turning on…</>
                                : <>Prevent the screen from sleeping while you cook.</>
                }
            </p>
        </div>
    );
}
