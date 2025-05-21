import { forwardRef, useState, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const notificationVariants = cva(
  "fixed right-0 top-16 mr-4 mt-4 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "ring-primary-200 bg-white",
        success: "ring-green-200 bg-white",
        error: "ring-red-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title: string;
  message: string;
  onClose?: () => void;
  duration?: number;
  visible?: boolean;
}

const Notification = forwardRef<HTMLDivElement, NotificationProps>(
  ({ variant, title, message, onClose, duration = 3000, visible = false, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
      setIsVisible(visible);
      
      if (visible && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }, [visible, duration, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          notificationVariants({ variant }),
          "animate-in fade-in",
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {variant === "success" ? (
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              ) : variant === "error" ? (
                <AlertCircle className="h-6 w-6 text-red-400" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-primary-400" />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Notification.displayName = "Notification";

export { Notification };
