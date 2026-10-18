"use client";
import EditIcon from "@/components/icons/EditIcon";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { TrashIcon } from "@radix-ui/react-icons";
import { IProduct } from "../ListItem";
import useFetch from "@/lib/hooks/use-fetch";
import ENDPOINTS from "@/lib/endpoints";
import { useParams } from "next/navigation";
import { ProductDetailsParams } from "@/app/manage/products/[product_id]/page";
import { setData } from "@/store/products/form.slice";
import { setItemToDelete } from "@/store/products/data.slice";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const dispatch = useAppDispatch();
  const { product_id } = useParams<ProductDetailsParams>();
  const { data: product, isLoading } = useFetch<IProduct>({
    endpoint: ENDPOINTS.admin.products.fetch_single(product_id),
    validate: true,
    enabledKey: product_id,
  });

  const handleEdit = () => {
    if (product) {
      dispatch(setData(product));
    }
  };

  const handleDelete = () => {
    if (product) {
      dispatch(
        setItemToDelete({
          id: product.id,
          label: product.model_name,
        }),
      );
    }
  };

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <PageHeader title={product?.model_name} className="flex-shrink-0">
      <div className={cn("flex items-center gap-2")}>
        <Button
          title="View product live"
          variant="secondary"
          size="icon"
          asChild
        >
          <Link
            target="_blank"
            href={`/${product?.slug}/${product?.product_colors?.[0]?.model_number}`}
          >
            <EyeIcon />
          </Link>
        </Button>
        <Button
          size="icon"
          type="button"
          onClick={() => handleEdit()}
          className="gap-2"
        >
          <EditIcon />
        </Button>
        <Button
          type="button"
          onClick={() => handleDelete()}
          variant="destructive"
          size="icon"
          className="gap-2"
        >
          <TrashIcon className="size-6" />
        </Button>
      </div>
    </PageHeader>
  );
};
export default Header;
