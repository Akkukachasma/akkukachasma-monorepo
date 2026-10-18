import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InquiryProps {
  inquiry?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    message?: string;
    source: "contact_us" | "product_page" | "blog" | "other";
    created_at: string;
    updated_at: string;
  };
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const getSourceBadgeVariant = (source: string) => {
  switch (source) {
    case "contact_us":
      return "default";
    case "product_page":
      return "secondary";
    case "blog":
      return "outline";
    case "other":
      return "destructive";
    default:
      return "default";
  }
};

const getSourceLabel = (source: string) => {
  switch (source) {
    case "contact_us":
      return "Contact Us";
    case "product_page":
      return "Product Page";
    case "blog":
      return "Blog";
    case "other":
      return "Other";
    default:
      return source;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Inquiry: React.FC<InquiryProps> = ({ inquiry, onDelete, loading }) => {
  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!inquiry) return null;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">
                {inquiry.first_name} {inquiry.last_name}
              </h3>
              <Badge variant={getSourceBadgeVariant(inquiry.source)}>
                {getSourceLabel(inquiry.source)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {inquiry.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {inquiry.phone}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(inquiry.created_at)}
              </div>
            </div>
            {inquiry.message && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {inquiry.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inquiry Details</DialogTitle>
                  <DialogDescription>
                    Full details of the inquiry from {inquiry.first_name}{" "}
                    {inquiry.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Contact Information</h4>
                    <p>
                      <strong>Name:</strong> {inquiry.first_name}{" "}
                      {inquiry.last_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {inquiry.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {inquiry.phone}
                    </p>
                    <p>
                      <strong>Source:</strong> {getSourceLabel(inquiry.source)}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(inquiry.created_at)}
                    </p>
                  </div>
                  {inquiry.message && (
                    <div>
                      <h4 className="font-semibold">Message</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {inquiry.message}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this inquiry? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete?.(inquiry.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Inquiry;
