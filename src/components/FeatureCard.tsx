import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "navy" | "orange" | "green";
}

const colorClasses = {
  navy: "bg-navy text-off-white",
  orange: "bg-orange text-off-white",
  green: "bg-green text-navy",
};

const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => {
  return (
    <div className={`border-4 border-black p-4 md:p-6 shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-brutal-sm transition-all ${colorClasses[color]}`}>
      <div className="mb-3 md:mb-4">
        <Icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={3} />
      </div>
      <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 uppercase">{title}</h3>
      <p className="text-sm md:text-base font-semibold opacity-90">{description}</p>
    </div>
  );
};

export default FeatureCard;
