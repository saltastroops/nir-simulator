import { PropsWithChildren } from "react";

interface Props {
  remove: () => void;
}

export default function SpectrumForm({
  remove,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="border border-gray-200 p-2 mt-3">
      {children}
      <span className="hover:cursor-pointer text-red-500" onClick={remove}>
        Delete
      </span>
    </div>
  );
}
