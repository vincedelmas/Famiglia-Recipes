import * as React from "react";
import {useState} from "react";
import {cn} from "~/lib/utils/helpers";
import {LoaderCircle} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";


interface FormButtonProps extends React.ComponentProps<typeof Button> {
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: () => Promise<void> | void;
}


export const FormButton = ({ children, disabled = false, onClick, className, ...props }: FormButtonProps) => {
    const [isPending, setIsPending] = useState(false);

    const handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            setIsPending(true);
            ev.preventDefault();
            try {
                await onClick();
            }
            finally {
                setIsPending(false);
            }
        }
    };

    return (
        <Button
            type="submit"
            onClick={handleClick}
            disabled={disabled || isPending}
            className={cn(className ? className : "w-full", className)}
            {...props}
        >
            {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>}
            {children}
        </Button>
    );
};
