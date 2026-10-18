"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CollapsibleDetail = ({ description, title }: { description: string, title: string }) => {
    return (
        <Collapsible>
            <CollapsibleTrigger>
                <h2 className="text-lg font-semibold">{title}</h2>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div dangerouslySetInnerHTML={{ __html: description }} />
            </CollapsibleContent>
        </Collapsible>
    );
};

export default CollapsibleDetail;