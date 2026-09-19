import type {ReactNode} from "react";


interface PageTitleProps {
    title: string;
    subtitle?: ReactNode;
    onlyHelmet?: boolean;
    children: ReactNode;
}


export const PageTitle = ({ children, title, subtitle, onlyHelmet = false }: PageTitleProps) => {
    return (
        <>
            <title>{`${title} · Famiglia`}</title>

            {onlyHelmet ?
                children
                :
                <div className="page-enter pb-4 pt-10 sm:pt-14">
                    <header className="mb-9 flex flex-col gap-3">
                        <p className="eyebrow">
                            Family recipes
                        </p>
                        <h1 className="page-heading">
                            {title}
                        </h1>
                        {subtitle &&
                            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {subtitle}
                            </p>
                        }
                    </header>
                    {children}
                </div>
            }
        </>
    );
};
