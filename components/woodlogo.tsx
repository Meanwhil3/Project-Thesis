import { TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

interface WoodCertifyLogoProps {
  className?: string;
}

const WoodCertifyLogo = ({ className }: WoodCertifyLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TreePine className="w-8 h-8 text-brand-green" />
      <span className="text-2xl font-semibold text-foreground">
        WoodCertify
      </span>
    </div>
  );
};

export default WoodCertifyLogo;
