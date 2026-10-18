import { Check } from "lucide-react";

interface LegalSectionProps {
  title: string;
  content?: string;
  bullets?: string[];
}

const LegalSection: React.FC<LegalSectionProps> = ({
  title,
  content,
  bullets,
}) => {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {content && <p className="text-muted-foreground">{content}</p>}
      {bullets && (
        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
export default LegalSection;
