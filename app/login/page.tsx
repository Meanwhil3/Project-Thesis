import WoodCertifyLogo from "@/components/woodlogo";
import LoginForm from "@/components/loginform";

const Index = () => {
  return (
    <div className="min-h-screen wood-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <WoodCertifyLogo />
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
