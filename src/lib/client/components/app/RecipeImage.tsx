import {useState} from "react";
import {Utensils} from "lucide-react";
import {cn} from "~/lib/utils/helpers";
import {useTranslation} from "react-i18next";


interface RecipeImageProps {
    alt: string;
    src: string | null;
    priority?: boolean;
    className?: string;
}


export function RecipeImage({ src, alt, priority = false, className }: RecipeImageProps) {
    const { t } = useTranslation();
    const [failedSource, setFailedSource] = useState<string | null>(null);

    return (
        <div className={cn("relative flex size-full flex-col items-center justify-center gap-3 bg-muted text-primary/45", className)}>
            <Utensils
                strokeWidth={1}
                className="size-9"
                aria-hidden="true"
            />

            <span className="font-heading text-lg italic">
                {t("ui.made-at-home")}
            </span>

            {src && src !== failedSource &&
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    onError={() => setFailedSource(src)}
                    fetchPriority={priority ? "high" : undefined}
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
            }
        </div>
    );
}
