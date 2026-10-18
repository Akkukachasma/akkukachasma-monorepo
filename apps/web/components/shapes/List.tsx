"use client";
import ListItem from "./ListItem";
import useItems from "@/lib/queries/admin/shapes/useItems";

const List = () => {
  const { data, isLoading } = useItems({ completeFetch: true });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data?.map((d) => {
        return <ListItem key={d.id} data={d} />;
      })}
    </div>
  );
};

export default List;
