import Image from "next/image";
import { Invoice, InvoiceItem } from "../queries/useGetInvoice";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

interface InvoiceHeaderProps {
    invoiceNumber: string;
    invoice: Invoice;
    activeInvoiceItems: InvoiceItem[];
    isLineSpecifications?: boolean;
}
const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoiceNumber, invoice, activeInvoiceItems, isLineSpecifications = false }) => {
    return (
        <div className="border-b px-3 py-2.5">
            <div className="grid grid-cols-12 items-start gap-2">
                {/* Left Column - Order Information */}
                <div className={cn("col-span-4 space-y-0.5 text-[9px]", isLineSpecifications && "flex h-full items-center")}>
                    <p className="flex flex-wrap items-baseline gap-x-1">
                        <span className="font-medium">Invoice:</span>
                        <strong className="tabular-nums">{invoiceNumber}</strong>
                        {isLineSpecifications && <span className="text-muted-foreground">Invoice line specifications</span>}
                    </p>
                    {!isLineSpecifications && (
                        <>
                            <p className="flex flex-wrap items-baseline gap-x-1">
                                <span className="font-medium">Order:</span>
                                <strong className="break-all text-muted-foreground font-normal">
                                    {invoice.order.id}
                                </strong>
                            </p>
                            <p>
                                <span className="font-medium">Date:</span>{" "}
                                {dayjs(invoice.order.created_at || new Date()).format(
                                    "DD/MM/YYYY",
                                )}
                            </p>
                            <p>
                                <span className="font-medium">Qty:</span>{" "}
                                {activeInvoiceItems.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0,
                                )}
                            </p>
                        </>
                    )}
                </div>

                {/* Middle Column - Company Details */}
                <div className="h-full grid place-content-center col-span-6">
                    <Image
                        src="/Logo.png"
                        alt="Akku Ka Chasma"
                        width={250}
                        height={180}
                        className="object-contain object-left dark:invert"
                        priority
                    />
                </div>

                {/* Right Column - Shipment Code */}
                <div className="col-span-2 text-center">
                    <div className="mb-0.5 text-3xl font-bold leading-none tabular-nums tracking-tight">
                        {invoiceNumber?.split("/")[2]}
                    </div>
                    <Badge variant="outline" className="h-4 px-1.5 text-[8px]">
                        Prepaid
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default InvoiceHeader;