import WoodCertifyLogo from "@/components/woodlogo";
import LoginForm from "@/components/loginform";
import { GiTreeBranch } from "react-icons/gi";

const Index = () => {
  return (
    <div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <GiTreeBranch
          className="text-green-900/5 absolute -left-40 top-0"
          size={700}
        />
        <GiTreeBranch
          className="text-green-900/5 absolute right-[-80px] bottom-[-40px] rotate-180"
          size={700}
        />
      </div>
      
    <div className="min-h-screen wood-pattern flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md ">
        <WoodCertifyLogo className="justify-center p-4"/>
        <LoginForm />
      </div>
    </div>
  </div>
  );
};

export default Index;
