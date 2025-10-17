import { TreePine } from "lucide-react";

const WoodCertifyLogo = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2">
        <TreePine className="w-8 h-8 text-brand-green" />
        <span className="text-2xl font-semibold text-foreground">WoodCertify</span>
      </div>
    </div>
  );
};

export default WoodCertifyLogo;