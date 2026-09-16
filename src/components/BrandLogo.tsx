import logo from "../../assets/images/logo.png";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <img src={logo} alt="SafeTrail AI" className={className} />;
}
