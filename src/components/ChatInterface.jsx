// Message formatting components
const BoldText = ({ text }) => (
  <p className="font-bold mb-2">{text.replace(/^\*\*|\*\*$/g, '')}</p>
);

const BulletList = ({ title, items }) => (
  <div className="space-y-2">
    {title && <p className="font-semibold">{title}</p>}
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start space-x-2">
          <span className="text-sky-500 mt-1">•</span>
          <span>{item.replace(/^[-•]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SupplementInfo = ({ title, details }) => (
  <div className="space-y-2">
    <p className="font-semibold">{title}</p>
    <div className="pl-4 space-y-1">
      {details.map((detail, i) => (
        <p key={i} className="flex items-start space-x-2">
          {detail.includes(':') ? (
            <>
              <span className="text-sky-500">•</span>
              <span>
                <span className="font-medium">{detail.split(':')[0]}:</span>
                {detail.split(':')[1]}
              </span>
            </>
          ) : (
            <span>{detail}</span>
          )}
        </p>
      ))}
    </div>
  </div>
);

const formatMessageContent = (content) => {
  const sections = content.split('\n\n').filter(Boolean);
  
  return sections.map((section, index) => {
    // Bold text
    if (section.startsWith('**') && section.endsWith('**')) {
      return <BoldText key={index} text={section} />;
    }
    
    // Bullet list
    if (section.includes('\n-') || section.includes('\n•')) {
      const [title, ...items] = section.split('\n').filter(Boolean);
      return <BulletList key={index} title={title} items={items} />;
    }
    
    // Supplement info
    if (section.toLowerCase().includes('supplement') || section.includes(':')) {
      const [title, ...details] = section.split('\n');
      return <SupplementInfo key={index} title={title} details={details} />;
    }
    
    // Regular paragraph
    return <p key={index} className="mb-2">{section}</p>;
  });
}; 